import vision from '@google-cloud/vision';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credsPath = path.join(__dirname, '..', 'trustscan-485113-bd2860b6477e.json');

async function test() {
    console.log('--- Testing REST + keyFilename ---');
    try {
        const client = new vision.ImageAnnotatorClient({ 
            keyFilename: credsPath,
            transport: 'rest'
        });
        
        console.log('Performing call...');
        const tinyPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        const [result] = await client.textDetection({ image: { content: tinyPixel } });
        console.log('✅ SUCCESS! Google Vision API responded using REST + keyFilename.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.stack) console.log(err.stack);
    }
}

test();
