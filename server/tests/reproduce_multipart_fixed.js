async function testScanMultipart() {
    console.log('--- Testing /api/scan Multipart (Fixed) ---');
    try {
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        
        let header = `--${boundary}\r\n`;
        header += 'Content-Disposition: form-data; name="file"; filename="test.png"\r\n';
        header += 'Content-Type: image/png\r\n\r\n';
        
        let footer = `\r\n--${boundary}\r\n`;
        footer += 'Content-Disposition: form-data; name="type"\r\n\r\n';
        footer += 'document\r\n';
        footer += `--${boundary}--\r\n`;

        const body = Buffer.concat([
            Buffer.from(header, 'utf8'),
            buffer,
            Buffer.from(footer, 'utf8')
        ]);

        console.log('Sending multipart request to http://localhost:5000/api/scan...');
        const response = await fetch('http://localhost:5000/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Request failed:', err.message);
    }
}

testScanMultipart();
