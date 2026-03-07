import { generateAIInsight } from '../services/analysis/aiReasoningService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkServerLogs() {
    console.log("🧪 Verifying AI Insight Objective Intelligence...\n");
    const testContent = "Specialized Construction Roles at Larsen & Toubro ECC. Contact our HR at recruitment@lntecc.com for job verification.";
    const riskScore = 15;
    const reasons = ["Verified Corporate Domain"];
    const signals = { trustedDomain: 1, knownBrand: 1 };
    const metadata = { 
        detectedEntities: [
            { 
                type: 'Domain', 
                value: 'lntecc.com', 
                isValid: true, 
                enrichment: { name: 'Larsen & Toubro ECC', status: 'Active' } 
            }
        ] 
    };

    try {
        console.log("🚀 Testing with Trusted Domain (lntecc.com)...");
        const result = await generateAIInsight(testContent, riskScore, reasons, signals, metadata);
        console.log("\n✨ FINAL AI RESULT:");
        console.log("--------------------------------------------------");
        console.log(`Insight: ${result.insight}`);
        console.log(`Engine:  ${result.modelUsed}`);
        console.log("--------------------------------------------------\n");
    } catch (err) {
        console.error("❌ Test Failed:", err);
    }
}

checkServerLogs();
