import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

let genAI = null;

function getGenAI() {
    if (!genAI) {
        const key = process.env.GEMINI_API_KEY;
        if (!key || key.includes('PASTE')) return null;
        genAI = new GoogleGenerativeAI(key);
    }
    return genAI;
}

/**
 * Super Fallback: Generates a human-friendly explanation from ML signals
 * if the AI is hitting rate limits or is offline.
 */
function generateHeuristicInsight(reasons, signals) {
    if (!reasons || reasons.length === 0) {
        return "Our system checked this content against known fraud patterns. While no critical red flags were hit, we recommend caution if personal details or payments are requested.";
    }

    const mainReason = reasons[0].toLowerCase();
    
    if (mainReason.includes('payment') || mainReason.includes('fee')) {
        return `I noticed a request for money or a security deposit. Legitimate companies in India NEVER charge students for jobs or interviews. This is a major red flag.`;
    }
    
    if (mainReason.includes('urgent') || mainReason.includes('deadline')) {
        return `The high level of urgency detected is a common tactic to pressure you into making a mistake. Authentic offers usually give you 2-3 days to respond.`;
    }

    if (mainReason.includes('unofficial') || mainReason.includes('gmail') || mainReason.includes('telegram')) {
        return `Communication via personal accounts like Gmail, Telegram, or WhatsApp instead of an official company domain is highly suspicious for a professional role.`;
    }

    if (signals?.detectedEntities?.some(e => !e.isValid)) {
        return `Our engine found identifiers (like a CIN or GST number) that did not match official government records. This is likely an impersonation scam.`;
    }

    // Default dynamic fallback
    return `Based on identifying ${reasons.slice(0, 2).join(" and ")}, our engine has flagged this as highly suspicious. We strongly advise against sharing sensitive documents.`;
}

export async function generateAIInsight(text, riskScore, reasons, signals) {
    const aiInstance = getGenAI();
    
    // 1. If no AI key, use Heuristic immediately
    if (!aiInstance) return generateHeuristicInsight(reasons, signals);

    // 2. Try the most stable model names
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash-8b"
    ];

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    for (const modelName of modelsToTry) {
        try {
            // Use v1beta explicitly for flash models
            const model = aiInstance.getGenerativeModel(
                { model: modelName, safetySettings },
                { apiVersion: 'v1beta' }
            );
            
            const contextSnippet = text.substring(0, 3000); 

            const prompt = `
            Context: Indian Job/Document Fraud Detection.
            Data: Score ${riskScore}%, Flags: ${reasons.join(", ")}.
            Content: "${contextSnippet}"

            Task: Explain in 1-2 sentences WHY this is suspicious. Speak to the user. No bold text.
            Expert Insight:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const resText = response.text();
            
            if (resText && resText.trim().length > 10) {
                console.log(`✅ [Prophet AI] Success with ${modelName}`);
                return resText.trim();
            }
        } catch (err) {
            console.warn(`🤖 [Prophet AI] ${modelName} skipped: ${err.message?.substring(0, 50)}`);
            // If it's a 429, don't spam, just try the next one or move to fallback
        }
    }

    // 3. FINAL FALLBACK: If all AI fails, use the smart heuristic instead of the generic failure message
    console.log("🛠️ [Prophet AI] All AI models limited. Using Smart Heuristic Fallback.");
    return generateHeuristicInsight(reasons, signals);
}
