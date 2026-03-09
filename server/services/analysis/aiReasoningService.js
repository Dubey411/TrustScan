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

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Super Fallback: Generates a human-friendly explanation from ML signals
 */
function generateHeuristicInsight(reasons, signals) {
    if (!reasons || reasons.length === 0) {
        return "Our system checked this content against known fraud patterns. While no critical red flags were hit, we recommend caution if personal details or payments are requested.";
    }
    const mainReason = reasons[0].toLowerCase();
    if (mainReason.includes('payment') || mainReason.includes('fee'))
        return `I noticed a request for money or a security deposit. Legitimate companies in India NEVER charge students for jobs or interviews. This is a major red flag.`;
    if (mainReason.includes('urgent') || mainReason.includes('deadline'))
        return `The high level of urgency detected is a common tactic to pressure you into making a mistake. Authentic offers usually give you 2-3 days to respond.`;
    if (mainReason.includes('unofficial') || mainReason.includes('gmail') || mainReason.includes('telegram'))
        return `Communication via personal accounts like Gmail, Telegram, or WhatsApp instead of an official company domain is highly suspicious for a professional role.`;
    if (signals?.detectedEntities?.some(e => !e.isValid))
        return `Our engine found identifiers (like a CIN or GST number) that did not match official government records. This is likely an impersonation scam.`;
    return `Based on identifying ${reasons.slice(0, 2).join(" and ")}, our engine has flagged this for review. We advise caution before sharing sensitive documents.`;
}

/**
 * Builds the research context string from metadata
 */
function buildResearchSnippet(metadata) {
    const entityRes = metadata.detectedEntities?.map(e => 
        `[${e.type}: ${e.value}] Valid: ${e.isValid}. Research: ${e.enrichment?.name || 'N/A'}, Status: ${e.enrichment?.status || 'N/A'}`
    ) || [];
    const linkRes = metadata.detectedLinks?.filter(l => l.flags?.includes('TRUSTED_DOMAIN') || l.liveMetadata?.title).map(l => 
        `[Link: ${l.host}] Status: ${l.flags?.includes('TRUSTED_DOMAIN') ? 'VERIFIED_TRUSTED' : 'Live'}. Meta: ${l.liveMetadata?.title || 'Unknown'}`
    ) || [];
    return [...entityRes, ...linkRes].join("\n") || "No official entities or trusted links found.";
}

/**
 * Calls Gemini with cascade fallback across models.
 * This is the ONLY function that makes a real LLM API call.
 */
async function callGemini(prompt, maxTokens = 300) {
    const ai = getGenAI();
    if (!ai) return null;

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

    for (const modelName of modelsToTry) {
        try {
            const model = ai.getGenerativeModel({ 
                model: modelName, 
                safetySettings,
                generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
            }, { apiVersion: 'v1beta' });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text()?.trim();
            
            if (text && text.length > 10) {
                return { text, model: modelName };
            }
        } catch (err) {
            console.warn(`🤖 [Prophet AI] ${modelName} skipped: ${err.message?.substring(0, 60)}`);
        }
    }
    return null;
}

/**
 * Calls Gemini WITH Google Search grounding enabled.
 * The LLM can search the internet to verify organizations, websites, etc.
 * 
 * ONLY used for Deep Scan forensic reports (premium feature).
 * Uses the same 1 API call but gets real-time web verification.
 */
async function callGeminiWithSearch(prompt, maxTokens = 500) {
    const ai = getGenAI();
    if (!ai) return null;

    // Try latest models including gemini-2.5-flash which has active quota
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

    for (const modelName of modelsToTry) {
        try {
            const model = ai.getGenerativeModel({ 
                model: modelName, 
                safetySettings,
                generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 },
                tools: [{ googleSearch: {} }]
            }, { apiVersion: 'v1beta' });

            console.log(`🌐 [Prophet AI] ${modelName} + Google Search grounding...`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text()?.trim();
            
            if (text && text.length > 10) {
                // Extract grounding metadata if available
                const groundingMeta = response.candidates?.[0]?.groundingMetadata;
                const searchQueries = groundingMeta?.webSearchQueries || [];
                if (searchQueries.length > 0) {
                    console.log(`🔍 [Prophet AI] AI searched: ${searchQueries.join(', ')}`);
                }
                return { text, model: modelName, grounded: true, searchQueries };
            }
        } catch (err) {
            console.warn(`🤖 [Prophet AI] ${modelName}+Search skipped: ${err.message?.substring(0, 80)}`);
        }
    }

    // Fallback to non-grounded Gemini
    console.log(`🤖 [Prophet AI] Grounded search failed, falling back to standard...`);
    return await callGemini(prompt, maxTokens);
}

/**
 * Calls Sarvam AI as fallback
 */
async function callSarvam(systemPrompt, userContent, maxTokens = 200) {
    const key = process.env.SARVAM_API_KEY;
    if (!key || key.includes('PASTE')) return null;

    try {
        const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'api-subscription-key': key, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "sarvam-m",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                max_tokens: maxTokens,
                temperature: 0.3
            })
        });
        if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content?.trim();
            if (content && content.length > 10) return content;
        }
    } catch (e) { 
        console.warn("🤖 [Sarvam] Call failed.");
    }
    return null;
}

// =====================================================================
//  DEEP SCAN: Adversarial Debate from OWN ML SIGNALS (ZERO API calls)
// =====================================================================

/**
 * DEEP SCAN: Build adversarial debate from our OWN ML signals.
 * 
 * WHY: Using 2 LLM calls for prosecution + defense = waste of credits.
 * Our rules engine already HAS all the red flags and green flags.
 * We just need to FORMAT them nicely as a "debate".
 * 
 * ZERO API CALLS. Pure data transformation.
 */
function buildDebateFromSignals(signals, reasons, flags, riskScore, metadata) {
    console.log(`⚖️ [Deep Scan] Building Adversarial Debate from ML signals (0 API calls)...`);

    // === PROSECUTION: Build from red flags + fired signals ===
    const prosecutionPoints = [];

    // From explicit red flags
    if (flags?.red?.length > 0) {
        flags.red.forEach(flag => {
            prosecutionPoints.push(`• ${flag}`);
        });
    }
    
    // From signal analysis
    if (signals.financial > 0) prosecutionPoints.push("• Financial demand detected — the content requests money, fees, or deposits which is a hallmark of advance-fee fraud.");
    if (signals.urgency > 0) prosecutionPoints.push("• High-pressure urgency language detected — creating artificial time pressure is a psychological manipulation tactic.");
    if (signals.impersonation > 0) prosecutionPoints.push("• Brand or authority impersonation detected — the sender may be pretending to be a known organization.");
    if (signals.links > 0) prosecutionPoints.push("• Suspicious links found — the URLs do not match official domains or use URL shorteners to hide destinations.");
    if (signals.typosquatting > 0) prosecutionPoints.push("• Domain typosquatting detected — subtle character variations in a known brand name suggest deception.");
    if (signals.llmScamDetected > 0) prosecutionPoints.push("• AI classification flagged this content as a potential scam based on semantic analysis.");
    if (signals.structuralAnomalies > 0) prosecutionPoints.push("• Document structure anomalies — the formatting or metadata is inconsistent with genuine official documents.");
    if (signals.smsSpoofRisk > 0) prosecutionPoints.push("• SMS header spoofing risk — the sender ID may be forged to appear as a trusted entity.");
    if (signals.scamFlowDetected > 0) prosecutionPoints.push("• Conversational scam flow detected — the text follows a known scam script pattern.");
    
    // From reasons (deduplicate with flags)
    reasons?.forEach(reason => {
        const alreadyCovered = prosecutionPoints.some(p => p.toLowerCase().includes(reason.substring(0, 30).toLowerCase()));
        if (!alreadyCovered && !reason.startsWith('🧠') && !reason.includes('Multilingual')) {
            prosecutionPoints.push(`• ${reason}`);
        }
    });

    // === DEFENSE: Build from green flags + positive signals ===
    const defensePoints = [];

    if (flags?.green?.length > 0) {
        flags.green.forEach(flag => {
            defensePoints.push(`• ${flag}`);
        });
    }

    if (signals.trustedOrg > 0) defensePoints.push("• The sender or organization is verified in our trusted entity database.");
    if (signals.llmLegitimate > 0) defensePoints.push("• AI semantic analysis classified this content as legitimate with reasonable confidence.");
    
    // Entity validation results
    const entities = metadata?.detectedEntities || [];
    const validEntities = entities.filter(e => e.isValid);
    const invalidEntities = entities.filter(e => !e.isValid);
    
    if (validEntities.length > 0) {
        validEntities.forEach(e => {
            defensePoints.push(`• ${e.type} ${e.value} — verified as valid against official government records.`);
        });
    }
    if (invalidEntities.length > 0) {
        invalidEntities.forEach(e => {
            prosecutionPoints.push(`• ${e.type} ${e.value} — failed verification against official records.`);
        });
    }

    // Trusted links
    const trustedLinks = metadata?.detectedLinks?.filter(l => l.flags?.includes('TRUSTED_DOMAIN')) || [];
    if (trustedLinks.length > 0) {
        defensePoints.push(`• ${trustedLinks.length} link(s) point to verified, trusted domains.`);
    }

    // No financial demand = defense point
    if (!signals.financial && !signals.llmFinancialDemand) {
        defensePoints.push("• No financial demand detected — the content does not ask for money, fees, or deposits.");
    }

    // No urgency = defense point  
    if (!signals.urgency && !signals.llmUrgency) {
        defensePoints.push("• No urgency pressure — the content uses a professional, measured tone.");
    }

    // Fallbacks if empty
    if (prosecutionPoints.length === 0) {
        prosecutionPoints.push("• No strong evidence of fraud was detected by the prosecution layer.");
    }
    if (defensePoints.length === 0) {
        defensePoints.push("• No strong authentication signals were found to support legitimacy.");
    }

    return {
        prosecution: prosecutionPoints.slice(0, 5).join('\n'),
        defense: defensePoints.slice(0, 5).join('\n'),
        hasFullDebate: prosecutionPoints.length > 0 && defensePoints.length > 0,
        prosecutionStrength: prosecutionPoints.length,
        defenseStrength: defensePoints.length
    };
}

// =====================================================================
//  DEEP SCAN: Single LLM call for Forensic Report
// =====================================================================

/**
 * DEEP SCAN: Generates forensic report.
 * This is the ONLY LLM call in Deep Scan (1 call, not 5).
 * Falls back to Sarvam if Gemini fails.
 */
async function generateForensicReport(text, riskScore, reasons, signals, metadata, researchSnippet) {
    console.log(`📋 [Deep Scan] Generating Forensic Report (1 API call)...`);

    const reportPrompt = `You are a NEUTRAL cyber-safety analyst at India's National Cyber Crime Bureau.
Write a structured forensic analysis report. Be OBJECTIVE — if something is legitimate, say so clearly.

CRITICAL INSTRUCTION: Use Google Search to verify any organization names, domains, or phone numbers mentioned in the content. If you verify they are legitimate, explicitly state that in the report.

INTELLIGENCE DATA:
- TrustScan Risk Score: ${riskScore}%
- Active Signals: ${Object.entries(signals).filter(([k,v]) => v > 0).map(([k]) => k).join(', ') || 'None'}
- Research Data: ${researchSnippet}

CONTENT:
"${text.substring(0, 2500)}"

Write EXACTLY in this format (plain text, no markdown bold):

IDENTITY ANALYSIS:
[1-2 sentences about the sender/organization. Did your search verify they exist? Are contact details matching?]

BEHAVIORAL PATTERNS:
[1-2 sentences. Does the content use urgency, pressure, or manipulation? Or is it professional and measured?]

FINANCIAL RISK:
[1-2 sentences. Are there any payment demands, fees, or monetary requests? If none, state that clearly.]

TECHNICAL SIGNALS:
[1-2 sentences about links, domains, document metadata. What did the technical scan find?]

INVESTIGATOR VERDICT:
[2-3 sentences final assessment. based on your search and analysis. If legitimate, confirm it. If suspicious, explain why. If unclear, say what the user should verify.]`;

    const result = await callGeminiWithSearch(reportPrompt, 500);
    if (result?.text) {
        const modelName = result.grounded ? `${result.model} + Web Search` : result.model;
        return { report: cleanLLMOutput(result.text), model: modelName };
    }

    // Fallback to Sarvam (still 1 call)
    const sarvamReport = await callSarvam(
        "Neutral cyber-safety analyst. Write structured forensic reports. Be objective — if legitimate, say so. Do NOT use markdown bold. Do NOT use <think> tags. Plain text ONLY.",
        `Score: ${riskScore}%\nSignals: ${Object.entries(signals).filter(([k,v]) => v > 0).map(([k]) => k).join(', ')}\nResearch: ${researchSnippet}\n\nContent: ${text.substring(0, 1500)}\n\nWrite: IDENTITY ANALYSIS, BEHAVIORAL PATTERNS, FINANCIAL RISK, TECHNICAL SIGNALS, INVESTIGATOR VERDICT. 1-2 sentences each. Be fair and objective. PLAIN TEXT ONLY.`,
        400
    );

    if (sarvamReport) {
        return { report: cleanLLMOutput(sarvamReport), model: 'sarvam-m' };
    }

    return null;
}

/**
 * Cleans up LLM output by removing think tags, markdown, etc.
 */
function cleanLLMOutput(text) {
    if (!text) return text;
    return text
        // Remove completely closed <think>...</think> blocks
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        // Remove any remaining, rogue <think> or </think> tags
        .replace(/<\/?think>/gi, '')
        // Remove markdown bold **text**
        .replace(/\*\*(.*?)\*\*/g, '$1')
        // Remove markdown italic *text*
        .replace(/\*(.*?)\*/g, '$1')
        // Remove markdown headers
        .replace(/^#+\s*/gm, '')
        // Clean up excessive whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// =====================================================================
//  PUBLIC API
// =====================================================================

/**
 * Deep Scan AI Investigation (OPTIMIZED — max 1 LLM call)
 * 
 * OLD: 5 API calls (2 cross-verification + 2 debate + 1 report)
 * NEW: 1 API call (forensic report only)
 * 
 * The adversarial debate is built from OUR OWN ML signals (zero cost).
 * Cross-verification is removed (was burning 2 calls for dubious value).
 */
export async function generateAIInsight(text, riskScore, reasons, signals, metadata = {}) {
    const researchSnippet = buildResearchSnippet(metadata);

    console.log(`🧠 [Prophet AI] Running Deep Investigation (1 API call max)...`);

    // 1. Adversarial Debate from OWN ML signals (ZERO API calls)
    const flags = metadata._flags || {};
    const debate = buildDebateFromSignals(signals, reasons, flags, riskScore, metadata);

    // 2. Forensic Report (1 API call — Gemini or Sarvam fallback)
    let forensicReport = null;
    try {
        forensicReport = await generateForensicReport(text, riskScore, reasons, signals, metadata, researchSnippet);
    } catch (err) {
        console.warn(`⚠️ [Deep Scan] Forensic report failed: ${err.message}`);
    }

    // 3. Build main insight from forensic report verdict
    let mainInsight = '';
    let modelUsed = 'TrustScan Multi-AI';

    if (forensicReport?.report) {
        const verdictMatch = forensicReport.report.match(/INVESTIGATOR VERDICT:\s*([\s\S]*?)$/i);
        mainInsight = verdictMatch?.[1]?.trim() || forensicReport.report.substring(0, 200);
        modelUsed = `Prophet AI (${forensicReport.model})`;
    } else {
        mainInsight = generateHeuristicInsight(reasons, signals);
        modelUsed = "TrustScan Heuristic";
    }

    return {
        insight: mainInsight,
        modelUsed,
        deepScanReport: {
            // Cross-verification removed (was burning 2 API calls)
            crossVerification: null,
            adversarialDebate: debate ? {
                prosecution: debate.prosecution,
                defense: debate.defense,
                hasFullDebate: debate.hasFullDebate,
                prosecutionStrength: debate.prosecutionStrength,
                defenseStrength: debate.defenseStrength
            } : null,
            forensicReport: forensicReport?.report || null,
            modelsUsed: forensicReport ? [forensicReport.model] : ['heuristic']
        }
    };
}
