
import '../globals.js'; // MUST BE FIRST
import { createWorker } from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let getDocument;
let Jimp;

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
                    
                    // SKIP JIMP FOR BULET SPEED (Tesseract handles standard PNGs well)
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
        const text = textContent.items.map(item => item.str).join(' ');
        const charCount = text.trim().length;
        const type = charCount > 50 ? 'DIGITAL' : 'SCANNED';
        pages.push({ pageIndex: i, type, charCount, text: text.trim(), pageRef: page });
    }

    const scannedCount = pages.filter(p => p.type === 'SCANNED').length;
    let docType = (scannedCount === pageCount) ? 'SCANNED' : (scannedCount > 0 ? 'MIXED' : 'DIGITAL');

    return { doc, pages, docType };
}

/**
 * STEP 5: OCR
 */
async function runMultiPassOCR(imageBuffer, worker) {
    console.log(`   [OCR] Starting Tesseract pass 1...`);
    try {
        const res = await worker.recognize(imageBuffer);
        return { text: res.data.text, confidence: res.data.confidence };
    } catch (err) {
        console.error(`   [OCR] Failed:`, err.message);
        throw err;
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

const predatoryPath = path.join(__dirname, '..', '..', 'data', 'entityTrustDatabase.json');
let TRUST_DB = { blacklist: [], greylist: [] };

try {
    TRUST_DB = JSON.parse(fs.readFileSync(predatoryPath, 'utf8'));
} catch (e) {
    console.error("Failed to load Trust Database");
}

/**
 * Checks if text contains any items from the Red or Grey list
 * Updated with stricter matching to avoid False Positives on common words.
 */
function checkForFastPathFraud(text) {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    
    // Helper for safe matching
    const isMatch = (entityName) => {
        const name = entityName.toLowerCase();
        if (name.length < 5) {
            // Strict Word Boundary for short names/acronyms (e.g. "UTL", "IGI", "GSS")
            // Escape special regex chars just in case
            const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`\\b${escaped}\\b`, 'i').test(lowerText);
        }
        return lowerText.includes(name);
    };

    // 1. Check Blacklist (Red Flag)
    const blacklistedMatch = TRUST_DB.blacklist.find(b => isMatch(b.name));
    if (blacklistedMatch) return { type: 'RED', name: blacklistedMatch.name, reason: blacklistedMatch.type };
    
    // 2. Check Greylist (Suspicious)
    const greylistMatch = TRUST_DB.greylist.find(g => isMatch(g.name));
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

            // ADAPTIVE DEPTH: Toggle between Basic and Premium (Deep) limits
            const isDeep = depth === 'deep';
            let MAX_PAGES = 3; // Default basic scanned
            
            if (pdfData.docType === 'SCANNED') {
                MAX_PAGES = isDeep ? 15 : 3;
            } else {
                MAX_PAGES = isDeep ? 25 : 8;
            }

            const targetPages = pdfData.pages.slice(0, MAX_PAGES);
            
            // ADAPTIVE CONCURRENCY: Render Free Tier has limited CPU/RAM. 
            // 4 workers will cause "Thrashing" (swapping memory) which makes it 10x slower.
            const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';
            const WORKER_COUNT = isProduction ? 1 : Math.min(targetPages.length, 4); 
            
            console.log(`[Pipeline] Bullet Mode: Environment=${isProduction ? 'PROD' : 'LOCAL'}, Workers=${WORKER_COUNT}`);

            const scheduler = (await import('tesseract.js')).createScheduler();
            const workers = [];

            for (let i = 0; i < WORKER_COUNT; i++) {
                const w = await createWorker('eng');
                scheduler.addWorker(w);
                workers.push(w);
            }

            try {
                const pagePromises = targetPages.map(async (page) => {
                    let pageText = page.text || "";
                    let method = "DIGITAL_PARSE";
                    let confidence = 100;
                    let isFraudMatch = false;
                    let fraudMatchReason = null;

                    // Identification Check (Don't stop, just flag)
                    const fastFraud = checkForFastPathFraud(pageText);
                    if (fastFraud) {
                        isFraudMatch = true;
                        fraudMatchReason = fastFraud;
                    }

                    if (page.type === 'SCANNED' || page.charCount < 100) {
                        try {
                            const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';
                            const scale = isProduction ? 1.5 : (pdfData.totalPages > 5 ? 1.5 : 2.0); 
                            const imgBuffer = await renderPdfPageViaPython(fileBuffer, page.pageIndex, scale);
                            
                            if (!pipelineResult.firstImgBuffer && page.pageIndex === 1) {
                                pipelineResult.firstImgBuffer = imgBuffer;
                            }

                            const ocr = await scheduler.addJob('recognize', imgBuffer);
                            pageText = ocr.data.text;
                            confidence = ocr.data.confidence;
                            method = "FAST_OCR";

                            // Identification Check on OCR text
                            const ocrFraud = checkForFastPathFraud(pageText);
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
                });

                const results = await Promise.all(pagePromises);

                // IDENTIFICATION: Check if any part of the document hit our blacklist or greylist
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
                
                // DATA HARVESTING: Group all text so ML can learn patterns
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
                await scheduler.terminate();
                console.log(`[Pipeline] Parallel OCR Workers terminated.`);
            }

        } else if (mimeType.startsWith('image/')) {
            console.log(`[Pipeline] Processing Image...`);
            let worker = await createWorker('eng');
            
            let processedBuffer = fileBuffer;
            try {
                const image = await Jimp.read(processedBuffer);
                if (typeof image.greyscale === 'function') {
                    image.greyscale().contrast(0.2).normalize();
                    processedBuffer = await image.getBuffer('image/png');
                } else if (typeof image.grayscale === 'function') {
                    image.grayscale().contrast(0.2).normalize();
                    processedBuffer = await image.getBuffer('image/png');
                }
            } catch (err) {
                console.warn(`[Pipeline] Jimp preprocessing failed:`, err.message);
            }

            const ocr = await runMultiPassOCR(processedBuffer, worker);
            
            // Flag Known Fraud but don't skip the data
            const imgFraud = checkForFastPathFraud(ocr.text);
            if (imgFraud) {
                console.log(`🎯 [Database Hit] Identified ${imgFraud}. Harvesting data for ML...`);
                pipelineResult.signals.visual_anomalies.push('KNOWN_SCAM_DATABASE_HIT');
            }

            pipelineResult.text = ocr.text;
            pipelineResult.confidence = ocr.confidence;
            pipelineResult.docType = "IMAGE";
            pipelineResult.totalPages = 1;
            pipelineResult.pagesAnalyzed = 1;
            pipelineResult.extractionMethod.push(imgFraud ? "IMAGE_OCR_HARVEST" : "IMAGE_OCR");
            pipelineResult.firstImgBuffer = processedBuffer;

            await worker.terminate();
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
