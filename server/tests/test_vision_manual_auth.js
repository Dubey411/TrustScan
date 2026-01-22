import vision from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credsPath = path.join(__dirname, '..', 'trustscan-485113-bd2860b6477e.json');

async function test() {
    console.log('--- Testing Manual Auth Injection ---');
    try {
        const auth = new GoogleAuth({
            keyFile: credsPath,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        // This is the key: pass the auth instance directly
        const client = new vision.ImageAnnotatorClient({ auth });
        console.log('Client initialized with manual auth.');

        console.log('Performing call...');
        const tinyPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        const [result] = await client.textDetection({ image: { content: tinyPixel } });
        console.log('✅ SUCCESS! Manual Auth Injection Worked!');
    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.stack) console.log(err.stack);
    }
}

test();
