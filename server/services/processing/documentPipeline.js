import '../globals.js'; // MUST BE FIRST
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';
import { callSarvamVision } from '../analysis/sarvamService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import TrustEntity from '../../models/TrustEntity.js';

let getDocument;
let Jimp;

function isProductionRuntime() {
    return Boolean(process.env.RENDER || process.env.NODE_ENV === 'production');
}

function getPageBudget(docType, depth) {
    if (isProductionRuntime()) {
        if (depth === 'deep') return docType === 'SCANNED' ? 6 : 8;
        if (depth === 'standard') return docType === 'SCANNED' ? 4 : 5;
        return docType === 'SCANNED' ? 2 : 3;
    }

    if (depth === 'deep') return docType === 'SCANNED' ? 15 : 25;
    if (depth === 'standard') return docType === 'SCANNED' ? 5 : 10;
    return docType === 'SCANNED' ? 3 : 5;
}

function getPdfRenderScale(totalPages) {
    if (isProductionRuntime()) {
        return totalPages > 3 ? 1.15 : 1.25;
    }
    return totalPages > 5 ? 1.5 : 2.0;
}

async function initDependencies() {
    if (!getDocument) {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        getDocument = pdfjs.getDocument;
    }
    if (!Jimp) {
        const jimpModule = await import('jimp');
        Jimp = jimpModule.default || jimpModule.Jimp || jimpModule;
    }
}

export async function warmDocumentPipelineDependencies() {
    await initDependencies();
}

/**
 * Python-based PDF rendering (Fallback because PDF.js + Node-Canvas is unstable)
 */
async function renderPdfPageViaPython(fileBuffer, pageIndex, scale = 2.0) {
    const tempPdfPath = path.join(__dirname, `temp_${Date.now()}_${pageIndex}.pdf`);
    fs.writeFileSync(tempPdfPath, fileBuffer);

    try {
        const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`   [Memory] Before render: ${memUsage.toFixed(1)} MB`);
        
        console.log(`   [Python Render] Processing page ${pageIndex} at scale ${scale}...`);
        
        // Deployment Ready: Link to system python or environment-specific path
        const pythonPath = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");
        const scriptPath = path.resolve(__dirname, '..', '..', 'scripts', 'pdf_render.py');
        
        // Pass 0-based index to Python
        const child = spawn(pythonPath, [scriptPath, tempPdfPath, (pageIndex - 1).toString(), scale.toString()]);
        
        let stdout = "";
        let stderr = "";
        
        return new Promise((resolve, reject) => {
            child.stdout.on('data', (data) => stdout += data.toString());
            child.stderr.on('data', (data) => stderr += data.toString());
            
            child.on('close', async (code) => {
                if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
                
                if (code !== 0) {
                    console.error("Python Stderr:", stderr);
                    console.error("Python Stdout:", stdout.substring(0, 200));
                    return reject(new Error(`Python render failed (code ${code})`));
                }
                
                try {
                    const cleanStdout = stdout.split('\n').filter(l => l.trim().startsWith('{')).pop();
                    if (!cleanStdout) throw new Error("No JSON found in Python output");
                    
                    const result = JSON.parse(cleanStdout);
                    if (!result.success) throw new Error(result.error);
                    
                    if (!result.image) throw new Error(`Page data missing (page ${pageIndex})`);
                    
                    const buffer = Buffer.from(result.image, 'base64');
                    console.log(`   [Python Render] Success: ${buffer.length} bytes received.`);
                    
                    resolve(buffer);
                } catch (err) {
                    reject(new Error(`Parse error: ${err.message}\nOutput: ${stdout.substring(0, 100)}`));
                }
            });
        });
    } catch (err) {
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        throw err;
    }
}

/**
 * STEP 1: PDF INTELLIGENCE
 */
async function analyzePdfStructure(buffer) {
    await initDependencies();
    
    let fontPath = path.join(__dirname, '..', '..', 'node_modules', 'pdfjs-dist', 'standard_fonts/');
    fontPath = fontPath.split(path.sep).join('/');
    if (!fontPath.endsWith('/')) fontPath += '/';
    
    const loadingTask = getDocument({
        data: new Uint8Array(buffer),
        disableFontFace: true,
        disableWorker: true,
        verbosity: 0,
        standardFontDataUrl: fontPath
    });

    const doc = await loadingTask.promise;
    const pageCount = doc.numPages;
    const pages = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY = -1;
        let text = "";
        for (const item of textContent.items) {
            const currentY = item.transform[5];
            if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
                text += "\n";
            }
            text += item.str + " ";
            lastY = currentY;
        }

        const charCount = text.trim().length;
        const type = charCount > 50 ? 'DIGITAL' : 'SCANNED';
        pages.push({ pageIndex: i, type, charCount, text: text.trim(), pageRef: page });
    }

    const scannedCount = pages.filter(p => p.type === 'SCANNED').length;
    let docType = (scannedCount === pageCount) ? 'SCANNED' : (scannedCount > 0 ? 'MIXED' : 'DIGITAL');

    return { doc, pages, docType };
}

/**
 * Validates if buffer has standard image magic headers (JPEG, PNG, GIF, BMP, WEBP, TIFF)
 */
function isValidImageBuffer(buf) {
    if (!buf || !Buffer.isBuffer(buf) || buf.length < 8) return false;
    // PNG: 89 50 4E 47
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
    // JPEG: FF D8 FF
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
    // GIF: 47 49 46
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
    // BMP: 42 4D
    if (buf[0] === 0x42 && buf[1] === 0x4D) return true;
    // WEBP: 52 49 46 46 (RIFF)
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return true;
    // TIFF: 49 49 2A 00 or 4D 4D 00 2A
    if ((buf[0] === 0x49 && buf[1] === 0x49) || (buf[0] === 0x4D && buf[1] === 0x4D)) return true;
    return false;
}

/**
 * STEP 5: OCR
 */
async function runMultiPassOCR(imageBuffer, worker) {
    if (!isValidImageBuffer(imageBuffer)) {
        console.warn(`   [OCR] Skipping Tesseract: buffer does not contain standard image binary headers.`);
        return { text: "", confidence: 0 };
    }
    console.log(`   [OCR] Starting Tesseract pass 1...`);
    try {
        const res = await worker.recognize(imageBuffer);
        return { text: res?.data?.text || "", confidence: res?.data?.confidence || 0 };
    } catch (err) {
        console.warn(`   [OCR] Recognition note:`, err.message);
        return { text: "", confidence: 0 };
    }
}

/**
 * UTILS
 */
function extractStructures(text) {
    return {
        hasAmount: /[\$€£]\s?\d+(?:[\.,]\d{2})?/.test(text),
        hasDate: /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(text),
        hasTransactionId: /ID[:\s]+[A-Z0-9-]{8,}/i.test(text)
    };
}

/**
 * Checks if text contains any items from the Red or Grey list
 */
async function checkForFastPathFraud(text) {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    const fuzzyText = lowerText.replace(/[^a-z0-9]/g, '');
    
    const allEntities = await TrustEntity.find({}).lean();
    
    const isMatch = (entityName) => {
        const name = entityName.toLowerCase();
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boundaryRegex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (boundaryRegex.test(lowerText)) return true;

        if (name.length > 7) {
            const fuzzyName = name.replace(/[^a-z0-9]/g, '');
            return fuzzyText.includes(fuzzyName);
        }
        
        return false;
    };

    const blacklistedMatch = allEntities.find(b => b.category === 'red_flag' && isMatch(b.name));
    if (blacklistedMatch) return { type: 'RED', name: blacklistedMatch.name, reason: blacklistedMatch.type };
    
    const greylistMatch = allEntities.find(g => g.category === 'grey_list' && isMatch(g.name));
    if (greylistMatch) return { type: 'GREY', name: greylistMatch.name, reason: greylistMatch.type };
    
    return null;
}

/**
 * MAIN ENTRY
 */
export async function runDocumentPipeline(fileBuffer, mimeType, depth = 'basic') {
    const pipelineResult = {
        text: "",
        confidence: 0,
        extractionMethod: [],
        signals: { isAiGenerated: false, isManipulated: false, visual_anomalies: [], structures: {} },
        docType: "UNKNOWN",
        totalPages: 0,
        pagesAnalyzed: 0,
        firstImgBuffer: null
    };

    try {
        await initDependencies();

        if (mimeType === 'application/pdf') {
            const pdfData = await analyzePdfStructure(fileBuffer);
            pipelineResult.docType = pdfData.docType;
            pipelineResult.totalPages = pdfData.pages.length;

            const MAX_PAGES = getPageBudget(pdfData.docType, depth);
            const targetPages = pdfData.pages.slice(0, MAX_PAGES);
            
            const isProduction = isProductionRuntime();
            const WORKER_COUNT = isProduction ? 1 : Math.min(targetPages.length, 4); 
            
            console.log(`[Pipeline] Intelligence Mode: Environment=${isProduction ? 'PROD' : 'LOCAL'}, Max Fallback Workers=${WORKER_COUNT}`);

            let scheduler = null;
            let workers = [];

            const getScheduler = async () => {
                if (scheduler) return scheduler;
                console.log("⚡ [Pipeline] Initializing Tesseract Fallback Scheduler...");
                const tesseract = await import('tesseract.js');
                scheduler = tesseract.createScheduler();
                for (let i = 0; i < WORKER_COUNT; i++) {
                    const w = await tesseract.createWorker('eng+hin');
                    scheduler.addWorker(w);
                    workers.push(w);
                }
                return scheduler;
            };

            try {
                const processPage = async (page) => {
                    let pageText = page.text || "";
                    let method = "DIGITAL_PARSE";
                    let confidence = 100;
                    let isFraudMatch = false;
                    let fraudMatchReason = null;

                    const fastFraud = await checkForFastPathFraud(pageText);
                    if (fastFraud) {
                        isFraudMatch = true;
                        fraudMatchReason = fastFraud;
                    }

                    const shouldOcr = page.type === 'SCANNED' || 
                                     page.charCount < 100 || 
                                     (page.pageIndex === 1 && (depth === 'deep' || depth === 'standard'));

                    if (shouldOcr) {
                        try {
                            const scale = getPdfRenderScale(pdfData.totalPages);
                            const imgBuffer = await renderPdfPageViaPython(fileBuffer, page.pageIndex, scale);
                            
                            if (!pipelineResult.firstImgBuffer && page.pageIndex === 1) {
                                pipelineResult.firstImgBuffer = imgBuffer;
                            }

                            const sarvamResult = await callSarvamVision(imgBuffer);
                            
                            if (sarvamResult && sarvamResult.success) {
                                pageText = sarvamResult.text;
                                confidence = sarvamResult.confidence;
                                method = "SARVAM_VISION";
                            } else if (isProduction && depth !== 'deep') {
                                method = "SARVAM_FAILED";
                                confidence = 0;
                            } else {
                                console.log(`[Pipeline] P${page.pageIndex} Falling back to local OCR...`);
                                const localScheduler = await getScheduler();
                                const ocr = await localScheduler.addJob('recognize', imgBuffer);
                                pageText = ocr.data.text;
                                confidence = ocr.data.confidence;
                                method = "LOCAL_FALLBACK_OCR";
                            }
                            
                            const ocrFraud = await checkForFastPathFraud(pageText);
                            if (ocrFraud) {
                                isFraudMatch = true;
                                fraudMatchReason = ocrFraud;
                            }
                        } catch (e) {
                            console.error(`[Pipeline] Page ${page.pageIndex} Error:`, e.message);
                            method = "FAIL";
                            confidence = 0;
                        }
                    }

                    return { index: page.pageIndex, text: pageText, method, confidence, isFraud: isFraudMatch, fraudMatch: fraudMatchReason };
                };

                const results = [];
                for (const page of targetPages) {
                    results.push(await processPage(page));
                }

                const fraudTrigger = results.find(r => r.isFraud);
                if (fraudTrigger) {
                    const hit = fraudTrigger.fraudMatch;
                    console.log(`🎯 [Database Hit] Identified ${hit.name} (${hit.type}). Continuing OCR for ML training...`);
                    
                    if (hit.type === 'RED') {
                        pipelineResult.signals.visual_anomalies.push('KNOWN_SCAM_DATABASE_HIT');
                    } else if (hit.type === 'GREY') {
                        pipelineResult.signals.visual_anomalies.push('GREYLIST_ENTITY_DETECTED');
                    }
                }
                
                results.sort((a, b) => a.index - b.index);

                let textAccumulator = "";
                let totalConfidence = 0;
                let pagesProcessed = 0;

                results.forEach(res => {
                    if (res.text) {
                        textAccumulator += `--- Page ${res.index} ---\n${res.text}\n\n`;
                        totalConfidence += res.confidence;
                        pagesProcessed++;
                    }
                    const hitTag = res.isFraud ? `_${res.fraudMatch.type}_HIT` : '';
                    pipelineResult.extractionMethod.push(`P${res.index}:${res.method}${hitTag}`);
                });

                pipelineResult.text = textAccumulator;
                pipelineResult.confidence = pagesProcessed > 0 ? totalConfidence / pagesProcessed : 0;
                pipelineResult.pagesAnalyzed = pagesProcessed;

            } finally {
                if (scheduler) {
                    await scheduler.terminate();
                    console.log(`[Pipeline] Fallback OCR Workers terminated.`);
                }
            }

        } else if (mimeType.startsWith('image/')) {
            console.log(`[Pipeline] Processing Image...`);
            let processedBuffer = fileBuffer;
            try {
                const image = await Jimp.read(processedBuffer);
                if (isProductionRuntime() && (image.bitmap.width > 1800 || image.bitmap.height > 1800)) {
                    image.scaleToFit(1800, 1800);
                }
                if (typeof image.greyscale === 'function') {
                    image.greyscale().contrast(0.2).normalize();
                    processedBuffer = await image.getBuffer('image/png');
                } else if (typeof image.grayscale === 'function') {
                    image.grayscale().contrast(0.2).normalize();
                    processedBuffer = await image.getBuffer('image/png');
                }
            } catch (err) {
                console.warn(`[Pipeline] Jimp preprocessing note:`, err.message);
            }

            const sarvamResult = await callSarvamVision(processedBuffer);
            
            if (sarvamResult && sarvamResult.success) {
                pipelineResult.text = sarvamResult.text || "";
                pipelineResult.confidence = sarvamResult.confidence || 90;
                pipelineResult.extractionMethod.push("IMAGE_SARVAM");
            } else if (isValidImageBuffer(processedBuffer)) {
                console.log(`[Pipeline] Image falling back to local OCR...`);
                let tesseractWorker = null;
                try {
                    const tesseract = await import('tesseract.js');
                    tesseractWorker = await tesseract.createWorker('eng+hin', 1, {
                        errorHandler: (ocrErr) => console.warn(`[Tesseract Worker] Handled:`, ocrErr?.message || ocrErr)
                    });
                    const ocr = await runMultiPassOCR(processedBuffer, tesseractWorker);
                    
                    pipelineResult.text = ocr.text || "";
                    pipelineResult.confidence = ocr.confidence || 0;
                    pipelineResult.extractionMethod.push("IMAGE_LOCAL_OCR");
                } catch (ocrErr) {
                    console.warn(`[Pipeline] Local OCR note:`, ocrErr.message);
                    pipelineResult.text = "";
                    pipelineResult.confidence = 0;
                    pipelineResult.extractionMethod.push("IMAGE_OCR_FALLBACK");
                } finally {
                    if (tesseractWorker) {
                        try {
                            await tesseractWorker.terminate();
                        } catch (e) {}
                    }
                }
            } else {
                console.log(`[Pipeline] Non-standard image buffer; skipping local OCR.`);
                pipelineResult.extractionMethod.push("IMAGE_SKIPPED_LOCAL_OCR");
            }

            const finalFraud = await checkForFastPathFraud(pipelineResult.text);
            if (finalFraud) {
                console.log(`🎯 [Database Hit] Identified ${finalFraud.name}. Harvesting data for ML...`);
                pipelineResult.signals.visual_anomalies.push('KNOWN_SCAM_DATABASE_HIT');
            }

            pipelineResult.docType = "IMAGE";
            pipelineResult.totalPages = 1;
            pipelineResult.pagesAnalyzed = 1;
            pipelineResult.firstImgBuffer = processedBuffer;
        }

        pipelineResult.signals.structures = extractStructures(pipelineResult.text);

        if (!pipelineResult.text || pipelineResult.text.trim().length < 10) {
            pipelineResult.signals.visual_anomalies.push('LOW_QUALITY_FAKE_LIKELY');
        }

    } catch (error) {
        pipelineResult.error = error.message;
    } finally {
        const endMem = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`[Pipeline] Completed. Memory usage: ${endMem.toFixed(1)} MB`);
    }

    return pipelineResult;
}
