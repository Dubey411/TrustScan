
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processDocument } from '../services/ocrProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');

async function testPipeline() {
    console.log("🚀 Starting Pipeline Verification Test...");
    
    const testPdfPath = path.join(SERVER_ROOT, 'test.pdf');
    
    if (fs.existsSync(testPdfPath)) {
        console.log(`\n📄 Testing with ${testPdfPath}...`);
        const buffer = fs.readFileSync(testPdfPath);
        const result = await processDocument(buffer, 'application/pdf', 'test.pdf');
        
        console.log("\n--- RESULT SUMMARY ---");
        console.log("Verdict:", result.scanMeta.verdictLabel);
        console.log("Confidence:", result.scanMeta.confidence);
        console.log("Source:", result.scanMeta.source);
        console.log("Text Length:", result.text.length);
        console.log("Signals:", JSON.stringify(result.externalSignals));
        
        if (result.text.length > 50) {
            console.log("✅ Pipeline Test PASSED for PDF");
        } else {
            console.error("❌ Pipeline Test FAILED: Low text extracted");
        }
    } else {
        console.warn("⚠️ test.pdf not found. Skipping PDF test.");
    }
}

testPipeline().catch(console.error);
