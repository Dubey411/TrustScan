import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

async function test() {
    console.log('--- Testing File-Based Auth ---');
    try {
        const auth = new GoogleAuth({
            keyFile: './trustscan-485113-bd2860b6477e.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        console.log('✅ Success! File-based auth works.');
    } catch (err) {
        console.error('❌ File-based auth failed:', err.message);
    }
}

test();
