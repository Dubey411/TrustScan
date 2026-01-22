import fs from 'fs';

const filePath = 'trustscan-485113-bd2860b6477e.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const rawKey = data.private_key;

const body = rawKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .replace(/\s/g, '');

const buf = Buffer.from(body, 'base64');
console.log('--- Key Body First 32 Bytes (Hex) ---');
console.log(buf.slice(0, 32).toString('hex'));
console.log('Length of buffer:', buf.length);

if (buf[0] === 0x30 && buf[1] === 0x82) {
    console.log('✅ Starts with standard ASN.1 Sequence (30 82)');
} else {
    console.warn('❌ INVALID START: Expected 30 82, got', buf[0].toString(16), buf[1].toString(16));
}
