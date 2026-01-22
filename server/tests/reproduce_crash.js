import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

async function testScan() {
    console.log('--- Testing /api/scan Reproduction ---');
    try {
        const form = new FormData();
        // 1x1 pixel image
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
        
        form.append('file', buffer, {
            filename: 'test.png',
            contentType: 'image/png'
        });
        form.append('type', 'document');
        form.append('userId', 'test-user');

        console.log('Sending request to http://localhost:5000/api/scan...');
        const response = await fetch('http://localhost:5000/api/scan', {
            method: 'POST',
            body: form
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Request failed:', err.message);
        if (err.stack) console.log(err.stack);
    }
}

testScan();
