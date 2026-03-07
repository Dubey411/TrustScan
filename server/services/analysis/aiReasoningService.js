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



/**
 * Smart AI Insight Generator
 * Uses Gemini or Sarvam AI to explain scan results.
 */
export async function generateAIInsight(text, riskScore, reasons, signals, metadata = {}) {
    const aiInstance = getGenAI();
    
    // Extract research data for prompt
    const researchSnippet = metadata.detectedEntities?.map(e => 
        `[${e.type}: ${e.value}] Valid: ${e.isValid}. Research: ${e.enrichment?.name || 'N/A'}, Status: ${e.enrichment?.status || 'N/A'}`
    ).join("\n") || "No official entities found.";

    // 1. Fallback if no instances configured
    if (!aiInstance && !process.env.SARVAM_API_KEY) return { 
        insight: generateHeuristicInsight(reasons, signals), 
        modelUsed: "TrustScan Heuristic" 
    };

    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-8b"];

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    for (const modelName of modelsToTry) {
        try {
            const model = aiInstance.getGenerativeModel({ model: modelName, safetySettings }, { apiVersion: 'v1beta' });
            const prompt = `
            Expert Investigation for CheckIt (India).
            Risk: ${riskScore}%. Reasons: ${reasons.join(", ")}.
            
            RESEARCHED DATA (Our system's background verify):
            ${researchSnippet}

            CONTENT: "${text.substring(0, 3000)}"

            Task: Inform the user why this is likely fraud using the research and content. 
            Speak to the user. No bold text. max 2 sentences.
            Insight:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const resText = response.text();
            
            if (resText && resText.trim().length > 10) return { 
                insight: resText.trim(), 
                modelUsed: modelName.toLowerCase().includes('gemini') ? "Gemini Flash Core" : modelName 
            };
        } catch (err) {
            console.warn(`🤖 [Prophet AI] ${modelName} skipped.`);
        }
    }

    // 3. Fallback to Sarvam AI (Indus) 
    try {
        const key = process.env.SARVAM_API_KEY;
        if (key && !key.includes('PASTE')) {
            console.log("🤖 [Prophet AI] Attempting Sarvam AI with Research Data...");
            const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'api-subscription-key': key, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "sarvam-m",
                    messages: [
                        { role: "system", content: "Senior Fraud Investigator. Use Research Data below to explain why a document is suspicious. conciseness=high. No bold." },
                        { role: "user", content: `Score: ${riskScore}%\nResearch:\n${researchSnippet}\n\nContent: ${text.substring(0, 1500)}` }
                    ],
                    max_tokens: 150
                })
            });
            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) return { 
                    insight: content.trim(), 
                    modelUsed: "Indus LLM (Sarvam)" 
                };
            }
        }
    } catch (e) { console.warn("🤖 [Prophet AI] Sarvam failed."); }

    return { 
        insight: generateHeuristicInsight(reasons, signals), 
        modelUsed: "TrustScan Heuristic" 
    };
}
