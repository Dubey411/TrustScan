import { processDocument } from '../services/ocrProcessor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testOCRBooster() {
    console.log('🧪 Starting OCR Booster Integration Test...');

    // 1. Load a sample image (UPI QR code)
    const imagePath = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'upi-qr.png');
    
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Test aborted: Sample image not found at ${imagePath}`);
        process.exit(1);
    }

    const fileBuffer = fs.readFileSync(imagePath);
    const mimeType = 'image/png';
    const originalName = 'upi-qr.png';

    console.log(`📸 Testing with image: ${originalName}`);

    try {
        // 2. Process the document
        // This should trigger EasyOCR if Google Vision is absent or confidence is low
        const result = await processDocument(fileBuffer, mimeType, originalName);

        console.log('\n--- OCR Result ---');
        console.log(`Source: ${result.scanMeta.source}`);
        console.log(`Text Length: ${result.scanMeta.textLength}`);
        console.log(`Verdict: ${result.scanMeta.verdictLabel}`);
        console.log(`Preview: ${result.text.substring(0, 100)}...`);
        console.log('------------------\n');

        // 3. Assertions
        if (result.text.length > 0) {
            console.log('✅ SUCCESS: Text extracted successfully.');
        } else {
            console.log('❌ FAILURE: No text extracted.');
        }

        if (result.scanMeta.source.includes('EASYOCR')) {
            console.log('✅ SUCCESS: EasyOCR booster was triggered.');
        } else {
            console.log('ℹ️ INFO: EasyOCR was not triggered (Primary OCR likely succeeded with high confidence).');
        }

        console.log('\n--- Signals Detected ---');
        console.log(JSON.stringify(result.externalSignals, null, 2));
        console.log('------------------------\n');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    }
}

testOCRBooster();
