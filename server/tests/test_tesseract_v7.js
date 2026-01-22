import { createWorker } from 'tesseract.js';
import fs from 'fs';

async function test() {
    console.log('--- Testing Tesseract.js v7 ---');
    try {
        console.log('Creating worker...');
        const worker = await createWorker('eng');
        console.log('Worker created successfully.');

        // 1x1 white pixel
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
        
        console.log('Recognizing...');
        const { data: { text } } = await worker.recognize(buffer);
        console.log('Success! Text:', text);
        
        await worker.terminate();
        console.log('Worker terminated.');
    } catch (err) {
        console.error('❌ Tesseract.js failed:', err);
    }
}

test();
