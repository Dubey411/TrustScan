const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  type: 'link',
  content: '101nitro.com'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/scan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    fs.writeFileSync('scan_debug.json', body);
    console.log('Done');
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
