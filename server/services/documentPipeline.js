
import { createWorker } from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Safety imports for complex dependencies
let Jimp;
let getDocument;
let createCanvas, Image;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize heavyweight dependencies lazily
let sharedCanvasFactory = null;

async function initDependencies() {
    if (!Jimp) {
        const JimpModule = await import('jimp');
        Jimp = JimpModule.default || JimpModule.Jimp || JimpModule;
    }
    
    if (!createCanvas) {
        const canvasModule = await import('canvas');
        const { createCanvas: cc, Image: CI, ImageData: CID, Canvas: CC, Path2D: CP2 } = canvasModule;
        
        createCanvas = cc;
        Image = CI;
        
        // Comprehensive Node-DOM Polyfills for PDF.js
        global.Canvas = CC;
        global.Image = CI;
        global.ImageData = CID;
        global.Path2D = CP2;
        
        global.HTMLCanvasElement = CC;
        global.HTMLImageElement = CI;
        global.HTMLElement = class {};
        global.Node = class {};
        
        if (!global.navigator) global.navigator = { userAgent: "Node" };
        if (!global.window) global.window = global;
        
        // Final Browser Polyfills for PDF.js 5.x
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
        global.cancelAnimationFrame = (id) => clearTimeout(id);
        
        if (!global.document) {
            global.document = {
                createElement: (tag) => {
                    if (tag === 'canvas') return createCanvas(1, 1);
                    return {};
                }
            };
        }
        
        sharedCanvasFactory = {
            create: (width, height) => {
                const canvas = createCanvas(width, height);
                const context = canvas.getContext('2d');
                return { canvas, context, width, height };
            },
            reset: (ctx, width, height) => {
                ctx.canvas.width = width;
                ctx.canvas.height = height;
            },
            destroy: (ctx) => {
                ctx.canvas = null;
                ctx.context = null;
            }
        };
    }

    if (!getDocument) {
        // Load PDF.js only after environment is fully polyfilled
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        getDocument = pdfjs.getDocument;
        
        // Ensure PDF.js doesn't try to load worker in Node
        // (Usually automatic in node, but we'll leave it as is)
    }
}

/**
 * STEP 1: PDF INTELLIGENCE & PAGE CLASSIFICATION
 * Analyzes structure without full rendering.
 */
async function analyzePdfStructure(buffer) {
    await initDependencies();
    
    const loadingTask = getDocument({
        data: new Uint8Array(buffer),
        canvasFactory: sharedCanvasFactory,
        disableFontFace: true,
        verbosity: 0
    });

    const doc = await loadingTask.promise;
    const pageCount = doc.numPages;
    const pages = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Count meaningful characters (non-whitespace)
        const charCount = textContent.items.map(item => item.str).join('').trim().length;
        
        // Classification Rule: < 50 chars usually implies scanned/image-only page
        const type = charCount > 50 ? 'DIGITAL' : 'SCANNED';
        
        pages.push({
            pageIndex: i,
            pageRef: page,
            type,
            charCount
        });
    }

    // Determine document-level type
    const scannedCount = pages.filter(p => p.type === 'SCANNED').length;
    let docType = 'DIGITAL';
    if (scannedCount === pageCount) docType = 'SCANNED';
    else if (scannedCount > 0) docType = 'MIXED';

    return { doc, pages, docType };
}

/**
 * STEP 3 & 4: IMAGE RENDERING & NORMALIZATION
 * High-res render + Jimp enhancements
 */
async function renderAndNormalizeParams(page, scale = 2.0) {
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
        canvasContext: context,
        viewport,
        canvasFactory: sharedCanvasFactory
    }).promise;

    const buffer = canvas.toBuffer('image/png');
    
    // Step 4: Normalization with Jimp
    const image = await Jimp.read(buffer);
    
    // Aggressive Text Recovery Strategy
    image.greyscale()
         .contrast(0.6) // Slightly higher contrast
         .normalize();  // Stretch histogram
         
    // Optional: Sharpening can sometimes help generic text, but can ruin noisy images.
    // We'll stick to high-contrast for now.

    const processedBuffer = await image.getBuffer('image/png');
    return processedBuffer;
}

/**
 * STEP 6: MULTI-PASS OCR
 */
async function runMultiPassOCR(imageBuffer) {
    const worker = await createWorker('eng');
    
    // Pass 1: Standard
    let { data: { text, confidence } } = await worker.recognize(imageBuffer);
    
    // Pass 2: Aggressive Recovery (if confidence < 75%)
    if (confidence < 75 && text.length > 10) {
        console.log(`🔄 [OCR] Low confidence (${confidence.toFixed(1)}%). Running Pass 2 (Aggressive)...`);
        
        // Re-process image with thresholding/binarization for cleaner edges
        const image = await Jimp.read(imageBuffer);
        image.threshold({ max: 150 }); // Binarize
        const pass2Buffer = await image.getBuffer('image/png');
        
        const pass2 = await worker.recognize(pass2Buffer);
        
        // Merge strategy: Keep the one with higher confidence or more text?
        // Usually higher confidence is safer for fraud signals.
        if (pass2.data.confidence > confidence) {
            console.log(`✅ [OCR] Pass 2 improved confidence to ${pass2.data.confidence.toFixed(1)}%`);
            text = pass2.data.text;
            confidence = pass2.data.confidence;
        }
    }
    
    await worker.terminate();
    return { text, confidence };
}

/**
 * STEP 7: STRUCTURAL EXTRACTION
 * Regex hunters
 */
function extractStructures(text) {
    const normalize = t => t.toLowerCase();
    const content = normalize(text);
    
    return {
        hasDate: /\d{1,2}[-./]\d{1,2}[-./]\d{2,4}/.test(content) || /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(content),
        hasAmount: /(rs\.?|inr|₹|\$)\s*[\d,]+(\.\d{2})?/.test(content),
        hasTransactionId: /(txn|ref|utr|upi|id)[\s:]*[a-z0-9]+/i.test(content),
        hasPhone: /(\+91[\s-]?)?[6-9]\d{9}/.test(text), // Indian context
        hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)
    };
}

/**
 * STEP 8: VISUAL SIGNAL ANALYSIS
 * (Logic applied on text/metadata since we don't have deep computer vision models loaded yet)
 */
function analyzeVisualSignals(text, structures, confidence) {
    const signals = [];
    const content = text.toLowerCase();

    // 1. AI Tool Traces (Self-Attribution)
    if (/(generated by ai|midjourney|dall-e|stablediffusion|openai|image generated|ai agents)/i.test(content)) {
        signals.push('AI_GENERATED_TRACE');
    }

    // 2. Editing Tool Metadata Traces (Heuristic)
    if (/(photoshop|canva|figma|picsart|gimp)/i.test(content)) {
        signals.push('EDITING_TOOL_TRACE');
    }

    // 3. Paradox: "Payment Successful" but missing Transaction ID
    if (/payment successful/i.test(content) && !structures.hasTransactionId) {
        signals.push('VISUAL_PARADOX_MISSING_TXN');
    }

    // 4. Paradox: High visual confidence (implied by readable "Successful") but very low overall OCR confidence
    if (/successful/i.test(content) && confidence < 40) {
        signals.push('LOW_QUALITY_FAKE_LIKELY');
    }
    
    return signals;
}

/**
 * MASTER PIPELINE EXECUTOR
 */
export async function runDocumentPipeline(fileBuffer, mimeType) {
    await initDependencies();

    const pipelineResult = {
        text: "",
        docType: "UNKNOWN",
        pagesAnalyzed: 0,
        extractionMethod: [],
        confidence: 0,
        signals: {
            structures: {},
            visual_anomalies: []
        }
    };

    try {
        let textAccumulator = "";
        let totalConfidence = 0;
        let pagesProcessed = 0;

        // --- PATH A: IMAGE DIRECT ---
        if (mimeType.startsWith('image/')) {
            pipelineResult.docType = "IMAGE";
            pipelineResult.extractionMethod.push("IMAGE_OCR_ENHANCED");
            
            // Step 4: Normalize
            const jimpImg = await Jimp.read(fileBuffer);
            jimpImg.greyscale().contrast(0.5).normalize();
            const normBuffer = await jimpImg.getBuffer('image/png');
            
            // Step 6: OCR
            const ocrRes = await runMultiPassOCR(normBuffer);
            textAccumulator = ocrRes.text;
            totalConfidence = ocrRes.confidence;
            pagesProcessed = 1;
        } 
        
        // --- PATH B: PDF PROCESSING ---
        else if (mimeType.includes('pdf')) {
            // Step 1: Intelligence
            console.log(`🔍 [Pipeline] Analyzing PDF structure...`);
            const pdfData = await analyzePdfStructure(fileBuffer);
            pipelineResult.docType = pdfData.docType;
            
            console.log(`📄 [Pipeline] PDF Type: ${pdfData.docType}, Total Pages: ${pdfData.pages.length}`);

            // Limit processing to max 5 pages for performance in this prototype
            const MAX_PAGES = 5;
            const pagesToProcess = pdfData.pages.slice(0, MAX_PAGES);

            for (const page of pagesToProcess) {
                try {
                    console.log(`⏳ [Pipeline] Processing Page ${page.pageIndex}/${pdfData.pages.length} (${page.type})...`);
                    let pageText = "";
                    let method = "";
                    let pageConf = 100;

                    // Step 2: Routing
                    if (page.type === 'DIGITAL') {
                        // Direct text extraction
                        const content = await page.pageRef.getTextContent();
                        pageText = content.items.map(i => i.str).join(' ');
                        method = "DIGITAL_PARSE";
                    } else {
                        // Step 3-6: Render -> Normalize -> OCR
                        const imgBuffer = await renderAndNormalizeParams(page.pageRef);
                        const ocr = await runMultiPassOCR(imgBuffer);
                        pageText = ocr.text;
                        pageConf = ocr.confidence;
                        method = "OCR_ENHANCED";
                    }

                    if (pageText.trim()) {
                        textAccumulator += `--- Page ${page.pageIndex} ---\n${pageText}\n\n`;
                        totalConfidence += pageConf;
                        pagesProcessed++;
                        pipelineResult.extractionMethod.push(`P${page.pageIndex}:${method}`);
                    } else {
                        console.warn(`⚠️ [Pipeline] Page ${page.pageIndex} returned no text.`);
                    }

                } catch (pageErr) {
                    const errMsg = pageErr.message || "Unknown Page Error";
                    console.error(`❌ [Pipeline] Failed to process Page ${page.pageIndex}:`, errMsg);
                    pipelineResult.extractionMethod.push(`P${page.pageIndex}:ERR(${errMsg.substring(0, 30)})`);
                    // Don't stop the whole document if one page fails
                }
            }
            
            if (pagesProcessed > 0) {
                totalConfidence = totalConfidence / pagesProcessed; // Average
            }
        }

        pipelineResult.text = textAccumulator || "[No text recovered from any page]";
        pipelineResult.pagesAnalyzed = pagesProcessed;
        pipelineResult.confidence = totalConfidence;

        // Step 7 & 8: Signal Extraction
        pipelineResult.signals.structures = extractStructures(pipelineResult.text);
        pipelineResult.signals.visual_anomalies = analyzeVisualSignals(pipelineResult.text, pipelineResult.signals.structures, totalConfidence);

        // Explicit boolean flags for easier consumption
        pipelineResult.signals.isAiGenerated = pipelineResult.signals.visual_anomalies.includes('AI_GENERATED_TRACE');
        pipelineResult.signals.isManipulated = pipelineResult.signals.visual_anomalies.includes('EDITING_TOOL_TRACE');

    } catch (error) {
        const topErrMsg = error.message || "Pipeline Crash";
        console.error("Pipeline Top-Level Error:", topErrMsg);
        pipelineResult.error = topErrMsg;
        pipelineResult.text = `[Document Analysis Failed - ${topErrMsg}]`;
        pipelineResult.confidence = 0;
        pipelineResult.extractionMethod.push(`CRASH:${topErrMsg.substring(0, 30)}`);
    }

    return pipelineResult;
}
