import express from "express";
import multer from "multer";
import { runRules } from "../services/engine/rulesEngine.js";
import { processDocument } from "../services/processing/ocrProcessor.js";
import { getRecommendedActions } from "../services/engine/recommendationEngine.js";
import { generateAIInsight } from "../services/analysis/aiReasoningService.js";
import Scan from "../models/Scan.js";
import TrustEntity from "../models/TrustEntity.js";
import mongoose from "mongoose";
import { analyzeSmsHeader } from "../services/analysis/smsHeaderScanner.js";
import { analyzeScamScript } from "../services/analysis/scriptScanner.js";
import { generateTrustScanReport } from "../services/processing/reportGenerator.js";
import { checkTriggersAndTrain } from "../services/ml/mlManager.js";
import { resolveUserScanAccess, syncUserProfile, updateUserScanStats } from "../services/scan/scanUserService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Diagnostic Route (Check Dependencies) ---
router.get("/diagnose", async (req, res) => {
    const results = {
        node: process.version,
        platform: process.platform,
        python: null,
        easyocr: null,
        fitz: null
    };

    try {
        const { execSync } = await import('child_process');
        results.python = execSync('python3 --version || python --version').toString().trim();
        results.tesseract = execSync('tesseract --version').toString().split('\n')[0].trim();
        results.pytesseract = execSync('python3 -c "import pytesseract; print(\'installed\')" || python -c "import pytesseract; print(\'installed\')"').toString().trim();
        results.fitz = execSync('python3 -c "import fitz; print(\'installed\')" || python -c "import fitz; print(\'installed\')"').toString().trim();
    } catch (e) {
        results.error = e.message;
    }

    res.json(results);
});

// --- User Profile & Credits ---
router.get("/me/:uid", async (req, res) => {
    try {
        const user = await syncUserProfile(req.params.uid);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});



// --- Unified Scan Route (Text + Documents) ---
router.post("/scan", upload.single('file'), async (req, res) => {
  console.log('DEBUG: ENTERING SCAN ROUTE');
  console.log('📥 [Scan API] Received request - Type:', req.body.type || 'unknown');
  try {
    let { content, type, userId, userEmail, depth, location, senderId } = req.body;
    let externalSignals = {};
    let trustSignals = {};
    let scanMeta = undefined;
    let analysisLayer = 1;
    let creditsConsumed = 0;
    let smsAnalysis = null;
    let scriptAnalysis = null;

    console.log(`Scan Request RECEIVED. UserID: ${userId || 'Guest'}, Type: ${type}, Depth: ${depth || 'basic'}${senderId ? `, Header: ${senderId}` : ''}`);

    // --- RBI SMS Header Spoofing Detection ---
    if (senderId && (type === 'message' || type === 'sms' || type === 'email')) {
        smsAnalysis = analyzeSmsHeader(senderId, content);
        if (smsAnalysis) {
            console.log(`🛡️ [SMS Header] Analysis: Risk ${smsAnalysis.riskScore}% (${smsAnalysis.isSpoofed ? 'SPOOFED' : 'SAFE'})`);
        }
    }

    // --- Script Intelligence Layer (Conversational Patterns) ---
    if (type === 'message' || type === 'sms' || type === 'email') {
        scriptAnalysis = analyzeScamScript(content);
        if (scriptAnalysis && scriptAnalysis.riskScore > 0) {
            console.log(`🗣️ [Script Intel] Flow detected: ${scriptAnalysis.detectedFlow.join(' -> ')} (Risk: ${scriptAnalysis.riskScore}%)`);
        }
    }


    // --- PRE-ENTRY: Tier & Permission Logic ---
    let ocrDepth = 'basic';
    const accessContext = await resolveUserScanAccess({ userId, userEmail, depth });
    depth = accessContext.depth;
    analysisLayer = accessContext.analysisLayer;
    ocrDepth = accessContext.ocrDepth;
    creditsConsumed = accessContext.creditsConsumed;

    if (depth === 'basic') {
        analysisLayer = 1;
        ocrDepth = 'basic';
    }

    // Ensure fallback values if body parameters were missing initially
    content = content || req.body.content || "";
    type = type || req.body.type || "text";
    
    // Scan Meta Initialization (Must happen before file check)
    scanMeta = { 
        verdictLabel: "Analysis Complete", 
        producer: "TrustScan Engine",
        confidence: "Medium"
    }; 

    // 1. Text Extraction (OCR for Files)
    const originalType = type; // Preserve user's intended scan type (job, company, etc.)
    
    let isNotJobDocument = false;
    let imageForensicsData = null;
    let isPaymentReceipt = originalType === 'payment';

    if (req.file) {
      console.log(`📂 [API Scan] Document upload detected: ${req.file.originalname} (Depth: ${ocrDepth})`);
      
      const isImageFile = req.file.mimetype?.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/i.test(req.file.originalname);
      
      let processed = { text: '', externalSignals: [], trustSignals: {}, scanMeta: {} };

      // ⚡ FAST-PATH FOR PURE IMAGE FORENSICS (Sub-second response)
      if (originalType === 'image') {
          try {
              const { analyzeDocumentForensics } = await import('../services/analysis/imageForensicsService.js');
              imageForensicsData = await analyzeDocumentForensics(req.file.buffer);
              console.log(`🔬 [API Scan] Fast Image Forensics Executed in Sub-Second: Verdict=${imageForensicsData?.forensicVerdict}, AI Score=${imageForensicsData?.aiGenerationScore}`);
          } catch (fErr) {
              console.warn(`⚠️ [API Scan] Image forensics error: ${fErr.message}`);
          }
      } else {
          // Concurrent Execution for Documents/Certificates
          const { analyzeDocumentForensics } = await import('../services/analysis/imageForensicsService.js');
          const [forensicsRes, docRes] = await Promise.all([
              isImageFile ? analyzeDocumentForensics(req.file.buffer).catch(() => null) : Promise.resolve(null),
              processDocument(req.file.buffer, req.file.mimetype, req.file.originalname, ocrDepth)
          ]);
          imageForensicsData = forensicsRes;
          processed = docRes;
      }
      
      content = processed.text || "";
      externalSignals = processed.externalSignals || [];
      trustSignals = processed.trustSignals || {};
      
      scanMeta = {
          ...scanMeta,
          ...processed.scanMeta,
          preview: processed.text ? (processed.text.substring(0, 300) + (processed.text.length > 300 ? "..." : "")) : "Visual Image Forensics Scan"
      };
      type = originalType === 'image' ? "image" : "document";

      // --- SMART DOCUMENT VALIDATION ---
      const extractedText = (content || "").trim();
      const textLength = extractedText.length;

      // Check if image OCR text actually contains payment/UPI indicators
      if (isImageFile) {
          const lowerText = extractedText.toLowerCase();
          const paymentKeywords = [
              'upi', 'utr', 'gpay', 'google pay', 'phonepe', 'paytm', 'bhim', 
              'paid to', 'payment successful', 'transaction id', 'txn id', 
              'ref no', 'transfer to', 'hdfc', 'sbi', 'icici', 'axis', 'kotak', 
              'credited to', 'debited from'
          ];
          const hasPaymentKw = paymentKeywords.some(kw => lowerText.includes(kw));
          isPaymentReceipt = hasPaymentKw;
          console.log(`💳 [API Scan] Image Payment Keyword Detection: isPaymentReceipt=${isPaymentReceipt} (matched text length: ${textLength})`);
      }

      // 🛑 CHECK 1: Plain image with no text
      if (textLength < 10) {
          if (originalType === 'payment' || originalType === 'image' || isImageFile) {
              console.log(`🔍 [Scan] Minimal text found (${textLength} chars) → returning image forensics verdict.`);

              const forensics = imageForensicsData || {
                  forensicVerdict: 'CLEAN',
                  aiGenerationScore: 0,
                  tamperingConfidence: 0,
                  isAiGenerated: false,
                  isTampered: false,
                  generatorFamilyHint: null
              };

              const aiRiskScore = Math.round(
                  (forensics.aiGenerationScore || 0) * 60 +
                  (forensics.tamperingConfidence || 0) * 40
              );

              const scanStatus = aiRiskScore > 45 ? 'fraud' : 'safe';
              const scanDocType = isPaymentReceipt ? 'payment' : 'image';

              const savedScan = await new Scan({
                  userId: userId || null,
                  type: scanDocType,
                  scanType: scanDocType,
                  status: scanStatus,
                  result: scanStatus,
                  target: req.file.originalname,
                  fileName: req.file.originalname,
                  fileMimeType: req.file.mimetype,
                  content: `[Image File: ${req.file.originalname}]`,
                  riskScore: aiRiskScore,
                  reasons: [
                      forensics.isAiGenerated
                          ? `AI-generated image detected (${Math.round(forensics.aiGenerationScore * 100)}% confidence). Generator: ${forensics.generatorFamilyHint || 'Unknown model family'}.`
                          : 'No AI generation signatures detected in this image.',
                      forensics.isTampered
                          ? `Image tampering detected (${Math.round(forensics.tamperingConfidence * 100)}% tamper confidence). ELA analysis found pixel-level editing.`
                          : 'No manual editing or pixel tampering detected.',
                  ].filter(Boolean),
                  signals: {},
                  metadata: {
                      isPaymentReceipt: isPaymentReceipt,
                      imageForensics: forensics
                  },
                  scanMeta: {
                      source: 'IMAGE_UPLOAD',
                      mimeType: req.file.mimetype,
                      forensicTamperScore: Math.round((forensics.tamperingConfidence || 0) * 100),
                      forensicAiScore: Math.round((forensics.aiGenerationScore || 0) * 100),
                      forensicVerdict: forensics.forensicVerdict,
                      generatorFamilyHint: forensics.generatorFamilyHint,
                      verdictLabel: forensics.isAiGenerated
                          ? `AI-Generated Image Detected`
                          : forensics.isTampered
                          ? 'Tampered Image Detected'
                          : 'Authentic Image',
                      confidence: aiRiskScore > 60 ? 'High' : 'Medium',
                  }
              }).save();

              return res.json({
                  id: savedScan._id,
                  scanType: isPaymentReceipt ? 'payment' : 'image',
                  target: req.file.originalname,
                  result: aiRiskScore > 45 ? 'fraud' : 'safe',
                  riskScore: aiRiskScore,
                  reasons: savedScan.reasons,
                  signals: {},
                  metadata: savedScan.metadata,
                  scanMeta: savedScan.scanMeta,
              });
          }

          console.log(`⚠️ [Scan] No readable text found in uploaded file.`);
          return res.status(400).json({
              error: "No readable text found",
              details: "The uploaded image/document does not contain any readable text. Please upload a document with text content.",
              suggestion: "To analyze a plain image for AI generation, use the 'AI Image & Payment Forensics' scan type instead."
          });
      }

      // 🛑 CHECK 2: Wrong document type for "job" scan
      if (originalType === 'job') {
          const jobKeywords = /offer\s*letter|appointment|joining|internship|job|salary|ctc|compensation|designation|probation|employment|recruitment|position|role|department|reporting|onboarding|stipend|training\s*period|hr\s*department|human\s*resource/i;
          
          if (!jobKeywords.test(extractedText)) {
              console.log(`⚠️ [Scan] Document does not appear to be a job/internship document. Proceeding with general analysis.`);
              isNotJobDocument = true;
          }
      }

    } else {
       // 1b. Meta for Direct Text/Link Scans
       scanMeta.textLength = content.length;
       scanMeta.source = "TEXT_INPUT";
       scanMeta.preview = content.substring(0, 300) + (content.length > 300 ? "..." : "");
    }

    // 2. Run Unified India Fraud Confidence Engine (Intelligence Layering + LLM)
    const result = await runRules(content, externalSignals, trustSignals, senderId, analysisLayer, originalType || type);

    let finalRisk = result.riskScore || 0;

    // 🔍 IMAGE FORENSICS ATTACHMENT
    if (imageForensicsData) {
        const aiPct = Math.round((imageForensicsData.aiGenerationScore || 0) * 100);
        const tamperPct = Math.round((imageForensicsData.tamperingConfidence || 0) * 100);

        scanMeta.forensicTamperScore = tamperPct;
        scanMeta.forensicAiScore = aiPct;
        scanMeta.forensicVerdict = imageForensicsData.forensicVerdict || (aiPct >= 50 ? 'AI_GENERATED' : aiPct >= 32 ? 'UNCERTAIN' : tamperPct >= 40 ? 'TAMPERED_REAL_IMAGE' : 'CLEAN');
        scanMeta.generatorFamilyHint = imageForensicsData.generatorFamilyHint;

        if (!result.metadata) result.metadata = {};
        result.metadata.imageForensics = {
            ...imageForensicsData,
            aiGenerationScorePct: aiPct,
            tamperingConfidencePct: tamperPct
        };
        result.metadata.isPaymentReceipt = isPaymentReceipt;

        if (imageForensicsData.isAiGenerated || aiPct >= 50) {
            finalRisk = Math.max(finalRisk, Math.max(aiPct, 65));
            scanMeta.verdictLabel = "🤖 AI-Generated Image Detected";
            if (!result.reasons.some(r => r.includes('AI-generated'))) {
                result.reasons.unshift(`🤖 AI-Generated Image Detected (${aiPct}% confidence). Generator: ${imageForensicsData.generatorFamilyHint || 'Latent Diffusion Model'}.`);
            }
        } else if (imageForensicsData.forensicVerdict === 'UNCERTAIN' || (aiPct >= 32 && aiPct < 50)) {
            finalRisk = 45;
            scanMeta.verdictLabel = "❓ Uncertain / Inconclusive AI Signal";
            if (!result.reasons.some(r => r.includes('Inconclusive') || r.includes('Uncertain'))) {
                result.reasons.unshift(`❓ Inconclusive AI Signature (${aiPct}% score). Multi-signal fusion detected ambiguous synthetic artifacts.`);
            }
        } else if (imageForensicsData.isTampered || tamperPct >= 40) {
            finalRisk = Math.max(finalRisk, Math.max(tamperPct, 60));
            scanMeta.verdictLabel = "✂️ Tampered Image Detected";
            if (!result.reasons.some(r => r.includes('tampering'))) {
                result.reasons.unshift(`✂️ Image Tampering Detected (${tamperPct}% confidence). Pixel-level ELA editing found.`);
            }
        } else {
            scanMeta.verdictLabel = "✅ Authentic Image";
            finalRisk = Math.min(finalRisk, 15);
        }
    }

    
    // Depth sensitivity adjustments
    if (analysisLayer === 3) {
        finalRisk = Math.round(Math.min(100, finalRisk * 1.15)); // Deep is 15% more sensitive
    } else if (analysisLayer === 2) {
        finalRisk = Math.round(Math.min(100, finalRisk * 1.05)); // Standard is 5% more sensitive
    }


    // --- Override for Unreadable Documents ---
    // User Requirement: "Never mark such documents as fully safe."
    if (externalSignals.isUnreadable) {
        console.log('⚠️ [Rules] Document is unreadable. Enforcing minimum risk status.');
        finalRisk = Math.max(finalRisk, 65); // High Warning / Suspicious
        result.reasons.unshift("Document Content Unreadable - Manual Verified Required.");
        scanMeta.verdictLabel = "Unreadable / Scanned Document";
        scanMeta.confidence = "Low";
    }

    // 3. 🔥 INTENT / COMBO LOGIC (accuracy booster)
    if (
      result.signals?.urgency &&
      result.signals?.impersonation &&
      result.signals?.links
    ) {
      finalRisk = Math.max(finalRisk, 90);
    }

    finalRisk = Math.min(finalRisk, 100);

    if (isNotJobDocument) {
        if (finalRisk < 30) {
            result.reasons.unshift("Note: This document does not appear to be a job offer or internship letter. However, it looks professional and we did not find any immediate malicious intent. It is likely safe to open.");
            scanMeta.verdictLabel = "Safe Document (Not a Job Offer)";
        } else {
            result.reasons.unshift("Note: This document does not appear to be a job offer or internship letter. Please be cautious, as we found suspicious findings based on general document analysis.");
        }
    }

    // --- Special Logic: Company Verifier ---
    if (type === 'company') {
        const entityCount = result.metadata?.entityCount || 0;
        
        if (entityCount === 0) {
            // No entities found
            // Check if it's likely just a name (short length)
            if (content.length < 100) {
                 finalRisk = Math.max(finalRisk, 50); // Warning/Neutral Zone
                 result.reasons.unshift("ID Missing: Please provide GSTIN or CIN for verification.");
            } else {
                 // Long text but no ID -> Suspicious job post
                 finalRisk = Math.max(finalRisk, 65); 
                 result.reasons.unshift("No valid GSTIN or CIN found for this business.");
            }
        } else {
            // Entities found - Check validity
            const hasInvalidId = result.signals?.invalidBusinessId > 0;
            const hasMismatch = result.signals?.businessContextMismatch > 0;
            
            if (hasInvalidId || hasMismatch) {
                finalRisk = Math.max(finalRisk, 85); // High Risk for Fake ID or Spoof
            } else {
                // Verified Registration - but only mark SAFE if no Blacklist hit
                const isKnownScam = result.signals?.knownScamSource || result.signals?.knownScamLink;
                
                if (!isKnownScam && finalRisk < 50) {
                    finalRisk = Math.min(finalRisk, 10);
                    result.flags.green.push("Verified Business Entity - Registered with MCA/GST");
                } else if (isKnownScam) {
                    finalRisk = Math.max(finalRisk, 95); // Blacklist OVERRIDES registration
                    result.reasons.unshift("ALERT: This registered business is currently ON OUR BLACKLIST.");
                }
            }
        }
    }

    // --- Special Logic: Link & Email Fallbacks (Professional Behavior) ---
    if (type === 'link') {
        const hasProtocol = /^(https?:\/\/|www\.)/i.test(content);
        const commonTlds = /\.(com|net|org|in|co|io|ly|ai|me|info|biz|site|online|top|xyz|gov|ac|edu|ru|ua|tw|cn|uk|pk|jp|de|fr|br|ca|au|us|app|dev|page|link)$/i;
        const modernDeploys = /\.(vercel\.app|github\.io|netlify\.app|pages\.dev|web\.app|firebaseapp\.com)$/i;
        const genericUrlPattern = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,12}(\/.*)?$/i;
        
        const isValid = hasProtocol 
          ? genericUrlPattern.test(content.trim()) 
          : (genericUrlPattern.test(content.trim()) && (commonTlds.test(content.trim()) || modernDeploys.test(content.trim())));

        if (!isValid || result.signals.lowInfoContent) {
           const errorMessage = result.signals.lowInfoContent 
             ? "Noise Detected: The input provided looks like keyboard mashing. Please enter real text."
             : "Invalid Link: Please provide a valid web URL with a common domain (e.g., example.com).";
           
           return res.status(400).json({ 
                success: false, 
                error: errorMessage 
           });
        }
        
        const linkCount = result.metadata?.linkCount || 0;
        if (linkCount === 0) {
             finalRisk = Math.max(finalRisk, 50); 
             result.reasons.unshift("Query Invalid: No valid web link detected.");
        }
    }

    if (type === 'email') {
        const emailCount = result.metadata?.emailCount || 0;
        if (emailCount === 0) {
             finalRisk = Math.max(finalRisk, 50); 
             result.reasons.unshift("Query Invalid: No valid email address detected.");
        }
    }

    // 4. Final status and confidence thresholds
    let status = "safe";
    if (finalRisk >= 75) status = "fraud";
    else if (finalRisk >= 60) status = "suspicious";
    else if (finalRisk >= 50) status = "action_required";
    else if (finalRisk >= 35) status = "risky"; // Raised from 20 to 35 to prevent Edunet false positives
    else status = "safe"; 
    
    // Safety check: Never mark as 'safe' if there are critical red flags (Score will reflect this anyway)
    if (status === "safe" && finalRisk > 30) {
        status = "risky";
    }

    // 5. Calculate Verdict Actions
    const actions = getRecommendedActions(result.signals, status);

    // --- VERDICT LABEL OVERRIDE (Fix: "High Quality" vs "High Risk" mismatch) ---
    // The initial label from OCR only indicates readability. We must update it with the Intelligence Verdict.
    
    // Check if Defense Won (White-Box Verification)
    const defenseWon = result.flags?.debate && 
                       (result.flags.debate.defensePoints > result.flags.debate.prosecutionPoints);

    if (status === 'fraud' || status === 'scam') {
        scanMeta.verdictLabel = (type === 'link') ? "🚫 DO NOT OPEN" : "🚫 Critical Fraud Risk";
    } else if (defenseWon && finalRisk < 40) {
        scanMeta.verdictLabel = (type === 'link') ? "✅ SAFE TO OPEN" : "✅ Verified Authentic";
    } else if (status === 'suspicious' || status === 'action_required') {
        scanMeta.verdictLabel = (type === 'link') ? "⚠️ OPEN WITH CAUTION" : "⚠️ Suspicious Content";
    } else if (status === 'risky') {
        scanMeta.verdictLabel = (type === 'link') ? "⚠️ OPEN WITH CAUTION" : "⚠️ Potential Risk Detected";
    } else if (status === 'safe') {
        scanMeta.verdictLabel = (type === 'link') ? "✅ SAFE TO OPEN" : "✅ Legitimate Document";
    }
    // If none of these, keep the OCR label (e.g. Unreadable) only if Risk is low
    if (finalRisk > 50 && scanMeta.verdictLabel.includes("High Quality")) {
        scanMeta.verdictLabel = "⚠️ Suspicious Content";
    }

    if (result.metadata?.academicSignals?.isAcademicDocument || originalType === 'academic') {
        if (result.metadata?.academicSignals?.isUgcBlacklisted) {
            scanMeta.verdictLabel = "🚫 FAKE / UNACCREDITED DEGREE";
        } else if (result.metadata?.academicSignals?.isUgcRecognized && finalRisk < 35) {
            scanMeta.verdictLabel = "✅ Accredited University Credential";
        } else if (result.metadata?.academicSignals?.flags?.length > 0) {
            scanMeta.verdictLabel = "⚠️ Suspicious Academic Document";
        }
    }

    const confidence =
      finalRisk >= 85
        ? "Very High"
        : finalRisk >= 65
        ? "High"
        : finalRisk >= 40
        ? "Medium"
        : "Low";

    // 4. ✨ AI Insight — Extract from already-computed LLM data (Basic/Standard)
    //    or fire async AI investigation (Deep Scan)
    let aiInsight = null;
    let aiModel = null;
    console.log(`🔍 [AI Gate] analysisLayer=${analysisLayer}, depth=${depth}, hasLLM=${!!result.llmClassification}`);
    
    // For Basic/Standard: Extract from LLM classification (already computed in parallel pipeline, ZERO extra cost)
    if (analysisLayer < 3 && result.llmClassification && result.llmClassification.summary) {
        aiInsight = result.llmClassification.summary;
        aiModel = result.llmClassification.modelUsed ? `AI Classifier (${result.llmClassification.modelUsed})` : "AI Classifier";
        console.log(`🧠 [AI Lite] Providing LLM classification summary for ${depth || 'basic'} user.`);
    }

    // 🔥 PERFORMANCE: For Deep Scan, fire AI insight generation as a PROMISE (don't await yet)
    let aiInsightPromise = null;
    if (analysisLayer === 3) {
        console.log(`🧠 [Prophet AI] Triggering Deep Investigation for: ${type}, Score: ${finalRisk}%`);
        const enrichedMetadata = { ...result.metadata, _flags: result.flags };
        aiInsightPromise = generateAIInsight(content, finalRisk, result.reasons || [], result.signals || {}, enrichedMetadata)
            .catch(aiErr => {
                console.error("❌ [Prophet AI] Reasoning layer failed:", aiErr.message);
                return null;
            });
    }

    // 5. Prepare DB record (can be done while AI is still running)
    const minimalMetadata = { ...result.metadata };
    delete minimalMetadata.normalizedText;

    const scanDataRecord = {
      userId: userId || null,
      type: ["message", "link", "document", "email", "job", "company", "academic", "degree", "payment", "image", "gov_id"].includes(originalType || type)
        ? (isPaymentReceipt ? (originalType || type) : (imageForensicsData ? "image" : (originalType || type)))
        : "document",
      content: content.substring(0, 500),
      fileName: req.file ? req.file.originalname : null,
      fileMimeType: req.file ? req.file.mimetype : null,
      riskScore: finalRisk,
      status,
      confidence,
      reasons: result.reasons?.slice(0, 3) || [],
      signals: result.signals || {},
      metadata: minimalMetadata,
      recommendation: getRecommendedActions(result.signals, status),
      analysisLayer: analysisLayer,
      creditsConsumed: creditsConsumed,
      location: location || undefined,
      senderId: senderId || null,
      smsHeaderAnalysis: smsAnalysis || null,
      aiInsight: null, // Will be populated after AI resolves
      aiModel: null
    };

    // Guest TTL setup
    if (!userId) {
        scanDataRecord.isGuest = true;
        scanDataRecord.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    console.log(`🔍 [API] Final Score: ${finalRisk}, UserID: ${scanDataRecord.userId || 'Guest'}`);

    // 🔥 PERFORMANCE: Resolve AI + Save DB in PARALLEL
    try {
      // If Deep Scan, wait for AI insight to resolve (was already fired above)
      if (aiInsightPromise) {
          const aiResult = await aiInsightPromise;
          if (aiResult && typeof aiResult === 'object') {
              aiInsight = aiResult.insight;
              aiModel = aiResult.modelUsed;
              if (aiResult.deepScanReport) {
                  scanMeta.deepScanReport = aiResult.deepScanReport;
              }
          } else if (aiResult) {
              aiInsight = aiResult;
              aiModel = "Neural Layer v4";
          }
          if (!aiInsight) {
              aiInsight = "The AI investigator analyzed several patterns but could not find specific anomalies to highlight. The risk score reflects the detected markers.";
              aiModel = "TrustScan Heuristic";
          }
      }

      // Now populate AI data into the record
      scanDataRecord.aiInsight = aiInsight;
      scanDataRecord.aiModel = aiModel;

      // 6. Save scan + update profile metrics
      const savedDoc = await Scan.create(scanDataRecord);
      await updateUserScanStats({ userId, status, finalRisk, savedDoc });

      console.log(`✅ [Database] Permanent Save Successful! ID: ${savedDoc._id}`);
      
      // 7. Response to client
      console.log(`📦 [API] Dispatching response for ${savedDoc._id}. AI Insight Present: ${!!aiInsight}`);

      res.json({
        id: savedDoc._id,
        result: status,
        status,
        riskScore: finalRisk,
        aiInsight: aiInsight || null,
        aiModel: aiModel || null,
        analysisLayer,
        confidence,
        reasons: scanDataRecord.reasons,
        flags: result.flags,
        signals: result.signals,
        metadata: result.metadata,
        scanMeta: scanMeta,
        trustScanReport: generateTrustScanReport(finalRisk, result.signals, result.metadata),
        recommendation: getRecommendedActions(result.signals, status),
        llmClassification: result.llmClassification ? {
            isScam: result.llmClassification.isScam,
            scamType: result.llmClassification.scamType,
            confidence: result.llmClassification.confidence,
            redFlags: result.llmClassification.redFlags,
            greenFlags: result.llmClassification.greenFlags
        } : null,
        translationResult: result.translationResult ? {
            method: result.translationResult.method,
            originalLang: result.translationResult.originalLang
        } : null
      });
    } catch (saveError) {
      console.error("❌ MongoDB Save Error:", saveError.message);
      const tempId = new mongoose.Types.ObjectId();
      res.json({
        id: tempId, 
        status,
        riskScore: finalRisk,
        confidence,
        aiInsight: aiInsight || null,
        analysisLayer,
        reasons: scanDataRecord.reasons,
        flags: result.flags,
        signals: result.signals,
        metadata: result.metadata,
        scanMeta: scanMeta,
        trustScanReport: generateTrustScanReport(finalRisk, result.signals, result.metadata),
        recommendation: getRecommendedActions(result.signals, status)
      });
    }
  } catch (error) {
    console.error("Scan failed:", error);
    res.status(500).json({ 
        error: "Internal server error", 
        details: error.message,
        stack: error.stack 
    });
  }
});

/**
 * Capture User Feedback (Ground Truth for ML Training)
 * POST /api/feedback
 */
router.post("/feedback", async (req, res) => {
  try {
    const { scanId, feedback, rating } = req.body;
    console.log(`📥 Feedback Received: ID=${scanId}, Rating=${rating}, Type=${feedback}`);

    if (!scanId || (feedback === undefined && rating === undefined)) {
      console.warn("⚠️ Missing scanId, feedback, or rating in request");
      return res.status(400).json({ error: "scanId and either feedback or rating are required" });
    }

    // Validate MongoDB ObjectId format to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(scanId)) {
        console.warn(`🚫 Invalid ObjectId format: ${scanId}`);
        return res.status(400).json({ error: "Invalid scan ID format" });
    }

    const scan = await Scan.findById(scanId);
    if (!scan) {
      console.warn(`🕵️ Scan not found for ID: ${scanId}`);
      return res.status(404).json({ error: "Scan record not found" });
    }

    // 1. Save the numeric rating if provided
    if (rating !== undefined) {
        scan.userRating = Number(rating);
        
        // 2. Auto-derive userFeedback label for ML training
        // rating 4-5 => correct
        // rating 1-2 => incorrect (derived based on scan status)
        if (rating >= 4) {
            scan.userFeedback = 'correct';
        } else if (rating <= 2) {
            const isFlagged = ["fraud", "suspicious", "scam", "risky"].includes(scan.status);
            scan.userFeedback = isFlagged ? 'incorrect_safe' : 'incorrect_fraud';
        } else {
            scan.userFeedback = null; // Neutral / No change
        }
    }

    // 3. Fallback/Legacy: Direct feedback label if provided
    if (feedback) {
        scan.userFeedback = feedback;
    }

    // 5. AUTO-LEARNING ENGINE: Trigger Auto-Grey Listing
    if (scan.userFeedback === 'incorrect_fraud') {
        try {
            const detectedEntities = scan.metadata?.detectedEntities || [];
            const companyName = scan.type === 'company' ? scan.content : (scan.metadata?.databaseHits?.[0]?.name);
            
            // Collect candidates for Grey Listing
            const candidates = [];
            
            // Case A: Hard Identifiers (CIN/GST)
            detectedEntities.forEach(entity => {
                if (entity.isValid && (entity.type === 'CIN' || entity.type === 'GSTIN')) {
                    candidates.push({
                        name: entity.enrichment?.name || `Suspicious Entity (${entity.value})`,
                        identifier: entity.value,
                        type: 'Community Reported'
                    });
                }
            });

            // Case B: Company Scan (Pure Name)
            if (scan.type === 'company' && scan.content.length > 3) {
                candidates.push({
                    name: scan.content,
                    type: 'Community Reported (Direct Scan)'
                });
            }

            // Process Candidates
            for (const item of candidates) {
                const nameLower = item.name.toLowerCase().trim();
                
                // Avoid redundant entries
                const existing = await TrustEntity.findOne({ 
                    $or: [
                        { nameLower },
                        { associatedIdentifiers: item.identifier }
                    ] 
                });

                if (!existing) {
                    console.log(`🤖 [Auto-Learner] Adding "${item.name}" to Grey List via User Feedback...`);
                    await TrustEntity.create({
                        name: item.name,
                        nameLower,
                        category: 'grey_list',
                        type: item.type,
                        autoLearned: true,
                        associatedIdentifiers: item.identifier ? [item.identifier] : [],
                        evidence: [`User reported as scam via ScanID: ${scanId}`]
                    });
                } else if (existing.category === 'grey_list') {
                     // Increment trust score / occurrence if already greylisted
                     existing.trustScore = (existing.trustScore || 0) + 1;
                     existing.evidence.push(`Additional community report: ${scanId}`);
                     await existing.save();
                }
            }
        } catch (learnErr) {
            console.error("🤖 [Auto-Learner] Failed to process feedback for ML training:", learnErr);
        }
    }

    await scan.save();

    console.log(`✅ Feedback updated for scan ${scanId} (Rating: ${scan.userRating}, Label: ${scan.userFeedback})`);
    res.json({ 
        message: "Report received. Your feedback helps our AI learn and warn other users!",
        userFeedback: scan.userFeedback 
    });

    // Reactive Trigger: Check if we should retrain based on this new feedback
    try {
        checkTriggersAndTrain();
    } catch (mlErr) {
        console.error("⚠️ [ML Manager] Trigger check failed:", mlErr.message);
    }
  } catch (error) {
    console.error("❌ Feedback Error Detailed:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to save feedback", details: error.message });
  }
});

// 📜 Get single scan result (for sharing)
router.get("/results/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid scan ID format" });
    }

    const scan = await Scan.findById(id);
    if (!scan) {
      return res.status(404).json({ error: "Scan record not found" });
    }

    // Prepare response in the same format as the scan result
    res.json({
      id: scan._id,
      target: scan.content?.substring(0, 100) || "Scanned Content",
      result: scan.status, // Map status to result for UI compatibility
      status: scan.status,
      riskScore: scan.riskScore,
      confidence: scan.confidence,
      reasons: scan.reasons,
      signals: scan.signals,
      metadata: scan.metadata,
      recommendation: scan.recommendation,
      aiInsight: scan.aiInsight, // Return the AI reasoning for shared links
      date: new Date(scan.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });
  } catch (error) {
    console.error("Failed to fetch scan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📜 Scan history (user-wise)
router.get("/history/:userId", async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

export default router;
