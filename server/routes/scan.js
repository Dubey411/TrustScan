import express from "express";
import multer from "multer";
import { runRules } from "../services/rulesEngine.js";
import { processDocument } from "../services/ocrProcessor.js";
import { getRecommendedActions } from "../services/recommendationEngine.js";
import { checkTriggersAndTrain } from "../services/mlManager.js";
import Scan from "../models/Scan.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');

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

// --- Unified Scan Route (Text + Documents) ---
router.post("/scan", upload.single('file'), async (req, res) => {
  console.log('DEBUG: ENTERING SCAN ROUTE');
  console.log('📥 [Scan API] Received request - Type:', req.body.type || 'unknown');
  try {
    let { content, type, userId } = req.body;
    let externalSignals = {};
    let trustSignals = {};
    let scanMeta = undefined;

    console.log(`Scan Request received. UserID: ${userId || 'Guest'}, Type: ${type}`);

    // 1. If a file is uploaded, run the OCR/Visual Pre-processor
    if (req.file) {
      console.log(`📂 [API Scan] Document upload detected: ${req.file.originalname}`);
      const processed = await processDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
      
      content = processed.text;
      externalSignals = processed.externalSignals;
      trustSignals = processed.trustSignals || {};
      
      scanMeta = {
          ...processed.scanMeta,
          preview: processed.text?.substring(0, 300) + (processed.text?.length > 300 ? "..." : "")
      };
      type = "document";
    }

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Valid content or file is required for scanning" });
    }

    // 2. Run rules engine (Feature Extraction) - REUSED
    const result = await runRules(content, externalSignals, trustSignals);

    let finalRisk = result.riskScore || 0;

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
            
            if (hasInvalidId) {
                finalRisk = Math.max(finalRisk, 85); // High Risk for Fake ID
                result.reasons.unshift("Security Alert: Invalid/Fake GSTIN Detected.");
            } else {
                // All good
                finalRisk = Math.min(finalRisk, 10);
                result.flags.green.push("Verified Business Entity - Registered with MCA/GST");
            }
        }
    }

    // 4. Final status and confidence thresholds
    let status = "safe";
    if (finalRisk >= 75) status = "fraud";
    else if (finalRisk >= 60) status = "suspicious";
    else if (finalRisk >= 50) status = "action_required";
    else if (finalRisk >= 40) status = "risky";
    else if (finalRisk >= 20 && result.reasons.length > 0) status = "risky";
    else if (finalRisk >= 1) status = "safe"; 
    
    // Safety check: Never mark as 'safe' if there are active red flag reasons
    if (status === "safe" && result.reasons.length > 0) {
        status = "risky";
        finalRisk = Math.max(finalRisk, 40);
    }

    const confidence =
      finalRisk >= 85
        ? "Very High"
        : finalRisk >= 65
        ? "High"
        : finalRisk >= 40
        ? "Medium"
        : "Low";

    // 5. Prepare DB record with ML features
    const scanDataRecord = {
      userId: userId || null,
      type: ["message", "link", "document", "email", "job", "company"].includes(type)
        ? type
        : "message",
      content: content.substring(0, 5000), // Cap content size
      riskScore: finalRisk,
      status,
      confidence,
      reasons: result.reasons?.slice(0, 3) || [],
      signals: result.signals || {},
      metadata: result.metadata || {},
      recommendation: getRecommendedActions(result.signals, status)
    };
    console.log(`🔍 [API] Generated ${scanDataRecord.recommendation.length} recommendations for status: ${status}`);

    // 6. Save scan
    try {
      const savedDoc = await Scan.create(scanDataRecord);
      console.log(`✅ ${userId ? 'Auth User' : 'Guest'} Scan saved. ID: ${savedDoc._id}`);
      
      // 7. Response to client
      res.json({
        id: savedDoc._id,
        status,
        riskScore: finalRisk,
        confidence,
        reasons: scanDataRecord.reasons,
        flags: result.flags, // New Green/Red Flags
        signals: result.signals,
        metadata: result.metadata,
        scanMeta: scanMeta,
        recommendation: getRecommendedActions(result.signals, status)
      });
    } catch (saveError) {
      console.error("❌ MongoDB Save Error:", saveError.message);
      const tempId = new mongoose.Types.ObjectId();
      res.json({
        id: tempId, 
        status,
        riskScore: finalRisk,
        confidence,
        reasons: scanDataRecord.reasons,
        flags: result.flags,
        signals: result.signals,
        metadata: result.metadata,
        scanMeta: scanMeta,
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

    await scan.save();

    console.log(`✅ Feedback updated for scan ${scanId} (Rating: ${scan.userRating}, Label: ${scan.userFeedback})`);
    res.json({ 
        message: "Feedback received. Thank you for helping us improve!",
        userFeedback: scan.userFeedback 
    });

    // Reactive Trigger: Check if we should retrain based on this new feedback
    checkTriggersAndTrain();
  } catch (error) {
    console.error("❌ Feedback Error Detailed:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to save feedback", details: error.message });
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
