import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

let genAI = null;

function getGenAI() {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('PASTE')) {
            console.error("❌ [Prophet AI] GEMINI_API_KEY is missing or invalid in environment variables!");
            return null;
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

export async function generateAIInsight(text, riskScore, reasons, signals) {
    const aiInstance = getGenAI();
    if (!aiInstance) return null; 

    // Highest quota model first
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-pro",
    ];

    // Safety settings to prevent false positives for "fraud" content
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`🤖 [Prophet AI] Attempting ${modelName} (v1beta)...`);
            
            // Forces the backend to use the latest beta endpoint which is more reliable for flash
            const model = aiInstance.getGenerativeModel(
                { model: modelName, safetySettings },
                { apiVersion: 'v1beta' }
            );
            
            const contextSnippet = text.substring(0, 5000); 

            const prompt = `
            You are a Senior Fraud Investigator for "CheckIt", an Indian platform protecting job seekers.
            
            ML ANALYSIS:
            - Risk Score: ${riskScore}%
            - Reasons: ${reasons.join(", ")}
            - Signals: ${JSON.stringify(signals)}
            
            CONTENT TO ANALYZE:
            "${contextSnippet}"

            TASK:
            Tell the user WHY this is likely a scam or what to look out for. 
            Focus on Indian context (fake MNCs, training fees, Telegram traps).
            Keep it strictly under 3 short sentences. Speak directly to the user (e.g., "I noticed that...").
            Do not use bold characters.

            EXPLANATION:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const resultText = response.text();
            
            if (resultText && resultText.trim().length > 10) {
                console.log(`✅ [Prophet AI] Success with ${modelName}!`);
                return resultText.trim();
            } else {
                console.warn(`⚠️ [Prophet AI] ${modelName} returned empty or too short response.`);
            }
        } catch (err) {
            lastError = err;
            const shortMsg = err.message?.substring(0, 150);
            console.warn(`🤖 [Prophet AI] ${modelName} failed: ${shortMsg}`);
            
            // If it's a 429, we might want to skip other fast flash models
            if (shortMsg.includes('429')) {
                console.warn("🛑 [Prophet AI] Rate limited. Cooling down.");
                break; 
            }
        }
    }

    if (lastError) {
        console.error("🤖 [Prophet AI] All attempts failed. Error summary:", lastError.message?.substring(0, 200));
    }
    return null;
}
