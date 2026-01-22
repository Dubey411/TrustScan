import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock Dependencies
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Test Script
async function testRender() {
    console.log('--- Testing renderPdfToImages ---');
    try {
        // Try to import the renderer logic we just fixed or mock it
        // Since we can't easily import internal named exports if not exposed, 
        // we will copy the function logic here to verify it works in isolation first.
        
        try {
           const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs'); 
           console.log('✅ pdfjs-dist legacy import success');
        } catch(e) {
           console.error('❌ pdfjs-dist legacy import failed:', e.message);
        }
        
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

testRender();
