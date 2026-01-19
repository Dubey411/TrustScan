import { processDocument } from '../services/ocrProcessor.js';
import fs from 'fs';
import path from 'path';

async function testScan() {
    console.log('🧪 Starting Mock PDF Scan...');
    
    // Create a minimal valid PDF buffer (or just use an empty one to test failure handling)
    // A more realistic test would be to use an actual small PDF file if one exists.
    const mockBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 1 >>\nstream\n \nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n0000000178 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n230\n%%EOF');

    try {
        const result = await processDocument(mockBuffer, 'application/pdf', 'test.pdf');
        console.log('\n--- Scan Result ---');
        console.log('Source:', result.scanMeta.source);
        console.log('Text Length:', result.scanMeta.textLength);
        console.log('Verdict Label:', result.scanMeta.verdictLabel);
        console.log('Text Snippet:', result.text.substring(0, 100));
        console.log('-------------------\n');
    } catch (err) {
        console.error('\n❌ Scan Test FAILED:');
        console.error(err);
    }
}

testScan();
