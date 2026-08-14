import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, '../../scripts/image_forensics.py');

/**
 * Stage 3.5: Deep Image Forensic Analysis Service
 * Executes Error Level Analysis (ELA), Noise Inconsistency Analysis, and EXIF software scanning.
 */
export async function analyzeDocumentForensics(imageBuffer) {
    if (!imageBuffer || imageBuffer.length === 0) {
        return {
            tamperingConfidence: 0.0,
            isTampered: false,
            anomalyRegions: [],
            method: 'none'
        };
    }

    const tempFilePath = path.join(os.tmpdir(), `forensic_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);

    try {
        await fs.promises.writeFile(tempFilePath, imageBuffer);

        const pyCommand = process.platform === 'win32' ? 'python' : 'python3';

        const resultJson = await new Promise((resolve) => {
            const pythonProcess = spawn(pyCommand, [SCRIPT_PATH, tempFilePath]);
            let stdoutData = '';

            pythonProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            pythonProcess.on('error', (err) => {
                console.warn(`⚠️ [ImageForensics] Python spawn error: ${err.message}`);
                resolve('{}');
            });

            pythonProcess.on('close', () => {
                resolve(stdoutData);
            });
        });

        const parsed = JSON.parse(resultJson || '{}');
        const score = parsed.forensic_tamper_score || 0.0;

        return {
            tamperingConfidence: score,
            isTampered: Boolean(parsed.is_tampered),
            details: parsed,
            anomalyRegions: parsed.is_tampered ? [{ bbox: [0, 0, 100, 100], type: 'ela_anomaly' }] : []
        };
    } catch (err) {
        console.warn(`⚠️ [ImageForensics] Forensics execution note: ${err.message}`);
        return {
            tamperingConfidence: 0.0,
            isTampered: false,
            anomalyRegions: []
        };
    } finally {
        if (fs.existsSync(tempFilePath)) {
            try { await fs.promises.unlink(tempFilePath); } catch (e) {}
        }
    }
}
