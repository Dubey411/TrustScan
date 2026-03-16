import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini Vision Intelligence Service 
 * 
 * Provides high-speed OCR using Google Gemini 1.5 Flash.
 * Replaces heavy local Tesseract.js processing to reduce 
 * cloud resource usage and increase scan speed.
 */

// We keep the old function name for backward compatibility with documentPipeline.js
export async function callSarvamVision(imageBuffer) {
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey || geminiKey.includes('PASTE')) {
        console.warn("⚠️ [Gemini Vision] API Key missing or invalid.");
        return { success: false, text: "", confidence: 0 };
    }

    try {
        console.log(`🌐 [Gemini Vision] Extracting text via Cloud OCR...`);
        const startTime = Date.now();
        
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast & cost-effective vision model

        const base64Image = imageBuffer.toString('base64');
        
        const prompt = "Please extract all the text accurately from this image. Return ONLY the extracted text. Do not add any conversational filler, markdown formatting blocks, or comments.";

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/png" // Assumes PNG fallback or generic acceptable image type
                }
            },
            prompt
        ]);

        const responseText = result.response.text();

        if (responseText && responseText.trim().length > 0) {
            console.log(`✅ [Gemini Vision] Success in ${Date.now() - startTime}ms (${responseText.length} chars)`);
            return {
                success: responseText.length > 5,
                text: responseText.trim(),
                confidence: 95
            };
        } else {
            console.warn(`⚠️ [Gemini Vision] API returned empty text.`);
            return { success: false, text: "", confidence: 0 };
        }
    } catch (err) {
        console.error(`❌ [Gemini Vision] Request failed: ${err.message}`);
        // Log detailed API key errors if applicable
        if (err.message.includes('API_KEY_INVALID')) {
            console.error("⛔ [Gemini Vision] CRITICAL: Your GEMINI_API_KEY is invalid. Please update it in your .env file.");
        }
        return { success: false, text: "", confidence: 0 };
    }
}
