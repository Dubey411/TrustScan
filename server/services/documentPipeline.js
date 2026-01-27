
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
 * STEP 6: MULTI-PASS OCR (Optimized for RAM)
 * Reuses a single worker to avoid RAM spikes on 512MB servers
 */
async function runMultiPassOCR(imageBuffer, worker) {
    // Pass 1: Standard
    let { data: { text, confidence } } = await worker.recognize(imageBuffer);
    
    // Pass 2: Aggressive Recovery (if confidence < 75%)
    if (confidence < 75 && text.length > 10) {
        const image = await Jimp.read(imageBuffer);
        image.threshold({ max: 150 }); // Binarize
        const pass2Buffer = await image.getBuffer('image/png');
        
        const pass2 = await worker.recognize(pass2Buffer);
        
        if (pass2.data.confidence > confidence) {
            text = pass2.data.text;
            confidence = pass2.data.confidence;
        }
    }
    
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
 * STEP 7.5: ERROR LEVEL ANALYSIS (ELA)
 * Detects if parts of the image have inconsistent compression levels (signs of editing)
 */
async function detectDigitalManipulation(buffer) {
    try {
        const image = await Jimp.read(buffer);
        const originalWidth = image.getWidth();
        const originalHeight = image.getHeight();

        // 1. Resave at 90% quality to create a baseline for comparison
        const resavedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG, { quality: 90 });
        const resavedImage = await Jimp.read(resavedBuffer);

        // 2. Calculate the difference between original and resaved
        // Higher difference in specific areas suggests those areas were edited differently
        let totalDiff = 0;
        let artifactCount = 0;

        // Sample 1% of pixels to save RAM and time
        const step = 10; 
        for (let y = 0; y < originalHeight; y += step) {
            for (let x = 0; x < originalWidth; x += step) {
                const colorOrig = Jimp.intToRGBA(image.getPixelColor(x, y));
                const colorResaved = Jimp.intToRGBA(resavedImage.getPixelColor(x, y));

                const diff = Math.abs(colorOrig.r - colorResaved.r) + 
                             Math.abs(colorOrig.g - colorResaved.g) + 
                             Math.abs(colorOrig.b - colorResaved.b);

                totalDiff += diff;
                // Significant jump in error indicates potential manipulation
                if (diff > 45) artifactCount++; 
            }
        }

        const pixelCount = (originalWidth / step) * (originalHeight / step);
        const artifactRatio = artifactCount / pixelCount;

        return {
            elaScore: Math.min(100, artifactRatio * 1000), // Scale heuristic
            isHighlyInconsistent: artifactRatio > 0.05
        };
    } catch (err) {
        console.warn("ELA Analysis failed:", err.message);
        return { elaScore: 0, isHighlyInconsistent: false };
    }
}

/**
 * STEP 8: VISUAL SIGNAL ANALYSIS
 * (Logic applied on text/metadata since we don't have deep computer vision models loaded yet)
 */
function analyzeVisualSignals(text, structures, confidence, elaData = {}) {
    const signals = [];
    const content = text.toLowerCase();

    // 0. Pixel-Level Compression Anomaly (ELA)
    if (elaData.isHighlyInconsistent) {
        signals.push('COMPRESSION_ANOMALY');
    }

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
        totalPages: 0,
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
            pipelineResult.totalPages = 1;
            pipelineResult.extractionMethod.push("IMAGE_OCR_ENHANCED");
            
            // Step 4: Normalize
            const jimpImg = await Jimp.read(fileBuffer);
            jimpImg.greyscale().contrast(0.5).normalize();
            const normBuffer = await jimpImg.getBuffer('image/png');
            
            // Step 6: OCR
            const worker = await createWorker('eng');
            const ocrRes = await runMultiPassOCR(normBuffer, worker);
            await worker.terminate();
            
            textAccumulator = ocrRes.text;
            totalConfidence = ocrRes.confidence;
            pagesProcessed = 1;
            pipelineResult.firstImgBuffer = normBuffer; // Store for ELA
        } 
        
        // --- PATH B: PDF PROCESSING ---
        else if (mimeType.includes('pdf')) {
            // Step 1: Intelligence
            console.log(`🔍 [Pipeline] Analyzing PDF structure...`);
            const pdfData = await analyzePdfStructure(fileBuffer);
            pipelineResult.docType = pdfData.docType;
            pipelineResult.totalPages = pdfData.pages.length;
            
            console.log(`📄 [Pipeline] PDF Type: ${pdfData.docType}, Total Pages: ${pdfData.pages.length}`);

            // Limit processing to max 10 pages for performance in this prototype
            const MAX_PAGES = 10;
            const pagesToProcess = pdfData.pages.slice(0, MAX_PAGES);

            // Start a single worker for all pages to save RAM
            const worker = await createWorker('eng');

            for (const page of pagesToProcess) {
                try {
                    console.log(`⏳ [Pipeline] Processing Page ${page.pageIndex}/${pdfData.pages.length} (${page.type})...`);
                    let pageText = "";
                    let method = "";
                    let pageConf = 100;

                    // Step 2 & 6: Routing with fallback logic
                    const content = await page.pageRef.getTextContent();
                    const digitalText = content.items.map(i => i.str).join(' ').trim();
                    
                    pageText = digitalText; // Start with digital
                    method = "DIGITAL_PARSE";

                    if (digitalText.length < 150) {
                        // If digital text is sparse, it's likely a scan with a tiny metadata layer.
                        // Try OCR as the primary method, but keep digital as fallback.
                        try {
                            // Use a slightly smaller scale (1.5x) for multi-page to save RAM on 512MB Render
                            const imgBuffer = await renderAndNormalizeParams(page.pageRef, 1.5);
                            const ocr = await runMultiPassOCR(imgBuffer, worker);
                            
                            if (ocr.text && ocr.text.trim().length > pageText.length) {
                                pageText = ocr.text;
                                pageConf = ocr.confidence;
                                method = digitalText.length > 0 ? "HYBRID_OCR" : "OCR_ENHANCED";
                                if (!pipelineResult.firstImgBuffer) pipelineResult.firstImgBuffer = imgBuffer; // Store first OCR page for ELA
                            }
                        } catch (ocrErr) {
                            console.warn(`⚠️ [Pipeline] OCR failed for Page ${page.pageIndex}, falling back to Digital.`);
                        }
                    }

                    if (pageText && pageText.trim().length > 2) {
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
                }
            }
            
            await worker.terminate();
            
            if (pagesProcessed > 0) {
                totalConfidence = totalConfidence / pagesProcessed; // Average
            }
        }

        pipelineResult.text = textAccumulator || "[No text recovered from any page]";
        pipelineResult.pagesAnalyzed = pagesProcessed;
        pipelineResult.confidence = totalConfidence;

        // Step 7 & 8: Signal Extraction
        const elaData = (pipelineResult.firstImgBuffer) ? await detectDigitalManipulation(pipelineResult.firstImgBuffer) : {};
        pipelineResult.signals.structures = extractStructures(pipelineResult.text);
        pipelineResult.signals.visual_anomalies = analyzeVisualSignals(pipelineResult.text, pipelineResult.signals.structures, totalConfidence, elaData);

        // Explicit boolean flags for easier consumption
        pipelineResult.signals.isAiGenerated = pipelineResult.signals.visual_anomalies.includes('AI_GENERATED_TRACE');
        pipelineResult.signals.isManipulated = pipelineResult.signals.visual_anomalies.includes('EDITING_TOOL_TRACE') || pipelineResult.signals.visual_anomalies.includes('COMPRESSION_ANOMALY');

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
