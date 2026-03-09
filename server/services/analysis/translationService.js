/**
 * Multilingual Intelligence Service
 * Auto-detects Hindi/Hinglish/Regional languages in user input
 * and translates to English for the Rules Engine.
 * 
 * Uses:
 * 1. Sarvam AI Translate (Primary - Best for Indian languages)
 * 2. Gemini Flash (Fallback)
 * 
 * WHY: 90%+ of real Indian scam messages arrive in Hindi/Hinglish.
 * Without translation, our English-only rules engine is blind to them.
 */

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const TAMIL_REGEX = /[\u0B80-\u0BFF]/;
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;
const BENGALI_REGEX = /[\u0980-\u09FF]/;
const KANNADA_REGEX = /[\u0C80-\u0CFF]/;
const GUJARATI_REGEX = /[\u0A80-\u0AFF]/;
const MALAYALAM_REGEX = /[\u0D00-\u0D7F]/;

// Hinglish detection: Mix of Hindi transliteration in English script
// Common Hinglish scam terms
const HINGLISH_MARKERS = [
  'kya', 'hai', 'nahi', 'karo', 'karein', 'aapka', 'tumhara', 'paisa', 'rupaye',
  'bhejo', 'jaldi', 'abhi', 'turant', 'khata', 'khate', 'naukri', 'kaam',
  'yojana', 'sarkar', 'sarkari', 'lakhpati', 'crorepati', 'kamao', 'kamaaye',
  'paise', 'dhan', 'rashi', 'bhugtan', 'nivesh',  'munafa', 'labh',
  'aadhar', 'aadhaar', 'bijli', 'bill', 'bhai', 'didi', 'sahab',
  'whatsapp karein', 'call karein', 'link pe click', 'form bharo',
  'kyc update', 'pan card', 'bank khata', 'mobile number de',
  'otp batao', 'otp bhejo', 'verify karo', 'block ho jayega',
  'suspend ho jayega', 'band ho jayega',
  'ghar baithe', 'ghar se kaam', 'daily kamai', 'roz kamao'
];

/**
 * Detects the language/script of input text.
 * Returns: { isNonEnglish, detectedLang, confidence, hinglishScore }
 */
export function detectLanguage(text) {
  if (!text || text.length < 5) return { isNonEnglish: false, detectedLang: 'en', confidence: 0, hinglishScore: 0 };

  const charCount = text.length;
  
  // Count script characters
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const tamilCount = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const teluguCount = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  const bengaliCount = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const kannadaCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  const gujaratiCount = (text.match(/[\u0A80-\u0AFF]/g) || []).length;
  const malayalamCount = (text.match(/[\u0D00-\u0D7F]/g) || []).length;

  const scriptCounts = {
    'hi': devanagariCount,
    'ta': tamilCount,
    'te': teluguCount,
    'bn': bengaliCount,
    'kn': kannadaCount,
    'gu': gujaratiCount,
    'ml': malayalamCount
  };

  // Find dominant non-English script
  const maxScript = Object.entries(scriptCounts).reduce((a, b) => b[1] > a[1] ? b : a, ['en', 0]);
  const scriptRatio = maxScript[1] / charCount;

  // Definite regional language (>15% of chars are non-Latin script)
  if (scriptRatio > 0.15) {
    return {
      isNonEnglish: true,
      detectedLang: maxScript[0],
      confidence: Math.min(99, Math.round(scriptRatio * 100) + 30),
      hinglishScore: 0
    };
  }

  // Hinglish Detection (Latin script, but Hindi words)
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  let hinglishHits = 0;
  
  for (const marker of HINGLISH_MARKERS) {
    if (marker.includes(' ')) {
      // Multi-word marker
      if (lowerText.includes(marker)) hinglishHits += 2;
    } else {
      // Single word - need word boundary
      if (words.includes(marker)) hinglishHits += 1;
    }
  }

  const hinglishScore = Math.min(100, (hinglishHits / Math.max(1, words.length)) * 200);
  
  // If 10%+ of words are Hinglish markers, treat as Hinglish
  if (hinglishScore >= 15) {
    return {
      isNonEnglish: true,
      detectedLang: 'hi-Latn', // Hinglish (Hindi in Latin script)
      confidence: Math.min(90, Math.round(hinglishScore)),
      hinglishScore
    };
  }

  return {
    isNonEnglish: false,
    detectedLang: 'en',
    confidence: 0,
    hinglishScore
  };
}

/**
 * Sarvam AI language code mapping
 */
const SARVAM_LANG_MAP = {
  'hi': 'hi-IN',
  'hi-Latn': 'hi-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'bn': 'bn-IN',
  'kn': 'kn-IN',
  'gu': 'gu-IN',
  'ml': 'ml-IN'
};

/**
 * Translates non-English text to English using Sarvam AI.
 * Falls back to Gemini Flash if Sarvam fails.
 * 
 * @param {string} text - Input text
 * @param {string} sourceLang - Detected language code
 * @returns {{ translatedText: string, method: string, originalLang: string }}
 */
export async function translateToEnglish(text, sourceLang) {
  if (!text || sourceLang === 'en') {
    return { translatedText: text, method: 'none', originalLang: 'en' };
  }

  // Limit text to prevent API abuse
  const truncated = text.substring(0, 3000);
  
  // 1. Try Sarvam AI Translate (Best for Indian languages)
  const sarvamKey = process.env.SARVAM_API_KEY;
  if (sarvamKey && !sarvamKey.includes('PASTE')) {
    try {
      console.log(`🌐 [Translation] Using Sarvam AI for ${sourceLang}...`);
      
      const sarvamLang = SARVAM_LANG_MAP[sourceLang] || 'hi-IN';
      
      const response = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'api-subscription-key': sarvamKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: truncated,
          source_language_code: sarvamLang,
          target_language_code: 'en-IN',
          speaker_gender: 'Male',
          mode: 'formal',
          model: 'mayura:v1',
          enable_preprocessing: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        const translated = data.translated_text;
        
        if (translated && translated.trim().length > 10) {
          console.log(`✅ [Translation] Sarvam success: "${translated.substring(0, 80)}..."`);
          return {
            translatedText: translated,
            method: 'sarvam_translate',
            originalLang: sourceLang
          };
        }
      } else {
        console.warn(`⚠️ [Translation] Sarvam returned ${response.status}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Translation] Sarvam failed: ${err.message}`);
    }
  }

  // 2. Fallback: Gemini Flash translation
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.includes('PASTE')) {
    try {
      console.log(`🌐 [Translation] Fallback to Gemini Flash...`);
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      
      const langName = {
        'hi': 'Hindi', 'hi-Latn': 'Hinglish', 'ta': 'Tamil', 'te': 'Telugu',
        'bn': 'Bengali', 'kn': 'Kannada', 'gu': 'Gujarati', 'ml': 'Malayalam'
      }[sourceLang] || 'Indian language';
      
      const result = await model.generateContent(
        `Translate this ${langName} text to English. Return ONLY the translation, nothing else:\n\n${truncated}`
      );
      const translated = result.response.text()?.trim();
      
      if (translated && translated.length > 10) {
        console.log(`✅ [Translation] Gemini success: "${translated.substring(0, 80)}..."`);
        return {
          translatedText: translated,
          method: 'gemini_translate',
          originalLang: sourceLang
        };
      }
    } catch (err) {
      console.warn(`⚠️ [Translation] Gemini fallback failed: ${err.message}`);
    }
  }

  // 3. If all translation fails, return original (rules engine will do its best)
  console.warn(`❌ [Translation] All services failed. Proceeding with original text.`);
  return {
    translatedText: text,
    method: 'failed',
    originalLang: sourceLang
  };
}
