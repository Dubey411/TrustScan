import { processDocument } from './services/ocrProcessor.js';
import fs from 'fs';

// Create a dummy buffer (1x1 PNG is fine, we just need the logic to trigger)
const dummyBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

async function testPDFGatedOCR() {
    console.log("--- 🧪 TrustScan PDF Gated OCR Test ---");
    
    // Test Case: PDF with no text (Scanned PDF simulation)
    // We expect extractionSource to be "PDF_PARSE + EASYOCR" (or just + EASYOCR if PDF_PARSE fails)
    console.log("\n1. Testing Scanned PDF (Trigger should fire based on PDF + 0 text)...");
    
    try {
        const result = await processDocument(dummyBuffer, 'application/pdf', 'ScannedOffer.pdf');
        console.log("Extraction Source:", result.scanMeta.source);
        console.log("Verdict Label:", result.scanMeta.verdictLabel);
    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testPDFGatedOCR();
