import { createRequire } from 'module';
import { createWorker } from 'tesseract.js';
import vision from '@google-cloud/vision';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');

// Lazy-Initialize Google Vision Client
let visionClient = null;
function getVisionClient() {
    if (visionClient) return visionClient;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT) {
        try {
            visionClient = new vision.ImageAnnotatorClient();
            return visionClient;
        } catch (err) {
            console.warn('⚠️ [OCR] Failed to initialize Google Vision client:', err.message);
        }
    }
    return null;
}

/**
 * Universal OCR Processor
 * Strategy: Hybrid (Google Vision Primary -> Tesseract Fallback)
 */
export async function processDocument(fileBuffer, mimeType, originalName = "") {
    console.log(`📄 [OCR Processor] Processing: ${originalName || 'Buffer'} (${mimeType}) - Size: ${fileBuffer?.length} bytes`);
    
    let text = "";
    let externalSignals = initializeSignals();
    let trustSignals = initializeTrustSignals();
    let extractionSource = "NONE";
    let pdfMetadata = {};
    
    // Robust detection: Mimetype OR Filename extension
    const isPDF = (mimeType && mimeType.toLowerCase().includes('pdf')) || (originalName && originalName.toLowerCase().endsWith('.pdf'));

    try {

        // --- 1. PDF Processing ---
        if (isPDF) {
            console.log('🔍 [OCR] PDF detected, starting processPDF...');
            const pdfResult = await processPDF(fileBuffer, externalSignals, trustSignals);
            text = pdfResult.text || "";
            pdfMetadata = pdfResult.metadata || {};
            extractionSource = "PDF_PARSE";
            console.log(`✅ [OCR] PDF_PARSE complete. Extracted ${text.length} chars.`);
        } 
        // --- 2. Image Processing (Hybrid) ---
        else if (mimeType.startsWith('image/')) {
            try {
                // A. Primary: Google Vision
                const client = getVisionClient();
                if (client) {
                    console.log('🔍 [OCR] Attempting Google Vision...');
                    const [result] = await client.textDetection(fileBuffer);
                    const detections = result.textAnnotations;
                    if (detections && detections.length > 0) {
                        text = detections[0].description;
                        extractionSource = "GOOGLE_VISION";
                        
                        // Check for text density/layout anomalies (Google specific)
                        if (detections[0].confidence && detections[0].confidence < 0.8) {
                             externalSignals.ocrConfidenceParadox = 1; // High quality image but low confidence
                        }
                    }
                }
            } catch (gErr) {
                console.warn('⚠️ [OCR] Google Vision failed/skipped, falling back to Tesseract:', gErr.message);
            }

            // B. Fallback: Tesseract.js
            if (!text) {
                console.log('🔍 [OCR] Using Tesseract Fallback...');
                const worker = await createWorker('eng');
                const { data: { text: ocrText, confidence } } = await worker.recognize(fileBuffer);
                text = ocrText;
                await worker.terminate();
                extractionSource = "TESSERACT";
                
                if (confidence < 60) {
                     externalSignals.lowOcrConfidence = 1;
                }
            }
        }

    } catch (err) {
        console.error('❌ [OCR Processor] Primary Layer Failed:', err);
    }

    // --- 3. Gated Deep Scan (EasyOCR Booster) ---
    // Safety Net: Run if unreadable, or high-risk, or low-confidence
    const isLowConfidence = extractionSource === "GOOGLE_VISION" ? false : true; 
    const hasDeepScanTriggers = /payment|transaction|txn|upi|receipt|offer|letter|proof/i.test(text);
    const isUnreadablePDF = isPDF && (!text || text.trim().length === 0);
    
    if (isUnreadablePDF || (mimeType && mimeType.startsWith('image/') && (isLowConfidence || hasDeepScanTriggers || externalSignals.lowOcrConfidence))) {
        try {
            console.log(`🚀 [OCR] DEEP SCAN TRIGGERED (IsUnreadablePDF: ${isUnreadablePDF})...`);
            const fileExt = isPDF ? '.pdf' : '.png';
            
            // Flexible Timeout: 30s base or 30s per page for PDFs
            const pageCount = (pdfMetadata && pdfMetadata.pages) || 1;
            const dynamicTimeout = Math.min(Math.max(30000, pageCount * 30000), 240000); // 30s-240s
            
            console.log(`⏱️ [OCR] Dynamic Timeout Applied: ${dynamicTimeout/1000}s`);
            const deepScanResult = await runPreciseOCR(fileBuffer, fileExt, dynamicTimeout);
            
            console.log(`📊 [OCR] Deep Scan Result Success: ${deepScanResult.success}`);
            if (deepScanResult.success && (deepScanResult.text?.length > 5)) {
                console.log(`✅ [OCR] Deep Scan added/recovered ${deepScanResult.text.length} chars.`);
                text = (text && text.length > 0) ? (text + "\n" + deepScanResult.text) : deepScanResult.text;
                extractionSource = extractionSource === "NONE" ? "EASYOCR" : (extractionSource + " + EASYOCR");
            }
        } catch (deepErr) {
            console.error('❌ [OCR Processor] Deep Scan Failed:', deepErr);
        }
    }

    // Fallback Text 
    let isUnreadable = false;
    if (!text || text.trim().length === 0) {
        const reason = isPDF ? "Scanned PDF / No text layer found" : (mimeType?.startsWith('image/') ? "Blurry / Deep scan failed" : "Unsupported format");
        console.warn(`⚠️ [OCR Processor] No text extracted (${reason}). Using fallback message.`);
        text = `[Document Content Not Readable - ${reason}] (V:D14-SECURE)`;
        isUnreadable = true;
    }

    // Determine Verdict Label
    let verdictLabel = "Document Analysis Complete";
    if (isUnreadable) {
        verdictLabel = "Unreadable / Scanned PDF";
    } else if (externalSignals.softwareMetadata || externalSignals.metadataAnomalies) {
        verdictLabel = "Edited / Manipulated";
    } else if (externalSignals.genericSuccessMsg || externalSignals.missingCriticalFields) {
        verdictLabel = "Synthetic / AI Generated";
    } else if (trustSignals.standardStructure || trustSignals.officialDomain) {
        verdictLabel = "Legitimate Document";
    }

    const scanMeta = {
        source: extractionSource,
        textLength: text.length,
        mimeType: mimeType,
        timestamp: new Date().toISOString(),
        producer: pdfMetadata.producer || null,
        creator: pdfMetadata.creator || null,
        verdictLabel
    };

    console.log(`✅ [OCR Complete] Source: ${extractionSource}, TextLen: ${text.length}`);
    return { text, externalSignals, trustSignals, scanMeta };
}

// --- Helpers ---

// Robust PDF Parsing
async function processPDF(buffer, externalSignals, trustSignals) {
    const require = createRequire(import.meta.url);
    const pdf = require('pdf-parse');
    
    // pdf-parse v2.4.5+ exports a class constructor, not a function
    // We need to use 'new' to instantiate it
    const PDFParser = (typeof pdf === 'function') ? pdf : (pdf.default || pdf.PDFParse || pdf);
    
    let data;
    try {
        console.log('⏳ [PDF] Calling pdf-parse...');
        // Try both as function (standard) and constructor (v2 style)
        if (typeof PDFParser === 'function') {
            data = await PDFParser(buffer);
        } else {
            console.log('DEBUG: PDFParser is NOT a function, trying as constructor...');
            data = await new PDFParser(buffer);
        }
        
        if (!data || !data.text) {
             console.warn('⚠️ [PDF] pdf-parse returned empty data structure.');
             return { text: "", metadata: {} };
        }
        
        console.log(`✅ [PDF] pdf-parse success. Pages: ${data.numpages}, Text Length: ${data.text?.length || 0}`);
        return { 
            text: data.text, 
            metadata: { 
                producer: data.info?.Producer || "", 
                creator: data.info?.Creator || "",
                pageCount: data.numpages 
            } 
        };
    } catch (err) {
        console.error('❌ [PDF] Parsing Error:', err.message);
        throw err;
    }
}

function checkSoftwareMetadata(metaString) {
    if (!metaString) return false;
    const suspiciousTools = [
        // AI Generators
        'midjourney', 'dall-e', 'stable diffusion', 'openai', 'jasper', 'huggingface', 'generative', 'ai-generated',
        // Advanced Editors
        'photoshop', 'gimp', 'figma', 'sketch', 'canva', 'paint.net', 'pixlr', 'coreldraw', 'illustrator',
        // Document Converters/Manipulators (often used for fakes)
        'ilovepdf', 'smallpdf', 'sejda', 'online-convert', 'pdf-editor'
    ];
    return suspiciousTools.some(tool => metaString.toLowerCase().includes(tool));
}

// Universal Signal Logic
function extractUniversalSignals(text, signals, trust) {
    if (!text) return; 
    const content = text.toLowerCase();

    // 1. Context Detection
    const isPayment = /payment|transaction|txn|upi|gpay|paytm|phonepe|amount|received|paid/i.test(content);
    const isOffer = /offer|letter|appointment|internship|job|salary|joining|stipend/i.test(content);
    
    // 2. AI Tool Traces in Text (Self-Attribution)
    if (/(generated by ai|midjourney|dall-e|stablediffusion|openai|image generated)/i.test(content)) {
        signals.genericSuccessMsg = 1; // Mark as synthetic
    }

    // 3. Text Behavior Signals (Red Flags)
    
    // Generic Success Messages (often used in fake generators)
    if (/payment successful/i.test(content) && !/txn|ref|id/i.test(content)) {
        signals.genericSuccessMsg = 1;
    }

    // Missing Critical Fields (Context Aware)
    if (isPayment) {
        if (!/(txn|ref|upi id|reference|utr)/i.test(content)) {
             signals.missingCriticalFields = 1;
        }
    }
    if (isOffer) {
        if (!/date|ref|hr|manager|authorized/i.test(content)) {
             signals.missingCriticalFields = 1;
        }
    }

    // Urgency / Demand
    if (/immediately|urgent|within \d+ hours|cancel|block/i.test(content)) {
        signals.urgency = 1;
    }
    
    // Context Mismatch (e.g. Internship asking for > 5000 fee)
    if (isOffer && /registration|deposit|fee/i.test(content)) {
         signals.contextMismatch = 1;
    }

    // 3. Trust Signals (Green Flags)
    
    // Official Domains
    if (/@(google|microsoft|amazon|infosys|tcs|wipro|axisbank|hdfcbank|icicibank)\.com/i.test(content)) {
        trust.officialDomain = 1;
    }

    // Standard Structure (No urgency + good context)
    if ((isPayment || isOffer) && !signals.urgency && !signals.softwareMetadata) {
        trust.standardStructure = 1;
    }
}

function initializeSignals() {
    return {
        // Universal Signals
        missingCriticalFields: 0,
        genericSuccessMsg: 0,
        softwareMetadata: 0,
        ocrConfidenceParadox: 0,
        lowOcrConfidence: 0,
        urgency: 0,
        contextMismatch: 0,
        
        // Legacy/Specific Support
        registrationFee: 0,
        unofficialDomain: 0,
        docAnomalies: 0,
        metadataAnomalies: 0,
        corporateAnomalies: 0
    };
}

function initializeTrustSignals() {
    return {
        officialDomain: 0,
        validMetadata: 0,
        standardStructure: 0
    };
}
/**
 * Python Worker Bridge for EasyOCR
 */
async function runPreciseOCR(buffer, extension = '.png', timeoutMs = 60000) {
    return new Promise((resolve) => {
        const tempPath = path.join(os.tmpdir(), `trustscan_ocr_${Date.now()}${extension}`);
        fs.writeFileSync(tempPath, buffer);

        const scriptPath = path.join(SERVER_ROOT, 'scripts', 'precise_ocr.py');
        const pythonProcess = spawn('python3', [scriptPath, tempPath]);
        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.warn(`⚠️ [OCR Deep Scan] Python STDERR: ${data.toString()}`);
        });

        pythonProcess.on('error', (err) => {
            console.error('❌ [OCR Deep Scan] Process failed to start:', err);
            resolve({ success: false, error: err.message });
        });

        const timeout = setTimeout(() => {
            console.error(`❌ [OCR] Deep Scan Timeout after ${timeoutMs/1000}s`);
            pythonProcess.kill();
            resolve({ success: false, error: "Timeout" });
        }, timeoutMs);

        pythonProcess.on('close', (code) => {
            clearTimeout(timeout);
            try {
                fs.unlinkSync(tempPath); // Clean up
                if (code === 0) {
                    try {
                        resolve(JSON.parse(output));
                    } catch (pErr) {
                        console.error('❌ [OCR Deep Scan] Failed to parse JSON output:', output);
                        resolve({ success: false, error: "Invalid JSON output" });
                    }
                } else {
                    console.error(`❌ [OCR Deep Scan] Process exited with code ${code}. Stderr: ${errorOutput}`);
                    resolve({ success: false, error: `Process exited with code ${code}` });
                }
            } catch (e) {
                resolve({ success: false, error: e.message });
            }
        });
    });
}
