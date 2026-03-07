// Use global fetch

async function testBackend() {
    console.log("🧪 Testing Backend API /api/scan...");
    try {
        const response = await fetch('http://localhost:5000/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: "This is a test scan for L&T ECC recruitment@lntecc.com",
                type: "text",
                userId: "test_user_123",
                depth: "deep"
            })
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ API Test Failed:", e.message);
    }
}

testBackend();
