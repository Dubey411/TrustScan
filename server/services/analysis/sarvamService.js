import { SarvamAIClient } from "sarvamai";
import unzipper from "unzipper";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Sarvam & Gemini Vision Intelligence Service 
 * 
 * Provides high-speed OCR using Sarvam AI Document Intelligence (Primary)
 * and Google Gemini 1.5 Flash (Fallback).
 */

export async function callSarvamVision(imageBuffer) {
    const sarvamKey = process.env.SARVAM_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // --- PHASE 1: Try Sarvam Document Intelligence (Async Flow) ---
    if (sarvamKey && !sarvamKey.includes('PASTE')) {
        try {
            console.log(`🌐 [Sarvam Intelligence] Starting Async Document Flow...`);
            const startTime = Date.now();
            
            const client = new SarvamAIClient({
                apiSubscriptionKey: sarvamKey
            });

            // 1. Initialise Job
            const init = await client.documentIntelligence.initialise({
                job_parameters: {
                    language: "hi-IN",
                    output_format: "md"
                }
            });
            const jobId = init.data.job_id;

            // 2. Get Upload Link
            const uploadLinks = await client.documentIntelligence.getUploadLinks({
                job_id: jobId,
                files: ["page.png"]
            });
            const uploadUrl = uploadLinks.data.upload_urls["page.png"].file_url;

            // 3. Upload File (Azure BlockBlob)
            await axios.put(uploadUrl, imageBuffer, {
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'image/png'
                }
            });

            // 4. Start Processing
            await client.documentIntelligence.start(jobId);

            // 5. Poll for Completion (Max 45s)
            let status;
            let success = false;
            for (let i = 0; i < 22; i++) {
                const statusRes = await client.documentIntelligence.getStatus(jobId);
                status = statusRes.data;
                
                if (status.job_state === 'Completed' || status.job_state === 'PartiallyCompleted') {
                    success = true;
                    break;
                }
                if (status.job_state === 'Failed') break;
                await new Promise(r => setTimeout(r, 2000));
            }

            if (success) {
                // 6. Get Download Links
                const downloadRes = await client.documentIntelligence.getDownloadLinks(jobId);
                const download = downloadRes.data;
                
                // The structure for download URLs is typically an array or map
                const zipUrl = download.upload_urls 
                    ? Object.values(download.upload_urls)[0].file_url 
                    : null;

                if (zipUrl) {
                    // 7. Fetch ZIP and Extract
                    const zipRes = await axios.get(zipUrl, { responseType: 'arraybuffer' });
                    const zip = await unzipper.Open.buffer(zipRes.data);
                    const mdFile = zip.files.find(f => f.path.endsWith('.md'));
                    
                    if (mdFile) {
                        const text = (await mdFile.buffer()).toString();
                        console.log(`✅ [Sarvam Intelligence] Success in ${Date.now() - startTime}ms (${text.length} chars)`);
                        return {
                            success: text.length > 5,
                            text: text.trim(),
                            confidence: 98
                        };
                    }
                }
            }
            console.warn(`⚠️ [Sarvam Intelligence] Job ${jobId} did not complete successfully or no download URL found.`);
        } catch (err) {
            console.warn(`⚠️ [Sarvam Intelligence] Flow failed: ${err.message}`);
        }
    }

    // --- PHASE 2: Fallback to Gemini 1.5 Flash (Sync Flow) ---
    if (geminiKey && !geminiKey.includes('PASTE')) {
        try {
            console.log(`🌐 [Gemini Vision] Falling back to Cloud OCR (Sync)...`);
            const startTime = Date.now();
            
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1beta' }); 
            // gemini-2.0-flash has 1,500 requests per day free quota vs 2.5-flash (20)
            const base64Image = imageBuffer.toString('base64');
            const prompt = "Please extract all the text accurately from this image. Return ONLY the extracted text. Do not add any conversational filler, markdown formatting blocks, or comments.";

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
                console.log(`✅ [Gemini Vision] Success in ${Date.now() - startTime}ms (${responseText.length} chars)`);
                return {
                    success: responseText.length > 5,
                    text: responseText.trim(),
                    confidence: 95
                };
            }
        } catch (err) {
            console.error(`❌ [Gemini Vision] Request failed: ${err.message}`);
        }
    }

    return { success: false, text: "", confidence: 0 };
}
