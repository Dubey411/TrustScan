import { createRequire } from 'module';
import { createWorker } from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { runDocumentPipeline } from './documentPipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for signal initialization (kept for compatibility)
function initializeSignals() {
    return {
        missingCriticalFields: 0,
        genericSuccessMsg: 0,
        softwareMetadata: 0,
        lowOcrConfidence: 0,
        urgency: 0,
        contextMismatch: 0,
        registrationFee: 0,
        unofficialDomain: 0,
        docAnomalies: 0,
        metadataAnomalies: 0,
        isAiGenerated: 0,
        isManipulated: 0
    };
}

function initializeTrustSignals() {
    return {
        officialDomain: 0,
        standardStructure: 0
    };
}

/**
 * Universal OCR Processor (v2 - Pipeline Powered)
 */
export async function processDocument(fileBuffer, mimeType, originalName = "", depth = 'basic') {
    console.log(`📄 [OCR Processor v2] Processing: ${originalName || 'Buffer'} (${mimeType}) - Depth: ${depth}`);
    
    // 1. Run the Advanced Pipeline
    const pipelineResult = await runDocumentPipeline(fileBuffer, mimeType, depth);
    
    let text = pipelineResult.text || "";
    const externalSignals = initializeSignals();
    const trustSignals = initializeTrustSignals();
    
    // 2. Map Pipeline Signals to Legacy Structure
    if (pipelineResult.signals.visual_anomalies.includes('LOW_QUALITY_FAKE_LIKELY')) {
        externalSignals.lowOcrConfidence = 1;
    }
    if (pipelineResult.signals.structures.hasAmount && !pipelineResult.signals.structures.hasTransactionId) {
        externalSignals.missingCriticalFields = 1;
    }
    
    if (pipelineResult.signals.isAiGenerated) {
        externalSignals.isAiGenerated = 1;
    }
    if (pipelineResult.signals.isManipulated) {
        externalSignals.isManipulated = 1;
        externalSignals.softwareMetadata = 1; // Map to rules engine category
    }

    // --- Fast Path Verdict Mapping ---
    if (pipelineResult.signals.visual_anomalies.includes('KNOWN_SCAM_DATABASE_HIT')) {
        externalSignals.contextMismatch = 1; // Trigger jobScam rules
    }
    if (pipelineResult.signals.visual_anomalies.includes('GREYLIST_ENTITY_DETECTED')) {
        externalSignals.urgency = 1; // Trigger verification rules
    }

    // 3. Verdict Logic
    let verdictLabel = "Document Analysis Complete";
    let isUnreadable = false;
    const minTextLength = 20;
    const looksUnreadable = !text || text.trim().length < minTextLength || text.includes("[Document Analysis Failed]");
    
    // Check for Adversarial Outcome (Did Defense Win?)
    const defenseWon = pipelineResult.flags?.debate && 
                       (pipelineResult.flags.debate.defensePoints > pipelineResult.flags.debate.prosecutionPoints);

    if (pipelineResult.signals.visual_anomalies.includes('KNOWN_SCAM_DATABASE_HIT')) {
        verdictLabel = "⚠️ VERIFIED FRAUD SOURCE";
    } else if (defenseWon && pipelineResult.confidence > 50) {
        verdictLabel = "✅ Verified Authentic";
    } else if (pipelineResult.signals.visual_anomalies.includes('GREYLIST_ENTITY_DETECTED')) {
        verdictLabel = "⚠️ EMERGING SUSPICIOUS ENTITY";
    } else if (looksUnreadable && pipelineResult.confidence < 30) {
         const reason = text.includes("Failed") ? "System Error" : "Scanned / Low Quality / No Text Layer";
         if (!text || text.includes("Failed")) {
            text = `[Document Content Not Readable - ${reason}]\n\nDebug Info: Method=${pipelineResult.extractionMethod.join(', ')}`;
         }
         isUnreadable = true;
         verdictLabel = "Unreadable / Scanned Document";
         externalSignals.isUnreadable = 1; 
    } else if (externalSignals.lowOcrConfidence) {
        verdictLabel = "Suspicious / Low Quality";
    } else if (externalSignals.isAiGenerated || externalSignals.isManipulated) {
        verdictLabel = "AI-Generated / Manipulated";
    } else if (text.length > 500) {
        verdictLabel = "High Quality Document"; 
    }

    // 4. Construct Metadata
    const scanMeta = {
        source: pipelineResult.extractionMethod.join(' + '),
        textLength: text.length,
        mimeType: mimeType,
        timestamp: new Date().toISOString(),
        producer: "TrustScan Pipeline v2",
        creator: "TrustScan Pipeline v2",
        verdictLabel,
        isUnreadable: isUnreadable,
        confidence: pipelineResult.confidence > 80 ? "High" : (pipelineResult.confidence > 50 ? "Medium" : "Low"),
        pagesAnalyzed: pipelineResult.pagesAnalyzed,
        totalPages: pipelineResult.totalPages
    };

    console.log(`✅ [OCR Complete] Verdict: ${verdictLabel}, Conf: ${pipelineResult.confidence.toFixed(1)}%`);
    return { text, externalSignals, trustSignals, scanMeta };
}


// --- Helpers ---
// (No validation helpers needed here as Pipeline handles extraction)

