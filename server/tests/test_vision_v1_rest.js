import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function test() {
    console.log('--- Testing v1.ImageAnnotatorClient + REST ---');
    if (!process.env.GOOGLE_CREDENTIALS_JSON) {
        console.error('Missing GOOGLE_CREDENTIALS_JSON');
        return;
    }

    try {
        const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        if (creds.private_key) {
           creds.private_key = creds.private_key.replace(/\\n/g, '\n');
        }

        // Use the v1 specific client which might have different transport handling
        const client = new vision.v1.ImageAnnotatorClient({ 
            credentials: creds,
            transport: 'rest'
        });
        
        console.log('Performing call...');
        const tinyPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        const request = {
            requests: [
                {
                    image: { content: tinyPixelBase64 },
                    features: [{ type: 'TEXT_DETECTION' }]
                }
            ]
        };

        const [response] = await client.batchAnnotateImages(request);
        console.log('✅ SUCCESS! v1 REST API responded.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}

test();
