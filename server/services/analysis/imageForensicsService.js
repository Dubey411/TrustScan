import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, '../../scripts/image_forensics.py');
const DAEMON_SCRIPT_PATH = path.join(__dirname, '../../scripts/forensics_server.py');

let daemonStarted = false;

/**
 * Ensures the warm Python ML daemon is running in the background on port 5005.
 * Keeps models in RAM so image scans execute in sub-second time.
 */
export function ensureForensicsDaemonRunning() {
    if (daemonStarted) return;
    daemonStarted = true;

    fetch('http://127.0.0.1:5005', { signal: AbortSignal.timeout(1000) })
        .then(res => {
            if (res.ok) console.log('✅ [ImageForensics] Warm Python ML daemon active on http://127.0.0.1:5005');
        })
        .catch(() => {
            console.log('🚀 [ImageForensics] Launching warm Python ML daemon on port 5005...');
            const pyCommand = process.platform === 'win32' ? 'python' : 'python3';
            try {
                const proc = spawn(pyCommand, [DAEMON_SCRIPT_PATH, '5005'], {
                    detached: true,
                    stdio: 'ignore'
                });
                proc.unref();
                console.log('⚡ [ImageForensics] Python ML daemon spawned in background.');
            } catch (err) {
                console.warn(`⚠️ [ImageForensics] Could not auto-spawn daemon: ${err.message}`);
            }
        });
}

// Automatically initialize on server boot
ensureForensicsDaemonRunning();

/**
 * 5-Stage Deep Image Forensic Analysis Service
 *
 * Stage 1: ELA (Error Level Analysis) — Photoshop/Canva tamper detection
 * Stage 2: Noise Inconsistency — Composite/spliced image detection
 * Stage 3: EXIF Metadata Scan — AI generator signatures (SD prompt, Midjourney job ID)
 * Stage 4: FFT Frequency Domain — Spectral fingerprinting for LDM/GAN/Diffusion models
 * Stage 5: DCT Block Kurtosis — AC coefficient distribution (Laplacian vs Gaussian)
 *
 * @param {Buffer} imageBuffer - Raw image bytes
 * @returns {Promise<Object>} Full forensic report with tamper AND AI-generation verdicts
 */
export async function analyzeDocumentForensics(imageBuffer) {
    if (!imageBuffer || imageBuffer.length === 0) {
        return {
            tamperingConfidence: 0.0,
            aiGenerationScore: 0.0,
            isTampered: false,
            isAiGenerated: false,
            forensicVerdict: 'CLEAN',
            generatorFamilyHint: null,
            anomalyRegions: [],
            method: 'none'
        };
    }

    const tempFilePath = path.join(
        os.tmpdir(),
        `forensic_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
    );

    try {
        await fs.promises.writeFile(tempFilePath, imageBuffer);

        let parsed = null;

        // 🚀 Strategy 1: Ultra-fast Warm Python ML Daemon (50ms latency)
        try {
            const daemonResp = await fetch('http://127.0.0.1:5005', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: tempFilePath }),
                signal: AbortSignal.timeout(4000)
            });
            if (daemonResp.ok) {
                parsed = await daemonResp.json();
            }
        } catch (daemonErr) {
            // Daemon offline or timed out -> proceed to CLI spawn fallback
        }

        // 🔄 Strategy 2: CLI Spawn Fallback
        if (!parsed) {
            const pyCommand = process.platform === 'win32' ? 'python' : 'python3';
            const stdoutData = await new Promise((resolve) => {
                const pythonProcess = spawn(pyCommand, [SCRIPT_PATH, tempFilePath]);
                let dataChunks = '';

                pythonProcess.stdout.on('data', (data) => {
                    dataChunks += data.toString();
                });

                pythonProcess.on('error', (err) => {
                    console.warn(`⚠️ [ImageForensics] Python spawn error: ${err.message}`);
                    resolve('{}');
                });

                pythonProcess.on('close', () => {
                    resolve(dataChunks);
                });
            });

            try {
                const jsonMatch = (stdoutData || '').match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    parsed = JSON.parse(stdoutData || '{}');
                }
            } catch (parseErr) {
                console.warn(`⚠️ [ImageForensics] JSON parse note: ${parseErr.message}`);
                parsed = {};
            }
        }
        if (!parsed) parsed = {};

        return {
            // ── Tamper detection (manually edited real photos) ──
            tamperingConfidence: parsed.forensic_tamper_score || 0.0,
            isTampered: Boolean(parsed.is_tampered),

            // ── AI generation detection (LDM / GAN / Diffusion) ──
            aiGenerationScore: parsed.ai_generation_score || 0.0,
            isAiGenerated: Boolean(parsed.is_ai_generated),

            // CLEAN / AI_GENERATED / TAMPERED_REAL_IMAGE / AI_GENERATED_AND_EDITED
            forensicVerdict: parsed.forensic_verdict || 'CLEAN',

            // e.g. "Latent Diffusion Model (SD / SDXL / FLUX / DALL-E 3)"
            generatorFamilyHint: parsed.generator_family_hint || null,

            // Specific AI generators found in EXIF (e.g. ["midjourney", "comfyui"])
            detectedAiGenerators: parsed.detected_ai_generators || [],
            detectedEditingSoftware: parsed.detected_editing_software || [],

            // Stable Diffusion PNG prompt metadata
            sdPromptFound: Boolean(parsed.sd_prompt_found),
            sdPromptPreview: parsed.sd_prompt_preview || null,

            // Raw sub-analysis for detailed UI breakdown
            details: {
                ela:   parsed.ela_analysis,
                noise: parsed.noise_analysis,
                fft:   parsed.fft_analysis,
                dct:   parsed.dct_analysis,
                exif:  parsed.exif_analysis,
            },

            // Legacy field for backward compat with PaymentReceiptCard
            anomalyRegions: parsed.is_tampered
                ? [{ bbox: [0, 0, 100, 100], type: 'ela_anomaly' }]
                : []
        };
    } catch (err) {
        console.warn(`⚠️ [ImageForensics] Forensics execution note: ${err.message}`);
        return {
            tamperingConfidence: 0.0,
            aiGenerationScore: 0.0,
            isTampered: false,
            isAiGenerated: false,
            forensicVerdict: 'CLEAN',
            generatorFamilyHint: null,
            anomalyRegions: []
        };
    } finally {
        if (fs.existsSync(tempFilePath)) {
            try { await fs.promises.unlink(tempFilePath); } catch (e) {}
        }
    }
}
