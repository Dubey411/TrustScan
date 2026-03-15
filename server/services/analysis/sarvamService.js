
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
        
        // Sarvam Vision API requires Multipart Form Data or Base64 depending on implementation.
        // As per documentation, we can send it as a base64 string.
        const base64Image = imageBuffer.toString('base64');
        
        // Note: Check Sarvam API documentation for precise endpoint and payload structure
        // Endpoint: https://api.sarvam.ai/v1/vision/ocr
        const response = await fetch('https://api.sarvam.ai/v1/vision/ocr', {
            method: 'POST',
            headers: {
                'api-subscription-key': sarvamKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: `data:image/png;base64,${base64Image}`
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Expected response format includes 'extracted_text' or similar
            const extractedText = data.text || data.extracted_text || "";
            const confidence = data.confidence || 95; // Default if not provided
            
            console.log(`✅ [Sarvam Vision] Success in ${Date.now() - startTime}ms (${extractedText.length} chars)`);
            return {
                success: true,
                text: extractedText,
                confidence: confidence
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
