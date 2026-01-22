import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credsPath = path.join(__dirname, '..', 'trustscan-485113-bd2860b6477e.json');

async function test() {
    console.log('--- Testing Raw HTTP API Call ---');
    try {
        const auth = new GoogleAuth({
            keyFile: credsPath,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const client = await auth.getClient();
        const url = 'https://vision.googleapis.com/v1/images:annotate';
        
        const tinyPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        
        const body = {
            requests: [
                {
                    image: { content: tinyPixelBase64 },
                    features: [{ type: 'TEXT_DETECTION' }]
                }
            ]
        };

        console.log('Sending POST request via Authorized Client...');
        const res = await client.request({
            url,
            method: 'POST',
            data: body
        });

        console.log('✅ SUCCESS! Raw HTTP API responded.');
        console.log('Result:', JSON.stringify(res.data).substring(0, 100));
    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.stack) console.log(err.stack);
    }
}

test();
