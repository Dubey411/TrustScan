import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Scan from '../../models/Scan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEIGHTS_FILE = path.join(__dirname, '..', '..', 'data', 'weights.json');
const BACKUP_DIR = path.join(__dirname, '..', '..', 'data', 'backups');
const TRUST_DB_FILE = path.join(__dirname, '..', '..', 'data', 'entityTrustDatabase.json');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

/**
 * Self-Learning Feedback Loop (SLFL)
 * Adjusts fraud signal weights based on real user feedback without heavy ML.
 */
export async function optimizeWeightsFromFeedback() {
    console.log("🔄 [Self-Learning] Starting Feedback Optimization Loop...");
    
    try {
        // 1. GATHER FEEDBACK TRIGGERS
        const recentFeedback = await Scan.find({
            userFeedback: { $in: ['incorrect_safe', 'incorrect_fraud'] },
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        });

        // --- PART A: ENTITY TRUST OPTIMIZATION ---
        if (fs.existsSync(TRUST_DB_FILE)) {
            const trustDb = JSON.parse(fs.readFileSync(TRUST_DB_FILE, 'utf8'));
            let modified = false;

            recentFeedback.forEach(scan => {
                // If it's a false negative (we said safe, user said fraud)
                if (scan.userFeedback === 'incorrect_fraud') {
                    const content = scan.content?.toLowerCase() || "";
                    
                    // Check if any greylist entity is in the content
                    trustDb.greylist.forEach(entity => {
                        if (content.includes(entity.name.toLowerCase())) {
                            entity.userReports = (entity.userReports || 0) + 1;
                            entity.hitCount = (entity.hitCount || 0) + 1;
                            modified = true;
                            
                            // PROMOTION LOGIC: If a greylist entity gets 5 reports, move to blacklist
                            if (entity.userReports >= 5) {
                                console.log(`🚀 [Trust DB] Promoting ${entity.name} from Greylist to Blacklist due to community reports.`);
                                trustDb.blacklist.push({
                                    name: entity.name,
                                    type: `Auto-Blacklisted (${entity.type})`,
                                    addedAt: new Date().toISOString().split('T')[0],
                                    category: 'red_flag'
                                });
                                trustDb.greylist = trustDb.greylist.filter(g => g.name !== entity.name);
                            }
                        }
                    });
                }
            });

            if (modified) {
                fs.writeFileSync(TRUST_DB_FILE, JSON.stringify(trustDb, null, 4));
            }
        }

        if (recentFeedback.length < 3) { // Lowered threshold for local development
            console.log("ℹ️ [Self-Learning] Insufficient feedback triggers. Skipping weight optimization.");
            return;
        }

        // --- PART B: WEIGHT ADJUSTMENT LOGIC ---
        // --- PART B: WEIGHT ADJUSTMENT LOGIC (With Conflict Resolution) ---
        const weights = JSON.parse(fs.readFileSync(WEIGHTS_FILE, 'utf8'));
        const learningRate = 0.05;
        
        // 1. Group Feedback to Resolve Conflicts
        const signalVotes = {}; // { signalName: { up: 0, down: 0 } }

        recentFeedback.forEach(scan => {
            const isMissedFraud = scan.userFeedback === 'incorrect_fraud'; 
            const isFalseAlarm = scan.userFeedback === 'incorrect_safe';  
            
            // Weighting: We trust 'Missed Fraud' reports slightly more (Safety Bias) to stay conservative
            // Future Info: Ideally use User Trust Score here (e.g. scan.userTrustScore)
            const voteWeight = 1.0; 

            for (const [signal, value] of Object.entries(scan.signals || {})) {
                if (value > 0 && weights.signals[signal] !== undefined) {
                    if (!signalVotes[signal]) signalVotes[signal] = { increaseRisk: 0, decreaseRisk: 0 };
                    
                    if (isMissedFraud) {
                        signalVotes[signal].increaseRisk += (voteWeight * 1.25); // 25% Bias for Safety
                    } else if (isFalseAlarm) {
                        signalVotes[signal].decreaseRisk += voteWeight;
                    }
                }
            }
        });

        // 2. Apply "The Winner Takes It All" Logic
        for (const [signal, votes] of Object.entries(signalVotes)) {
            const netScore = votes.increaseRisk - votes.decreaseRisk;
            
            // CONFLICT RESOLUTION THRESHOLD
            // If the difference is small (< 1.0), it's a draw. Do nothing (Stability Preserved).
            if (Math.abs(netScore) < 1.0) {
                console.log(`⚖️ [Conflict] Signal '${signal}' is disputed (Fraud: ${votes.increaseRisk.toFixed(1)} vs Safe: ${votes.decreaseRisk.toFixed(1)}). Action: NO CHANGE.`);
                continue;
            }

            if (netScore > 0) {
                // Fraud Voters Won
                weights.signals[signal] += learningRate;
                console.log(`📈 [Learning] Signal '${signal}' risk INCREASED (Winner: Fraud Voters).`);
            } else {
                // Safe Voters Won
                weights.signals[signal] -= learningRate;
                console.log(`📉 [Learning] Signal '${signal}' risk DECREASED (Winner: Safe Voters).`);
            }
        }

        // 3. Clamp Weights
        for (const [signal, value] of Object.entries(weights.signals)) {
            weights.signals[signal] = Math.max(-3, Math.min(3, value));
        }

        fs.writeFileSync(WEIGHTS_FILE, JSON.stringify(weights, null, 2));
        console.log(`✅ [Self-Learning] Optimization Complete. Trust Database Updated and Weights refined.`);
        return true;
    } catch (err) {
        console.error("❌ [Self-Learning] Optimization Failed:", err);
        return false;
    }
}
