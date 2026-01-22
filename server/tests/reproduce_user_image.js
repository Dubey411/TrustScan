import fs from 'fs';

async function testUserImage() {
    console.log('--- Testing /api/scan with User Image ---');
    try {
        const imagePath = 'C:/Users/dubey/.gemini/antigravity/brain/0b78c34a-2810-4b34-be7d-8209c3b48925/uploaded_image_1769097367964.png';
        const buffer = fs.readFileSync(imagePath);
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        
        let header = `--${boundary}\r\n`;
        header += 'Content-Disposition: form-data; name="file"; filename="upload.png"\r\n';
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

        console.log(`Sending multipart request (${buffer.length} bytes) to http://127.0.0.1:5000/api/scan...`);
        const response = await fetch('http://127.0.0.1:5000/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response Body Length:', text.length);
        console.log('Response Body Snippet:', text.substring(0, 100));
    } catch (err) {
        console.error('❌ Request failed:', err.message);
    }
}

testUserImage();
