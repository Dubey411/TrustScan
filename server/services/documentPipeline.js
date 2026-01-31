
import './globals.js'; // MUST BE FIRST
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
        const scriptPath = path.resolve(__dirname, '..', 'scripts', 'pdf_render.py');
        
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
                    
                    // Post-process with Jimp
                    const image = await Jimp.read(buffer);
                    if (typeof image.greyscale === 'function') {
                        image.greyscale().contrast(0.2).normalize();
                    } else if (typeof image.grayscale === 'function') {
                        image.grayscale().contrast(0.2).normalize();
                    }
                    
                    resolve(await image.getBuffer('image/png'));
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
    
    let fontPath = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts/');
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
            console.log(`[Pipeline] Mode: ${depth.toUpperCase()}, Processing ${targetPages.length}/${pdfData.totalPages} pages.`);

            let textAccumulator = "";
            let totalConfidence = 0;
            let pagesProcessed = 0;

            for (const page of targetPages) {
                // Yield to event loop: Prevent server from becoming unresponsive
                await new Promise(resolve => setTimeout(resolve, 200));

                console.log(`[Pipeline] Processing Page ${page.pageIndex}...`);
                let pageText = page.text || "";
                let method = "DIGITAL_PARSE";

                if (page.type === 'SCANNED' || page.charCount < 100) {
                    let pageWorker = null;
                    try {
                        const scale = pdfData.totalPages > 5 ? 1.5 : 2.0; 
                        let imgBuffer = await renderPdfPageViaPython(fileBuffer, page.pageIndex, scale);
                        if (!pipelineResult.firstImgBuffer) pipelineResult.firstImgBuffer = imgBuffer;
                        
                        pageWorker = await createWorker('eng');
                        const ocr = await runMultiPassOCR(imgBuffer, pageWorker);
                        pageText = ocr.text;
                        totalConfidence += ocr.confidence;
                        method = "PYTHON_OCR";
                        
                        await pageWorker.terminate();
                        pageWorker = null;
                        imgBuffer = null;
                    } catch (e) {
                        console.error(`[Pipeline] Page ${page.pageIndex} Error:`, e.message);
                        method = "FAIL";
                        if (pageWorker) await pageWorker.terminate();
                    }
                }

                if (pageText) {
                    textAccumulator += `--- Page ${page.pageIndex} ---\n${pageText}\n\n`;
                    pagesProcessed++;
                }
                pipelineResult.extractionMethod.push(`P${page.pageIndex}:${method}`);
            }

            pipelineResult.text = textAccumulator;
            pipelineResult.confidence = pagesProcessed > 0 ? totalConfidence / pagesProcessed : 0;
            pipelineResult.pagesAnalyzed = pagesProcessed;

        } else if (mimeType.startsWith('image/')) {
            console.log(`[Pipeline] Processing Image...`);
            let worker = await createWorker('eng');
            
            let processedBuffer = fileBuffer;
            try {
                const image = await Jimp.read(fileBuffer);
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
            pipelineResult.text = ocr.text;
            pipelineResult.confidence = ocr.confidence;
            pipelineResult.docType = "IMAGE";
            pipelineResult.totalPages = 1;
            pipelineResult.pagesAnalyzed = 1;
            pipelineResult.extractionMethod.push("IMAGE_OCR");
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
