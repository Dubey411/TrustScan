async function testScan() {
    console.log('--- Testing /api/scan Reproduction (Simplified) ---');
    try {
        const body = JSON.stringify({
            content: "Test text scan",
            type: "message",
            userId: "test-user"
        });

        console.log('Sending request to http://localhost:5000/api/scan...');
        const response = await fetch('http://localhost:5000/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Request failed:', err.message);
    }
}

testScan();
