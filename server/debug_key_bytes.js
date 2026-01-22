import fs from 'fs';

const filePath = 'trustscan-485113-bd2860b6477e.json';
const data = fs.readFileSync(filePath, 'utf8');
const searchStr = '"private_key": "';
const startIdx = data.indexOf(searchStr);

if (startIdx !== -1) {
    const keyStart = startIdx + searchStr.length;
    const keyEnd = data.indexOf('",', keyStart);
    if (keyEnd !== -1) {
        const fullKey = data.substring(keyStart, keyEnd);
        console.log('--- Raw Key Byte Check ---');
        console.log('Total characters in private_key field:', fullKey.length);
        console.log('First 5 characters:', JSON.stringify(fullKey.substring(0, 5)));
        console.log('Last 50 characters (escaped):', JSON.stringify(fullKey.substring(fullKey.length - 50)));
        
        const body = fullKey.replace(/-----BEGIN PRIVATE KEY-----\\n/g, '')
                            .replace(/\\n-----END PRIVATE KEY-----\\n/g, '')
                            .replace(/\\n/g, '');
        console.log('Base64 Body characters:', body.length);
        console.log('Modulo 4:', body.length % 4);
    } else {
        console.log('Could not find end of key field');
    }
} else {
    console.log('Could not find start of key field');
}
