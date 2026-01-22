import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function test() {
    console.log('--- Testing REST Transport Workaround ---');
    if (!process.env.GOOGLE_CREDENTIALS_JSON) {
        console.error('Missing GOOGLE_CREDENTIALS_JSON');
        return;
    }

    try {
        const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        if (creds.private_key) {
           creds.private_key = creds.private_key.replace(/\\n/g, '\n');
        }

        console.log('Initializing Vision Client with transport: "rest"...');
        const client = new vision.ImageAnnotatorClient({ 
            credentials: creds,
            transport: 'rest'
        });
        
        console.log('Performing call...');
        const tinyPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        const [result] = await client.textDetection({ image: { content: tinyPixel } });
        console.log('✅ SUCCESS! Google Vision API responded using REST transport.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.stack) console.log(err.stack);
    }
}

test();
