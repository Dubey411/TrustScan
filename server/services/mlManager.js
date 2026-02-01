import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import Scan from '../models/Scan.js';
import { fileURLToPath } from 'url';
import { optimizeWeightsFromFeedback } from './feedbackOptimizer.js';

/**
 * =========================================================================================
 * TRUSTSCAN AI CORE MISSION
 * "This system must prioritize stability, user trust, and reversibility over rapid or aggressive learning."
 * =========================================================================================
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATUS_FILE = path.join(process.cwd(), 'services', 'mlStatus.json');

/**
 * Loads the last trained stats from the local JSON file.
 */
function loadStatus() {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
        }
    } catch (err) {
        console.error('Error loading ML status:', err);
    }
    return { lastTrainedScanCount: 0, lastTrainedFeedbackCount: 0, lastTrainedWrongCount: 0 };
}

/**
 * Saves current stats to mark a successful training event.
 */
function saveStatus(stats) {
    try {
        fs.writeFileSync(STATUS_FILE, JSON.stringify(stats, null, 4));
    } catch (err) {
        console.error('Error saving ML status:', err);
    }
}

/**
 * Triggers the Python training script.
 */
export async function runMLTraining(reason = "manual") {
    return new Promise((resolve, reject) => {
        console.log(`🧠 [ML Manager] Starting Background Retraining (Reason: ${reason})...`);
        
        const scriptPath = path.join(__dirname, '..', 'scripts', 'train_layer1.py');
        const venvPythonPath = process.platform === 'win32' ? 'python' : 'python3';
        
        // Pass reason as argument, usually enclosed in quotes to handle spaces
        exec(`"${venvPythonPath}" "${scriptPath}" "${reason}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`[ML Manager] Training Failed: ${error.message}`);
                return reject(error);
            }
            if (stderr) console.warn(`[ML Manager] STDERR: ${stderr}`);
            
            console.log(`[ML Manager] Training Complete: ${stdout}`);
            resolve(stdout);
        });
    });
}

/**
 * Checks if any of the CALM triggers are met.
 */
export async function checkTriggersAndTrain() {
    try {
        const currentStatus = loadStatus();

        // 0. Cooldown Check (24-hour lockout)
        if (currentStatus.lastTrainingDate) {
            const lastTrain = new Date(currentStatus.lastTrainingDate).getTime();
            const now = Date.now();
            const hoursSinceLastTrain = (now - lastTrain) / (1000 * 60 * 60);
            
            if (hoursSinceLastTrain < 24) {
                console.log(`⏳ [ML Manager] Cooldown Active (${Math.round(24 - hoursSinceLastTrain)}h remaining). Skipping check.`);
                return;
            }
        }

        // 1. Get current stats from DB
        const prodQuery = { source: { $ne: 'kaggle_import' } };
        const feedbackQuery = { ...prodQuery, userFeedback: { $ne: null } };
        const wrongQuery = { ...feedbackQuery, userFeedback: { $in: ['incorrect_safe', 'incorrect_fraud'] } };

        const totalScans = await Scan.countDocuments(prodQuery);
        const totalFeedback = await Scan.countDocuments(feedbackQuery);
        const wrongAnswers = await Scan.countDocuments(wrongQuery);

        const newFeedback = totalFeedback - (currentStatus.lastTrainedFeedbackCount || 0);
        const wrongRate = totalFeedback > 0 ? (wrongAnswers / totalFeedback) : 0;

        console.log(`🕵️ [ML Manager] Production Stats: Total Feedback=${totalFeedback}, Wrong Rate=${(wrongRate * 100).toFixed(1)}%, New Feedback=${newFeedback}`);

        // 2. Evaluate Trigger Conditions
        let shouldTrain = false;
        let reason = "";
        let mode = "normal";

        // PANIC SPIKE DETECTION
        // If >40% of recent feedback is 'incorrect_fraud', users are panicking or we are under attack.
        const recentFraudRatio = newFeedback > 0 ? (wrongAnswers / newFeedback) : 0;
        
        if (newFeedback >= 20 && recentFraudRatio > 0.40) {
             shouldTrain = true;
             mode = "calm_mode";
             reason = `Calm Mode Activated (Panic detection: ${(recentFraudRatio*100).toFixed(1)}% error rate)`;
        } 
        else if (newFeedback >= 50 && wrongRate >= 0.20) {
            shouldTrain = true;
            reason = `High Confidence Signal (New Feedback: ${newFeedback}, Wrong Rate: ${(wrongRate * 100).toFixed(1)}%)`;
        }

        if (shouldTrain) {
            console.log(`[ML Manager] ${reason} - Triggering CALM retraining.`);
            const output = await runMLTraining(mode);
            
            // Only activate 24h cooldown if deployment was actually successful
            if (output && output.includes("Promotion Successful")) {
                saveStatus({
                    lastTrainedScanCount: totalScans,
                    lastTrainedFeedbackCount: totalFeedback,
                    lastTrainedWrongCount: wrongAnswers,
                    lastTrainingDate: new Date().toISOString()
                });
                console.log('🔒 [ML Manager] Deployment Successful. 24h Cooldown Activated.');
            } else {
                console.log('⚠️ [ML Manager] Deployment Blocked/Failed. Cooldown NOT activated (will retry next check).');
            }
        }
    } catch (err) {
        console.error('[ML Manager] CALM Check Failed:', err);
    }
}

/**
 * Starts the background automation.
 */
export async function initializeMLAutomation() {
    console.log('[ML Manager] Scheduled background check initialized (Hourly).');
    
    // Cold Start Protection: If database is empty, run bootstrap
    try {
        const prodCount = await Scan.countDocuments({ source: { $ne: 'kaggle_import' } });
        if (prodCount === 0) {
            console.log('❄️ [ML Manager] Cold Start Detected (Empty DB). Triggering Bootstrap...');
            const scriptPath = path.join(__dirname, '..', 'scripts', 'bootstrap_ml.py');
            const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
            
            exec(`"${pythonPath}" "${scriptPath}"`, (err, stdout) => {
                if (err) console.error('[ML Manager] Bootstrap failed:', err);
                else console.log('[ML Manager] Bootstrap successful:', stdout);
            });
        }
    } catch (err) {
        console.error('[ML Manager] Startup check failed:', err);
    }

    checkTriggersAndTrain();

    // 1. Heavy ML Retraining (Hourly check, but limited by 24h cooldown)
    cron.schedule('0 * * * *', () => {
        console.log('[ML Manager] Periodic threshold check...');
        checkTriggersAndTrain();
    });

    // 2. Self-Learning Feedback Loop (Every 4 hours, no cooldown)
    cron.schedule('0 */4 * * *', async () => {
        console.log('🔄 [ML Manager] Running Self-Learning Feedback Optimizer...');
        await optimizeWeightsFromFeedback();
    });
}
