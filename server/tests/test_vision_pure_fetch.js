import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch'; // Assuming it's available or use built-in fetch if node >= 18
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credsPath = path.join(__dirname, '..', 'trustscan-485113-bd2860b6477e.json');

async function test() {
    console.log('--- Testing Pure Fetch + Manual Token ---');
    try {
        const auth = new GoogleAuth({
            keyFile: credsPath,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        console.log('Getting access token...');
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const token = tokenResponse.token;
        console.log('✅ Token acquired.');

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

        console.log('Sending Fetch request...');
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (res.ok) {
            console.log('✅ SUCCESS! Pure Fetch API responded.');
            console.log('Result (truncated):', JSON.stringify(data).substring(0, 100));
        } else {
            console.error('❌ Fetch failed with status:', res.status);
            console.error('Response:', JSON.stringify(data));
        }
    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}

test();
