/**
 * LLM Signal Classifier (The Brain Upgrade)
 * ==========================================
 * 
 * Instead of ONLY relying on static keyword matching (fraudRules.json),
 * this service uses Gemini Flash to UNDERSTAND the semantic meaning of content.
 * 
 * Input: Raw text content
 * Output: Structured JSON with scam classification signals
 * 
 * RUNS ON EVERY SCAN (Basic, Standard, Deep) because Gemini Flash is:
 * - Fast (~300ms)
 * - Cheap (free tier: 1500 req/day)
 * - Accurate for classification tasks
 * 
 * This replaces the need to manually add keywords to fraudRules.json.
 * The rules engine will MERGE these signals with existing static signals.
 */

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

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const CLASSIFICATION_PROMPT = `You are a NEUTRAL content safety analyst for India. Your job is to OBJECTIVELY evaluate content — NOT to assume it is a scam.

CRITICAL: Most content you receive is LEGITIMATE. Only flag as scam when there is CLEAR, STRONG evidence.

RESPOND ONLY WITH VALID JSON. No markdown, no explanations, just JSON.

IMPORTANT: If the content is an offer letter, hiring notice, or official document, extract the Primary Organization Name (the company name) as accurately as possible for government verification.

JSON FORMAT:
{
  "isScam": true/false,
  "confidence": 0-100,
  "scamType": "one of: job_scam, phishing, upi_fraud, lottery_scam, investment_scam, impersonation, sextortion, customs_scam, tech_support, loan_scam, pay_to_work, legitimate, unclear",
  "urgencyLevel": 0-100,
  "financialDemand": true/false,
  "impersonatingBrand": "brand name or null",
  "organizationName": "The primary company/org name in the content or null",
  "organizationSummary": "A concise 1-paragraph summary (30-50 words) about this company/organization based on its reputation and industry. If it looks fake, state its potential impersonation target.",
  "redFlags": ["flag1", "flag2"],
  "greenFlags": ["flag1", "flag2"],
  "summary": "One sentence explanation for the user"
}

LEGITIMACY INDICATORS (If these exist, it is LIKELY legitimate):
- Official letterhead with proper address, phone numbers, email, website
- Professional language without urgency or emotional pressure
- Specific enrollment numbers, dates, and program details
- NO request for money, OTP, bank details, or personal credentials
- Named recipients and structured formal formatting
- Government or institutional organizations with verifiable contact info
- Internship/job offers from educational institutions or research labs
- Standard HR documents with proper formatting

SCAM INDICATORS (Need MULTIPLE of these to classify as scam):
- Asks for money upfront (security deposit, training fee, registration fee)
- Demands OTP, bank details, UPI PIN, or KYC urgently
- Promises unrealistic salary, returns, or guaranteed placement
- Uses personal email (gmail/yahoo) for official corporate communication
- Creates extreme urgency ("respond in 24 hours or lose opportunity")
- No verifiable company address, phone number, or registration

IMPORTANT RULES:
- If there is NO money demand and the document has proper formatting → isScam=false
- An internship offer from a lab/institute with address and contact info is LIKELY legitimate
- Not recognizing an organization does NOT make it a scam
- Default to "unclear" if genuinely uncertain, NOT to "scam"
- confidence should be LOW (30-50) if evidence is ambiguous

CONTENT TO CLASSIFY:
"""
{CONTENT}
"""`;

/**
 * Classifies content using Gemini Flash for structured scam detection.
 * Returns parsed JSON signals that merge with the rules engine.
 * 
 * @param {string} content - Text to classify
 * @param {string} scanType - Type of scan (email, company, link, document)
 * @returns {Object} Structured classification result
 */
export async function classifyWithLLM(content, scanType = 'email') {
    const ai = getGenAI();
    if (!ai) {
        console.log('💡 [LLM Classifier] No API key configured. Skipping.');
        return null;
    }

    // Don't waste API calls on very short content or company name lookups
    if (!content || content.length < 15) return null;
    if (scanType === 'company' && content.length < 50) return null;

    const truncated = content.substring(0, 2000); // Limit tokens
    const prompt = CLASSIFICATION_PROMPT.replace('{CONTENT}', truncated);

    // Try multiple models for resilience (Prioritize 2.0-flash-lite for much higher free tier quota)
    const modelsToTry = ["gemini-2.0-flash-lite", "gemini-1.5-flash-8b", "gemini-flash-latest"];

    for (const modelName of modelsToTry) {
        try {
            const model = ai.getGenerativeModel({ 
                model: modelName, 
                safetySettings: SAFETY_SETTINGS,
                generationConfig: {
                    temperature: 0.1, // Low temperature for consistent classification
                    maxOutputTokens: 400
                }
            }, { apiVersion: 'v1beta' }); 

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text()?.trim();

            // Clean up markdown fences if present
            text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

            const parsed = JSON.parse(text);

            // Validate structure
            if (typeof parsed.isScam !== 'boolean' || typeof parsed.confidence !== 'number') {
                console.warn(`⚠️ [LLM Classifier] ${modelName} returned invalid structure.`);
                continue;
            }

            // Clamp values
            parsed.confidence = Math.max(0, Math.min(100, parsed.confidence));
            parsed.urgencyLevel = Math.max(0, Math.min(100, parsed.urgencyLevel || 0));
            parsed.modelUsed = modelName;

            console.log(`🧠 [LLM Classifier] ${modelName}: isScam=${parsed.isScam}, confidence=${parsed.confidence}%, type=${parsed.scamType}`);
            return parsed;

        } catch (err) {
            console.warn(`⚠️ [LLM Classifier] ${modelName} failed: ${err.message?.substring(0, 80)}`);
        }
    }

    // Fallback: Try Sarvam AI for classification
    try {
        const sarvamKey = process.env.SARVAM_API_KEY;
        if (sarvamKey && !sarvamKey.includes('PASTE')) {
            console.log('🧠 [LLM Classifier] Falling back to Sarvam AI...');
            const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'api-subscription-key': sarvamKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "sarvam-m",
                    messages: [
                        { role: "system", content: "You are a fraud classifier. Respond ONLY with valid JSON." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 400,
                    temperature: 0.1
                })
            });

            if (response.ok) {
                const data = await response.json();
                let text = data.choices?.[0]?.message?.content?.trim();
                if (text) {
                    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
                    const parsed = JSON.parse(text);
                    if (typeof parsed.isScam === 'boolean') {
                        parsed.modelUsed = 'sarvam-m';
                        console.log(`🧠 [LLM Classifier] Sarvam: isScam=${parsed.isScam}, confidence=${parsed.confidence}%`);
                        return parsed;
                    }
                }
            }
        }
    } catch (e) {
        console.warn(`⚠️ [LLM Classifier] Sarvam fallback failed.`);
    }

    console.log('💡 [LLM Classifier] All models exhausted. Proceeding without LLM classification.');
    return null;
}

/**
 * Converts LLM classification result into rulesEngine-compatible signals.
 * This is the bridge between AI understanding and the existing scoring system.
 */
export function llmToSignals(llmResult) {
    if (!llmResult) return {};

    const signals = {};

    // Map scam types to existing signal categories
    const scamTypeToSignal = {
        'job_scam': 'jobScam',
        'pay_to_work': 'financial',
        'phishing': 'links',
        'upi_fraud': 'financial',
        'lottery_scam': 'financial',
        'investment_scam': 'financial',
        'impersonation': 'impersonation',
        'sextortion': 'urgency',
        'customs_scam': 'impersonation',
        'tech_support': 'techSupport',
        'loan_scam': 'financial'
    };

    if (llmResult.isScam && llmResult.confidence >= 60) {
        const targetSignal = scamTypeToSignal[llmResult.scamType];
        if (targetSignal) {
            signals[`llm_${targetSignal}`] = 1;
        }
        signals.llmScamDetected = 1;
    }

    if (llmResult.financialDemand) {
        signals.llmFinancialDemand = 1;
    }

    if (llmResult.urgencyLevel >= 60) {
        signals.llmUrgency = 1;
    }

    if (llmResult.impersonatingBrand) {
        signals.llmImpersonation = 1;
    }

    // Negative signal: LLM says it's legit
    if (!llmResult.isScam && llmResult.confidence >= 70) {
        signals.llmLegitimate = 1;
    }

    return signals;
}
