import fs from 'fs';

const filePath = 'trustscan-485113-bd2860b6477e.json';
try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const key = data.private_key || "";
    console.log('--- JSON Integrity Check ---');
    console.log('Project ID:', data.project_id);
    console.log('Key Length:', key.length);
    
    const body = key
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\\n/g, '')
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\s/g, '');
    
    console.log('Base64 Body Length:', body.length);
    console.log('Modulo 4:', body.length % 4);
    console.log('Ends with:', body.slice(-20));
    
    if (body.length % 4 !== 0) {
        console.warn('CRITICAL: Key is truncated at the source!');
    } else {
        console.log('Key seems complete at the source.');
    }
} catch (err) {
    console.error('Error reading JSON:', err.message);
}
