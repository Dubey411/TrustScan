import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Scan from '../../models/Scan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'entityTrustDatabase.json');

// Thresholds (Weighted Score)
const GREYLIST_THRESHOLD = 3.0; 
const BLACKLIST_THRESHOLD = 6.0;

// GUARDRAIL: Only these specific proven fraud signals allow for Auto-Blacklisting.
// Mere "Risk Score" is not enough. We need intent.
const CONFIRMATION_TRIGGERS = [
    "Pay-to-Work", 
    "Hidden Fees", 
    "Security Deposit", 
    "Predatory/Scam Job Pattern",
    "Money Laundering",
    "Fake Domain"
];

/**
 * Auto-Learning Entity Service (Safe Mode)
 * Scans recent fraud reports to identify and blacklist repeating offenders automatically.
 * Includes Anti-Poisoning Guardrails.
 */
export async function runEntityLearning() {
    console.log('🕵️ [EntityLearner] Starting Auto-Discovery (Safe Mode)...');
    
    try {
        // 1. Fetch recent high-risk scans
        const recentScans = await Scan.find({
            status: { $in: ['fraud', 'scam', 'risky'] },
            createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).select('reasons content userId isGuest');

        // Map: Name -> Weighted Score
        const candidateScores = {};
        const candidateEvidence = {}; // Store *why* we are banning them
        
        // 2. Extract and Validate
        recentScans.forEach(scan => {
            if (!scan.reasons) return;

            // GUARDRAIL 1: Signal Corroboration
            // Does this specific scan contain a "Smoking Gun" (Financial/Predatory intent)?
            const hasSmokingGun = scan.reasons.some(r => 
                CONFIRMATION_TRIGGERS.some(trigger => r.includes(trigger))
            );

            if (!hasSmokingGun) {
                // Ignore this report for auto-learning. It's too generic (might just be a bad resume).
                return;
            }

            // GUARDRAIL 2: User Weighting
            const userWeight = scan.isGuest ? 0.5 : 1.0; 
            const uid = scan.userId || `guest_${scan._id}`; 
            
            scan.reasons.forEach(reason => {
                if (reason.includes("Suspicious Entity Association")) {
                    const match = reason.match(/unverified entity "([^"]+)"/);
                    if (match && match[1]) {
                        const name = match[1].trim();
                        if (name.length > 3 && scan.content.toLowerCase().includes(name.toLowerCase())) {
                            if (!candidateScores[name]) {
                                candidateScores[name] = 0;
                                candidateEvidence[name] = new Set();
                            }
                            // We simply sum weights here. A more complex system would track unique UIDs to prevent spamming.
                            // For this MVP, we rely on the implementation assuming 'recentScans' are distinct enough or handled upstream.
                            // To be safer, we should use a Set of UIDs per name like before, but sum their weights.
                        }
                    }
                }
            });
            
            // Re-loop to apply weights correctly to the *Users* map (logic correction)
        });

        // Correct Aggregation Logic with Unique User Tracking
        const candidateUserWeights = {}; // Name -> { uid -> weight }

        recentScans.forEach(scan => {
            if (!scan.reasons) return;
            const hasSmokingGun = scan.reasons.some(r => CONFIRMATION_TRIGGERS.some(trigger => r.includes(trigger)));
            if (!hasSmokingGun) return;

            const uid = scan.userId || `guest_${scan._id}`;
            const weight = scan.isGuest ? 0.3 : 1.0; // Lower guest weight

            scan.reasons.forEach(reason => {
                if (reason.includes("Suspicious Entity Association")) {
                    const match = reason.match(/unverified entity "([^"]+)"/);
                    if (match && match[1]) {
                        const name = match[1].trim();
                        if (!candidateUserWeights[name]) candidateUserWeights[name] = new Map();
                        candidateUserWeights[name].set(uid, weight);
                    }
                }
            });
        });


        // 3. Process Candidates against Thresholds
        const existingDB = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        const existingBlacklist = new Set(existingDB.blacklist.map(i => i.name.toLowerCase()));
        const existingGreylist = new Set(existingDB.greylist.map(i => i.name.toLowerCase()));
        
        const updates = { blacklisted: [], greylisted: [], promoted: [] };
        let dbChanged = false;

        for (const [name, userMap] of Object.entries(candidateUserWeights)) {
            // Calculate Total Score Sum
            let totalScore = 0;
            userMap.forEach(weight => totalScore += weight);
            
            const lowerName = name.toLowerCase();
            
            // A. Check for Blacklist Promotion (High Confidence)
            if (totalScore >= BLACKLIST_THRESHOLD) {
                if (!existingBlacklist.has(lowerName)) {
                    if (existingGreylist.has(lowerName)) {
                        existingDB.greylist = existingDB.greylist.filter(g => g.name.toLowerCase() !== lowerName);
                        updates.promoted.push(name);
                    } else {
                        updates.blacklisted.push(name);
                    }
                    
                    existingDB.blacklist.push({
                        name: name,
                        type: "Auto-Detected (Financial Fraud Pattern)",
                        addedAt: new Date().toISOString().split('T')[0],
                        category: "red_flag",
                        autoLearned: true,
                        trustScore: totalScore
                    });
                    existingBlacklist.add(lowerName);
                    dbChanged = true;
                    console.log(`🚨 [EntityLearner] CONFIRMED THREAT: "${name}" (Score: ${totalScore}). Action: Blacklist.`);
                }
            } 
            // B. Check for Greylist (Emerging)
            else if (totalScore >= GREYLIST_THRESHOLD) {
                if (!existingBlacklist.has(lowerName) && !existingGreylist.has(lowerName)) {
                    existingDB.greylist.push({
                        name: name,
                        type: "Emerging Suspicious Entity",
                        addedAt: new Date().toISOString().split('T')[0],
                        category: "grey_list",
                        autoLearned: true,
                        trustScore: totalScore
                    });
                    existingGreylist.add(lowerName);
                    updates.greylisted.push(name);
                    dbChanged = true;
                    console.log(`⚠️ [EntityLearner] SUSPICIOUS ACTIVITY: "${name}" (Score: ${totalScore}). Action: Greylist.`);
                }
            }
        }

        // 4. Update Database
        if (dbChanged) {
            fs.writeFileSync(DB_PATH, JSON.stringify(existingDB, null, 4));
            console.log(`✅ [EntityLearner] Sync Complete. Blacklisted: ${updates.blacklisted.length}, Promoted: ${updates.promoted.length}, Greylisted: ${updates.greylisted.length}`);
            return updates;
        } else {
            console.log('✅ [EntityLearner] No actionable entity trends found.');
            return { added: 0, names: [] };
        }

    } catch (e) {
        console.error("❌ [EntityLearner] Failed:", e);
        return { error: e.message };
    }
}
