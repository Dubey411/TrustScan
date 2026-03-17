import { SarvamAIClient } from "sarvamai";
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

/**
 * Medical Prescription Service
 * Implements the hybrid pipeline: Sharp -> Tesseract -> Sarvam LLM
 */

const SARVAM_KEY = process.env.SARVAM_API_KEY;

/**
 * Initializes Sarvam client
 */
const getSarvamClient = () => {
    if (!SARVAM_KEY || SARVAM_KEY.includes('PASTE')) {
        console.warn("⚠️ [PrescriptionService] Sarvam API Key missing.");
        return null;
    }
    return new SarvamAIClient({
        apiSubscriptionKey: SARVAM_KEY
    });
};

/**
 * Processes a prescription image
 * @param {Buffer} fileBuffer - Raw image buffer
 * @returns {Object} Structured prescription data
 */
export async function processPrescription(fileBuffer) {
    try {
        console.log("🏥 [PrescriptionService] Starting extraction pipeline...");

        // 1. Image Pre-processing with Sharp
        console.log("🛠️ [Step 1] Normalizing image with Sharp...");
        const normalizedBuffer = await sharp(fileBuffer)
            .rotate() // Auto-rotate based on EXIF
            .toBuffer();

        // 2. Local OCR with Tesseract.js
        console.log("🔍 [Step 2] Extracting text with Local Tesseract...");
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(normalizedBuffer);
        await worker.terminate();

        if (!text || text.trim().length < 5) {
            throw new Error("Tesseract failed to extract usable text from the image.");
        }

        console.log(`✅ [Step 2] Extracted ${text.length} chars.`);

        // 3. AI Analysis with Sarvam
        console.log("🧠 [Step 3] Structuring data with Sarvam AI...");
        const client = getSarvamClient();
        if (!client) {
            return { rawText: text, error: "AI Service not configured" };
        }

        const systemPrompt = `You are a medical data analyst. Your task is to convert OCR text from a medical prescription into structured JSON.
        
CRITICAL: Respond ONLY with valid JSON. Do not include any text before or after the JSON block.

JSON SCHEMA:
{
  "patient_name": "string or null",
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "is_tablet_or_syrup": "string",
      "side_effects_warning": {
        "english": "short warning",
        "hindi": "हिंदी चेतावनी",
        "marathi": "मराठी चेतावणी"
      }
    }
  ],
  "doctor_details": {
    "name": "string or null",
    "specialty": "string or null",
    "reg_no": "string or null"
  },
  "notes": "string",
  "is_authentic_signature_present": boolean
}

Analyze the following text extract:`;

        const response = await client.chat.completions({
            model: "sarvam-m",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            temperature: 0.1
        });

        const resultText = response.choices[0].message.content.trim();
        
        try {
            // Remove markdown code blocks if AI included them
            const cleanJson = resultText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            const structuredData = JSON.parse(cleanJson);
            
            console.log("✅ [PrescriptionService] Pipeline complete.");
            return {
                success: true,
                data: structuredData,
                rawText: text
            };
        } catch (jsonErr) {
            console.error("❌ [PrescriptionService] JSON Parse Error:", jsonErr.message);
            console.log("Raw Response:", resultText);
            return {
                success: false,
                rawText: text,
                error: "Failed to parse AI response into structured data"
            };
        }

    } catch (err) {
        console.error("❌ [PrescriptionService] Pipeline Error:", err.message);
        throw err;
    }
}
