
/**
 * Sarvam Vision Intelligence Service
 * 
 * Provides high-speed, India-optimized OCR using Sarvam AI.
 * Replaces heavy local Tesseract.js processing to reduce 
 * cloud resource usage and increase scan speed.
 */

/**
 * Calls Sarvam Vision OCR API to extract text from an image.
 * 
 * @param {Buffer} imageBuffer - The image buffer to OCR
 * @returns {Promise<{text: string, confidence: number, success: boolean}>}
 */
export async function callSarvamVision(imageBuffer) {
    const sarvamKey = process.env.SARVAM_API_KEY;
    
    if (!sarvamKey || sarvamKey.includes('PASTE')) {
        console.warn("⚠️ [Sarvam Vision] API Key missing or invalid.");
        return { success: false, text: "", confidence: 0 };
    }

    try {
        console.log(`🌐 [Sarvam Vision] Extracting text via Cloud OCR...`);
        const startTime = Date.now();
        
        // 🔥 PERFORMANCE: Using the 'Vision (Real-time)' tier (30 RPM)
        const base64Image = imageBuffer.toString('base64');
        
        const response = await fetch('https://api.sarvam.ai/v1/vision', {
            method: 'POST',
            headers: {
                'api-subscription-key': sarvamKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Image,
                prompt: "Extract all words and lines accurately from this image. Keep the layout simple."
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Sarvam Vision Real-time typically returns text in a field called 'data' or 'description'
            const extractedText = data.text || data.description || data.extracted_text || "";
            
            console.log(`✅ [Sarvam Vision] Success in ${Date.now() - startTime}ms (${extractedText.length} chars)`);
            return {
                success: extractedText.length > 5,
                text: extractedText,
                confidence: 95
            };
        } else {
            const errorMsg = await response.text();
            console.warn(`⚠️ [Sarvam Vision] API returned ${response.status}: ${errorMsg}`);
            return { success: false, text: "", confidence: 0 };
        }
    } catch (err) {
        console.error(`❌ [Sarvam Vision] Request failed: ${err.message}`);
        return { success: false, text: "", confidence: 0 };
    }
}
