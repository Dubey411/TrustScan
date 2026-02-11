import { runRules } from '../services/engine/rulesEngine.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testIntelligenceLayers() {
    console.log("🧪 Starting TrustScan Intelligence Layer Tests...\n");
    
    // Connect to DB for TrustEntity checks
    await connectDB();

    // TEST 1: Temporal Paradox (Old CIN + Throwaway Domain)
    const temporalData = "Corporate CIN: L12345MH2010PLC012345. Please visit our application portal: https://official-jobs.vercel.app";
    const temporalResult = await runRules(temporalData, { hasCin: 1 });
    console.log("1. Temporal Paradox Test:");
    console.log(`   - Reasons: ${JSON.stringify(temporalResult.reasons)}`);
    console.log(`   - Risk Score: ${temporalResult.riskScore}%\n`);

    // TEST 2: Urgency Velocity (Pressure mounts at the end)
    const velocityData = "Welcome to our company. We offer a great environment for growth and learning. We pride ourselves on our transparency and professional ethics. However, you MUST PAY the registration fee IMMEDIATELY to secure your slot. Failure to pay within 5 minutes will result in PERMANENT DISQUALIFICATION. DO IT NOW.";
    const velocityResult = await runRules(velocityData);
    console.log("2. Urgency Velocity Test:");
    console.log(`   - Flow: ${JSON.stringify(velocityResult.flags.red.filter(r => r.includes('Velocity')))}`);
    console.log(`   - Risk Score: ${velocityResult.riskScore}%\n`);

    // TEST 3: Visual Paradox (Simulated OCR Discrepancy)
    const paradoxData = "Standard job offer details here...";
    const paradoxResult = await runRules(paradoxData, { ocrConfidenceParadox: 1 });
    console.log("3. Visual Paradox Test:");
    console.log(`   - Reasons: ${JSON.stringify(paradoxResult.reasons.filter(r => r.includes('Paradox')))}`);
    console.log(`   - Risk Score: ${paradoxResult.riskScore}%\n`);

    console.log("✅ Intelligence Layer Testing Complete.");
    process.exit(0);
}

testIntelligenceLayers().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
});
