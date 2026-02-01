import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Scan from '../models/Scan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEIGHTS_FILE = path.join(__dirname, 'weights.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

/**
 * Self-Learning Feedback Loop (SLFL)
 * Adjusts fraud signal weights based on real user feedback without heavy ML.
 */
export async function optimizeWeightsFromFeedback() {
    console.log("🔄 [Self-Learning] Starting Feedback Optimization Loop...");
    
    try {
        // 1. GATHER FEEDBACK TRIGGERS
        // We only learn from 'incorrect_safe' (False Negatives) and 'incorrect_fraud' (False Positives)
        const recentFeedback = await Scan.find({
            userFeedback: { $in: ['incorrect_safe', 'incorrect_fraud'] },
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });

        if (recentFeedback.length < 5) {
            console.log("ℹ️ [Self-Learning] Insufficient feedback triggers (<5). Skipping optimization.");
            return;
        }

        // 2. LOAD CURRENT WEIGHTS (Champion)
        const weights = JSON.parse(fs.readFileSync(WEIGHTS_FILE, 'utf8'));
        
        // Safety: Backup current weights before modification
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        fs.writeFileSync(path.join(BACKUP_DIR, `weights_${timestamp}.json`), JSON.stringify(weights, null, 2));

        // 3. WEIGHT ADJUSTMENT LOGIC (Do-No-Harm)
        // Adjustment factor: 0.05 (Aggressively small to maintain stability)
        const learningRate = 0.05;

        recentFeedback.forEach(scan => {
            const isFalseNegative = scan.userFeedback === 'incorrect_fraud'; // System said safe, user said fraud
            const isFalsePositive = scan.userFeedback === 'incorrect_safe';  // System said fraud, user said safe

            // Adjust signal weights inside the scan
            for (const [signal, value] of Object.entries(scan.signals || {})) {
                if (value > 0 && weights.signals[signal] !== undefined) {
                    if (isFalseNegative) {
                        // We missed it! Increase the signal's contribution to risk.
                        weights.signals[signal] += learningRate;
                    } else if (isFalsePositive) {
                        // We were too aggressive! Decrease the signal's contribution.
                        weights.signals[signal] -= learningRate;
                    }
                }
            }
        });

        // 4. GUARDRAILS & CLAMPING
        // Ensure no weight goes above 3.0 or below -3.0 to prevent "infinite risk" loops
        for (const [signal, value] of Object.entries(weights.signals)) {
            weights.signals[signal] = Math.max(-3, Math.min(3, value));
        }

        // 5. ROLLBACK MECHANISM
        // If the new weights result in an explainability loss (already handled by mlManager/train scripts)
        // Here we just save the refined weights
        fs.writeFileSync(WEIGHTS_FILE, JSON.stringify(weights, null, 2));
        
        console.log(`✅ [Self-Learning] Optimization Complete. ${recentFeedback.length} signals integrated into Weights.`);
        return true;
    } catch (err) {
        console.error("❌ [Self-Learning] Optimization Failed:", err);
        return false;
    }
}
