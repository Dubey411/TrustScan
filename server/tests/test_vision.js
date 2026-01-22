import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';

dotenv.config();

async function test() {
    if (!process.env.GOOGLE_CREDENTIALS_JSON) {
        console.error('Missing GOOGLE_CREDENTIALS_JSON');
        return;
    }

    try {
        const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        if (creds.private_key) {
            creds.private_key = creds.private_key.replace(/\\n/g, '\n');
        }
        const credsPath = path.join(os.tmpdir(), 'test-google-creds.json');
        fs.writeFileSync(credsPath, JSON.stringify(creds));
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
        
        console.log('Testing Vision Client...');
        const client = new vision.ImageAnnotatorClient();
        console.log('Client initialized. Testing authentication...');
        
        // Try a very small request
        await client.textDetection({content: Buffer.alloc(0)});
        console.log('Success! (Expected buffer empty error if auth worked)');
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

test();
