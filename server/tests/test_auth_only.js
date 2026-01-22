import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

async function test() {
    console.log('--- Testing Auth Library Directly ---');
    try {
        const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        
        // Standardize key
        const cleanKey = creds.private_key.replace(/\\n/g, '\n');
        const keyObj = crypto.createPrivateKey(cleanKey);
        creds.private_key = keyObj.export({ type: 'pkcs8', format: 'pem' });

        const auth = new GoogleAuth({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        console.log('Authenticating...');
        const client = await auth.getClient();
        console.log('Client acquired.');

        console.log('Fetching Access Token...');
        const token = await client.getAccessToken();
        console.log('✅ Success! Token acquired. Auth works with this key.');
        console.log('Token starts with:', token.token.substring(0, 10));
    } catch (err) {
        console.error('❌ Auth Library Failed:', err.message);
        if (err.stack) console.log(err.stack);
    }
}

test();
