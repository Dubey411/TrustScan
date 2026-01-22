async function testScanMultipart() {
    console.log('--- Testing /api/scan Multipart Reproduction ---');
    try {
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        
        let body = '';
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="file"; filename="test.png"\r\n';
        body += 'Content-Type: image/png\r\n\r\n';
        body += buffer.toString('binary') + '\r\n';
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="type"\r\n\r\n';
        body += 'document\r\n';
        body += `--${boundary}--\r\n';

        console.log('Sending multipart request to http://localhost:5000/api/scan...');
        const response = await fetch('http://localhost:5000/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: Buffer.from(body, 'binary')
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('❌ Request failed:', err.message);
    }
}

testScanMultipart();
