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

    // We try a mix of 2.0 and 1.5 models across different versions to bypass regional/quota issues
    const modelsToTry = [
        { name: "gemini-2.0-flash-lite", version: "v1beta" },
        { name: "gemini-1.5-flash", version: "v1beta" },
        { name: "gemini-1.5-flash-8b", version: "v1beta" },
        { name: "gemini-2.0-flash", version: "v1beta" },
        { name: "gemini-1.5-pro", version: "v1beta" }
    ];

    // Aggressive safety settings to ensure fraud analysis isn't censored
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let lastError = null;

    for (const { name: modelName, version } of modelsToTry) {
        try {
            console.log(`🤖 [Prophet AI] Attempting ${modelName} (${version})...`);
            
            const model = aiInstance.getGenerativeModel(
                { model: modelName, safetySettings },
                { apiVersion: version }
            );
            
            // Context is key for a good insight
            const contextSnippet = text.substring(0, 4000); 

            const prompt = `
            You are a Senior Fraud Investigator. Analyze this input and explain why it is suspicious.
            
            ML DATA:
            - Risk: ${riskScore}%
            - Reasons: ${reasons.join(", ")}
            - Signals: ${JSON.stringify(signals)}
            
            CONTENT:
            "${contextSnippet}"

            INSTRUCTIONS:
            Explain the anomaly in 1-2 powerful sentences. Speak to the user. Do not use bold characters.
            Example: "I detected multiple inconsistencies in the company CIN and the registration date, which often indicates a shell company used for recruitment scams."

            EXPLANATION:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const resultText = response.text();
            
            if (resultText && resultText.trim().length > 5) {
                console.log(`✅ [Prophet AI] Success with ${modelName}!`);
                return resultText.trim();
            }
        } catch (err) {
            lastError = err;
            console.warn(`🤖 [Prophet AI] ${modelName} attempt failed.`);
            
            // If it's a quota error, don't stop, try the next model which might have quota
            if (err.message?.includes('429')) {
                console.log(`🚥 [Prophet AI] Quota full for ${modelName}, jumping to next...`);
                continue;
            }
        }
    }

    if (lastError) {
        console.error("🤖 [Prophet AI] Final failure reason:", lastError.message?.substring(0, 150));
    }
    return null;
}
