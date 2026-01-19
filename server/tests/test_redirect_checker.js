import { analyzeLinks } from '../services/linkScanner.js';

async function testRedirects() {
    console.log('🧪 Starting Redirect Checker Test...');

    const testText = "Check out this offer: https://bit.ly/3yL8s9X (supposedly safe) and http://tinyurl.com/mry883 (example).";
    
    // Note: Since we are using real network requests in linkScanner, we need meaningful targets.
    // If these specific links expire, the test might show 404, but the chain should still be attempted.
    // For a robust test without external deps, we'd mock fetch, but here we want to test the loop.
    
    // Let's use a known safe short link if possible, or just see if it attempts it.
    console.log(`📝 Analyzing text: "${testText}"`);

    const result = await analyzeLinks(testText);

    console.log('\n--- Analysis Result ---');
    console.log(`🔗 Links Found: ${result.metadata.linkCount}`);
    
    result.metadata.detectedLinks.forEach((link, i) => {
        console.log(`\n[Link ${i+1}] ${link.url}`);
        console.log(`   Host: ${link.host}`);
        console.log(`   Flags: ${link.flags.join(', ')}`);
        
        if (link.redirectChain) {
            console.log(`   🔁 Redirect Chain (${link.redirectChain.length} hops):`);
            link.redirectChain.forEach((hop, j) => {
                console.log(`      ${j+1}. ${hop}`);
            });
            console.log(`   🎯 Final Destination: ${link.finalDestination}`);
        } else {
            console.log(`   ❌ No redirect chain captured (might not be a shortener or request failed).`);
        }
    });
}

testRedirects();
