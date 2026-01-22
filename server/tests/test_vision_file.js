import vision from '@google-cloud/vision';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credsPath = path.join(__dirname, '..', 'trustscan-485113-bd2860b6477e.json');

async function test() {
    console.log('--- Testing with GOOGLE_APPLICATION_CREDENTIALS file path ---');
    try {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
        console.log('Path:', credsPath);

        const client = new vision.ImageAnnotatorClient();
        console.log('Client initialized.');

        console.log('Performing call...');
        const tinyPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        await client.textDetection({ image: { content: tinyPixel } });
        console.log('✅ Success! Google Vision API responded using file-based credentials.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.stack) console.log(err.stack);
    }
}

test();
