import { SarvamAIClient } from "sarvamai";
import unzipper from "unzipper";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * TrustScan AI — Sarvam Model Integration Service (v2 Architecture)
 * 
 * Primary OCR Engine: Sarvam Vision (3B VLM - 23 Indian languages)
 * Primary LLM Engine: Risk-Tiered Routing (Sarvam-30B for low-risk, Sarvam-105B for high-risk)
 */

export async function callSarvamVision(imageBuffer, language = "en-IN") {
    const sarvamKey = process.env.SARVAM_API_KEY;

    if (sarvamKey && !sarvamKey.includes('PASTE')) {
        try {
            console.log(`🌐 [Sarvam Vision 3B] Initiating 23-language document digitization...`);
            const startTime = Date.now();
            
            const client = new SarvamAIClient({
                apiSubscriptionKey: sarvamKey
            });

            // 1. Initialise Job (Sarvam Vision 3B engine)
            const initRes = await client.documentIntelligence.initialise({
                job_parameters: {
                    language: language || "en-IN",
                    output_format: "md"
                }
            });
            const init = initRes.data || initRes;
            const jobId = init.job_id;

            if (!jobId) throw new Error("Failed to get Job ID from Sarvam Vision");

            // 2. Get Upload Link
            const uploadRes = await client.documentIntelligence.getUploadLinks({
                job_id: jobId,
                files: ["page.png"]
            });
            const uploadLinks = uploadRes.data || uploadRes;
            const uploadUrl = uploadLinks.upload_urls["page.png"].file_url;

            // 3. Upload File
            await axios.put(uploadUrl, imageBuffer, {
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'image/png'
                }
            });

            // 4. Start Processing
            await client.documentIntelligence.start(jobId);

            // 5. Poll for Completion (Max 45s)
            let success = false;
            for (let i = 0; i < 22; i++) {
                const statusRes = await client.documentIntelligence.getStatus(jobId);
                const status = statusRes.data || statusRes;
                
                if (status.job_state === 'Completed' || status.job_state === 'PartiallyCompleted') {
                    success = true;
                    break;
                }
                if (status.job_state === 'Failed') break;
                await new Promise(r => setTimeout(r, 2000));
            }

            if (success) {
                // 6. Fetch Download Links
                const downloadRes = await client.documentIntelligence.getDownloadLinks(jobId);
                const download = downloadRes.data || downloadRes;
                
                const zipUrl = (download.urls && download.urls[0]?.url) || 
                             (download.download_urls && Object.values(download.download_urls)[0]?.file_url) ||
                             (download.upload_urls && Object.values(download.upload_urls)[0]?.file_url);

                if (zipUrl) {
                    const zipRes = await axios.get(zipUrl, { responseType: 'arraybuffer' });
                    const zip = await unzipper.Open.buffer(zipRes.data);
                    const mdFile = zip.files.find(f => f.path.endsWith('.md'));
                    
                    if (mdFile) {
                        const text = (await mdFile.buffer()).toString();
                        console.log(`✅ [Sarvam Vision 3B] Extraction Success in ${Date.now() - startTime}ms (${text.length} chars)`);
                        return {
                            success: text.length > 5,
                            text: text.trim(),
                            confidence: 98,
                            engine: 'Sarvam Vision 3B'
                        };
                    }
                }
            }
            console.warn(`⚠️ [Sarvam Vision] Job ${jobId} failed or download unavailable.`);
        } catch (err) {
            console.warn(`⚠️ [Sarvam Vision] Flow note: ${err.message}`);
        }
    }

    // High-precision Gemini Flash Vision Fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.includes('PASTE')) {
        const visionModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        for (const modelName of visionModels) {
            try {
                console.log(`🌐 [Gemini Vision Fallback] Extracting structured document layout with ${modelName}...`);
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({ model: modelName }); 
                const base64Image = imageBuffer.toString('base64');
                const prompt = "Extract all text accurately from this document image preserving structure, headers, and numbers. Return ONLY clean extracted text.";

                const result = await model.generateContent([
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: "image/png"
                        }
                    },
                    { text: prompt }
                ]);

                const responseText = result.response.text();
                if (responseText && responseText.trim().length > 0) {
                    return {
                        success: true,
                        text: responseText.trim(),
                        confidence: 95,
                        engine: `Gemini Vision (${modelName})`
                    };
                }
            } catch (err) {
                console.warn(`[Gemini Vision] ${modelName} flow note: ${err.message}`);
            }
        }
    }

    return { success: false, text: "", confidence: 0 };
}

/**
 * Stage 5: Risk-Tiered LLM Structured Reasoning (Sarvam-30B vs Sarvam-105B)
 */
export async function callSarvamReasoning(contextPayload, riskTier = 'low') {
    const sarvamKey = process.env.SARVAM_API_KEY;
    const modelTarget = riskTier === 'high' ? 'sarvam-105b' : 'sarvam-30b';

    console.log(`🧠 [Risk-Tiered LLM Reasoning] Routing to ${modelTarget.toUpperCase()} (Tier: ${riskTier.toUpperCase()})...`);

    const prompt = `You are the TrustScan AI Document Verification Authority for India.
Analyze the following document verification payload and return ONLY valid JSON matching this schema:

{
  "documentCategory": "Government_ID | Company_Doc | Career_Credential | Financial_Invoice",
  "documentType": "Aadhaar | PAN | GSTIN | CIN | OfferLetter | SalarySlip | Invoice",
  "extractedEntities": {
    "holderName": "string",
    "documentNumber": "string",
    "issueDate": "YYYY-MM-DD",
    "issuingAuthority": "string",
    "stateCode": "string"
  },
  "mathematicalAudit": {
    "checksumValid": true,
    "mathBalanceValid": true,
    "discrepanciesFound": ["string"]
  },
  "riskAssessment": {
    "fraudProbability": 0.05,
    "trustScore": 95,
    "verdict": "VERIFIED | REVIEW_NEEDED | HIGH_RISK",
    "riskFlags": ["string"],
    "justification": "string"
  }
}

Document Context:
${JSON.stringify(contextPayload, null, 2)}
`;

    // 1. Try Sarvam Chat Completions API if available
    if (sarvamKey && !sarvamKey.includes('PASTE')) {
        try {
            const res = await axios.post("https://api.sarvam.ai/v1/chat/completions", {
                model: modelTarget,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1
            }, {
                headers: {
                    'api-subscription-key': sarvamKey,
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            });

            const content = res.data?.choices?.[0]?.message?.content;
            if (content) {
                const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleaned);
            }
        } catch (sErr) {
            console.warn(`⚠️ [Sarvam LLM] Chat completion note (${sErr.message}). Using fallback reasoning.`);
        }
    }

    // 2. Gemini Fallback with identical structured JSON contract
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.includes('PASTE')) {
        const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        for (const modelName of geminiModels) {
            try {
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleaned);
            } catch (gErr) {
                console.warn(`[Gemini LLM Fallback] ${modelName} note: ${gErr.message}`);
            }
        }
    }

    return null;
}
