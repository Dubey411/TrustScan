import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import Scan from '../models/Scan.js';
import { fileURLToPath } from 'url';

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
export async function runMLTraining() {
    return new Promise((resolve, reject) => {
        console.log('🧠 [ML Manager] Starting Background Retraining...');
        
        const scriptPath = path.join(__dirname, '..', 'scripts', 'train_layer1.py');
        const venvPythonPath = process.platform === 'win32' ? 'python' : 'python3';
        
        exec(`"${venvPythonPath}" "${scriptPath}"`, (error, stdout, stderr) => {
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

        if (newFeedback >= 50 && wrongRate >= 0.20) {
            shouldTrain = true;
            reason = `High Confidence Signal (New Feedback: ${newFeedback}, Wrong Rate: ${(wrongRate * 100).toFixed(1)}%)`;
        }

        if (shouldTrain) {
            console.log(`[ML Manager] ${reason} - Triggering CALM retraining.`);
            await runMLTraining();
            
            saveStatus({
                lastTrainedScanCount: totalScans,
                lastTrainedFeedbackCount: totalFeedback,
                lastTrainedWrongCount: wrongAnswers,
                lastTrainingDate: new Date().toISOString()
            });
        }
    } catch (err) {
        console.error('[ML Manager] CALM Check Failed:', err);
    }
}

/**
 * Starts the background automation.
 */
export function initializeMLAutomation() {
    console.log('[ML Manager] Scheduled background check initialized (Hourly).');
    checkTriggersAndTrain();

    cron.schedule('0 * * * *', () => {
        console.log('[ML Manager] Periodic threshold check...');
        checkTriggersAndTrain();
    });
}
