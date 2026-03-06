import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // gemini-1.5-flash has highest free quota (1500 req/day)
    // gemini-2.0-flash has lower free quota but is newer
    const modelsToTry = [
        { name: "gemini-1.5-flash", version: "v1beta" },
        { name: "gemini-2.0-flash", version: "v1beta" },
        { name: "gemini-1.5-pro", version: "v1beta" },
    ];
    let lastError = null;

    for (const { name: modelName, version } of modelsToTry) {
        try {
            console.log(`🤖 [Prophet AI] Attempting ${modelName} (${version})...`);
            const model = aiInstance.getGenerativeModel(
                { model: modelName },
                { apiVersion: version }
            );
            
            const contextSnippet = text.substring(0, 3000); 

            const prompt = `
            You are a Senior Fraud Investigator for "CheckIt", an Indian startup platform that protects students and job seekers from scams.
            A user has uploaded a document (offer letter/job post). Our ML Rules Engine has already analyzed it.
            
            INPUT DATA:
            - ML Risk Score: ${riskScore}%
            - Flagged Reasons: ${reasons.join(", ")}
            - ML Signals: ${JSON.stringify(signals)}
            
            DOCUMENT TEXT SNIPPET:
            """
            ${contextSnippet}
            """

            YOUR TASK:
            Analyze the "Intent" and "Reputation" of this document/company. Explain WHY it might be a scam in human-friendly language. 
            Focus on common Indian scam tactics and community sentiment (using your internal knowledge of reports from sites like Reddit, Glassdoor, or Quora):
            - Training Fees or Security Deposit requests (The #1 scam signal).
            - Lack of official company identifiers (CIN/GST) or faked ones.
            - Professional-looking text for a company that users often report as a "Consultancy Trap" or "Data Entry Scam".
            - Urgent deadlines for payment or "selection" without a proper interview.
            - Use of unofficial communication (Telegram/Personal Gmail) for a supposedly "Big Brand".

            REQUIREMENTS:
            1. Keep it concise (max 3 sentences).
            2. Speak directly to the user (e.g., "I noticed that...").
            3. Use your knowledge of "Grey List" companies: If a company is legally real but has a terrible reputation for charging students for jobs, mention it.
            4. If it's a 100% impersonation scam, be firm and warn the user not to pay any money.
            5. Format as a single paragraph.

            INVESTIGATOR INSIGHT:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const resultText = response.text();
            
            if (resultText) {
                console.log(`✅ [Prophet AI] Success with ${modelName}!`);
                return resultText.trim();
            }
        } catch (err) {
            lastError = err;
            console.warn(`🤖 [Prophet AI] ${modelName} failed: ${err.message?.substring(0, 150)}`);
        }
    }

    console.error("🤖 [Prophet AI] All models failed. Last error:", lastError?.message?.substring(0, 200));
    return null;
}
