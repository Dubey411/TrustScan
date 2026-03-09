import dotenv from 'dotenv';
dotenv.config();

async function testMca(name) {
    const apiKey = process.env.MCA_API_KEY;
    // Test if partial work with filter
    const apiUrl = `https://api.data.gov.in/resource/4dbe5667-7b6b-41d7-82af-211562424d9a?api-key=${apiKey}&format=json&filters[CompanyName]=${encodeURIComponent(name.toUpperCase())}`;
    
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        console.log("SEARCH TERM:", name);
        console.log("COUNT:", data.records?.length || 0);
        if (data.records && data.records.length > 0) {
            data.records.forEach((r, i) => {
                console.log(`[${i}] NAME:`, r.CompanyName, "CIN:", r.CIN);
            });
        }
    } catch(e) {
        console.log("Error", e.message);
    }
}

testMca("Jorim Technology Solutions Private Limited");
