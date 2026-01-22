import fs from 'fs';
import crypto from 'crypto';

const filePath = 'trustscan-485113-bd2860b6477e.json';
try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const rawKey = data.private_key;
    
    // Exact logic from ocrProcessor.js
    const body = rawKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\\n/g, '')
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\s/g, '');
    
    const wrappedBody = body.match(/.{1,64}/g).join('\n');
    const pemKey = `-----BEGIN PRIVATE KEY-----\n${wrappedBody}\n-----END PRIVATE KEY-----\n`;

    console.log('--- RECONSTRUCTED PEM ---');
    console.log(pemKey.substring(0, 50) + '...');
    console.log('...');
    console.log(pemKey.substring(pemKey.length - 50));

    console.log('\n--- VERIFYING WITH CRYPTO.SIGN ---');
    try {
        const sign = crypto.createSign('SHA256');
        sign.update('hello');
        const signature = sign.sign(pemKey);
        console.log('✅ SUCCESS! Node.js crypto signed the message.');
        console.log('Signature length:', signature.length);
    } catch (cryptoErr) {
        console.error('❌ FAILED! Node.js crypto rejected the key:', cryptoErr.message);
    }
} catch (err) {
    console.error('Error:', err.message);
}
