import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectStructuralAnomalies } from '../analysis/idValidator.js';
import { analyzeLinks } from '../analysis/linkScanner.js';
import { analyzeEntities } from '../analysis/entityScanner.js';
import { analyzeSmsHeader } from '../analysis/smsHeaderScanner.js';
import { analyzeScamScript } from '../analysis/scriptScanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const rulesPath = path.join(__dirname, '..', '..', 'data', 'fraudRules.json');
const weightsPath = path.join(__dirname, '..', '..', 'data', 'weights.json');

// Memory cache
let fraudRules = [];
let modelWeights = { bias: 0, signals: {}, metadata: {} };

// --- Load Assets ---
try {
  if (fs.existsSync(rulesPath)) {
    fraudRules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  }
  if (fs.existsSync(weightsPath)) {
    modelWeights = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
  }
} catch (err) {
  console.error("Error loading inference assets:", err);
}

/**
 * Advanced Metadata Extraction
 */
function extractFeatures(text) {
  const rawText = text || "";
  // Normalize text for detection: remove hyphens and extra spaces
  const cleanText = rawText.replace(/-/g, ' ').replace(/\s+/g, ' ');
  const length = cleanText.length;
  
  if (length === 0) return { textLength: 0, capsRatio: 0, hasUrl: false, linkCount: 0, phoneCount: 0 };

  const capsCount = (rawText.match(/[A-Z]/g) || []).length;
  const capsRatio = length > 0 ? capsCount / length : 0;
  
  // Pattern extraction
  const urls = rawText.match(/https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|io|ly|co|gl|top|xyz|icu|biz|info|site|online|zip|mov)\b/gi) || [];
  const phones = rawText.match(/(\+?\d{1,3}[- ]?)?\d{10}/g) || [];
  const emails = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

  return {
    textLength: length,
    capsRatio: parseFloat(capsRatio.toFixed(2)),
    hasUrl: urls.length > 0,
    linkCount: urls.length,
    phoneCount: phones.length,
    emailCount: emails.length,
    normalizedText: cleanText.toLowerCase(),
    // ADVANCED: Remove ALL separators to catch P-A-Y-M-E-N-T, P.A.Y.M.E.N.T, etc.
    fuzzyNormalizedText: rawText.toLowerCase().replace(/[^a-z0-9]/g, '')
  };
}

/**
 * Core Decision Engine
 * @param {string} content - Text to analyze
 * @param {object} externalSignals - Signals from OCR/Vision layers
 * @param {object} trustSignals - Whitelist/Internal trust signals
 * @param {string} senderId - Optional SMS Header ID (Indian standard)
 */
export async function runRules(content, externalSignals = {}, trustSignals = {}, senderId = null) {
  const reasons = [];
  const rulesFired = [];

  // Initialize Signals Vector
  let signals = {
    urgency: 0,
    financial: 0,
    impersonation: 0,
    jobScam: 0,
    techSupport: 0,
    links: 0,
    personalData: 0,
    trustSignal: 0,
    scamKeywords: 0,
    // -- Link/URL Layer Signals --
    suspiciousTld: 0,
    typosquatting: 0,
    shortenerObfuscation: 0,
    ipHost: 0,
    punycodeHomograph: 0,
    subdomainAbuse: 0,
    pathObfuscation: 0,
    contentMismatch: 0,
    // -- Universal Document Signals (Green/Red Flags) --
    missingCriticalFields: externalSignals.missingCriticalFields || 0,
    genericSuccessMsg: externalSignals.genericSuccessMsg || 0,
    softwareMetadata: externalSignals.softwareMetadata || 0,
    ocrConfidenceParadox: externalSignals.ocrConfidenceParadox || 0,
    lowOcrConfidence: externalSignals.lowOcrConfidence || 0,
    contextMismatch: externalSignals.contextMismatch || 0,
    isAiGenerated: externalSignals.isAiGenerated || 0,
    isManipulated: externalSignals.isManipulated || 0,
    
    // -- Legacy Document Signals --
    registrationFee: externalSignals.registrationFee || 0,
    unofficialDomain: externalSignals.unofficialDomain || 0,
    docAnomalies: externalSignals.docAnomalies || 0,
    metadataAnomalies: externalSignals.metadataAnomalies || 0,
    corporateAnomalies: externalSignals.corporateAnomalies || 0,
    structuralAnomalies: detectStructuralAnomalies(content) ? 1 : 0,
    // -- Business Verification Signals --
    hasGst: 0,
    hasCin: 0,
    invalidBusinessId: 0,
    businessContextMismatch: 0,
    lowInfoContent: 0,
  };

  const metadata = extractFeatures(content);
  
  // -- Gibberish / Low Info Detection --
  const cleanContent = content.trim();
  if (cleanContent.length > 0) {
      const hasSpaces = cleanContent.includes(' ');
      const hasVowels = /[aeiouy]/i.test(cleanContent);
      
      // FIX: Don't flag URLs as "long single words". 
      // A string is a long single word if it has no spaces AND is not a URL.
      const isExtremelyLongSingleWord = cleanContent.length > 25 && !hasSpaces && !metadata.hasUrl;
      const isGibberish = cleanContent.length > 5 && !hasVowels && /^[a-z]+$/i.test(cleanContent);
      
      if (isExtremelyLongSingleWord || isGibberish) {
          signals.lowInfoContent = 1;
      }
  }

  // --- MISSION: NATURE OF LANGUAGE & BEHAVIORAL SIGNALS ---
  const scriptAnalysis = analyzeScamScript(content);
  const activityAnalysis = await analyzeLinks(content);
  
  // --- MISSION: HARD IDENTIFICATION (CIN, Aadhaar, PAN, GST) ---
  const entityAnalysis = analyzeEntities(content);
  const smsAnalysis = senderId ? analyzeSmsHeader(senderId, content) : null;
  const hasStructuralAnomaly = detectStructuralAnomalies(content);

  // Initialize Signals Vector
  signals = { 
      ...signals, 
      ...activityAnalysis.signals, 
      ...entityAnalysis.signals,
      smsSpoofRisk: smsAnalysis?.isSpoofed ? 1 : 0,
      scamFlowDetected: scriptAnalysis?.riskScore > 50 ? 1 : 0,
      structuralAnomalies: hasStructuralAnomaly ? 1 : 0,
      knownScamSource: 0,
      emergingRiskSource: 0
  };

  // --- MISSION: ENTITY RECOGNITION (RED/GREY LISTS) ---
  const trustDbPath = path.join(__dirname, '..', '..', 'data', 'entityTrustDatabase.json');
  try {
      if (fs.existsSync(trustDbPath)) {
          const trustDb = JSON.parse(fs.readFileSync(trustDbPath, 'utf8'));
          const lowerContent = content.toLowerCase();
          
          // Red List (Confirmed Fraud)
          const redHit = trustDb.blacklist.find(b => lowerContent.includes(b.name.toLowerCase()));
          if (redHit) {
              signals.knownScamSource = 1;
              reasons.push(`DATABASE MATCH: Associated with known entity "${redHit.name}"`);
          }

          // Grey List & Emerging Risk
          const greyHit = trustDb.greylist.find(g => lowerContent.includes(g.name.toLowerCase()));
          if (greyHit) {
              signals.emergingRiskSource = 1;
              reasons.push(`NETWORK ALERT: "${greyHit.name}" is on our active verification list`);
          }
      }
  } catch (e) {
      console.error("RulesEngine: Trust DB Check failed", e);
  }

  // --- INTEGRATED MISSION VERDICT (Evidence First) ---
  let indiaConfidenceRisk = 0;

  // 1. Evidence: Structural Faults (Invalid ID)
  if (hasStructuralAnomaly) {
      indiaConfidenceRisk = Math.max(indiaConfidenceRisk, 95);
      reasons.push("Alert: Invalid Aadhaar/PAN structure detected in content");
  }

  // 2. Evidence: Nature of Language
  if (scriptAnalysis.riskScore > 40) {
      indiaConfidenceRisk = Math.max(indiaConfidenceRisk, scriptAnalysis.riskScore);
      if (scriptAnalysis.detectedFlow.length > 1) {
          reasons.push(`Behavioral Flow: ${scriptAnalysis.detectedFlow.join(' → ')}`);
      }
  }

  // 3. Evidence: Entity Integrity
  if (entityAnalysis.metadata?.entityDiscrepancies?.length > 0) {
      indiaConfidenceRisk = Math.max(indiaConfidenceRisk, 85);
      reasons.push(...entityAnalysis.metadata.entityDiscrepancies);
  }

  const normalizedText = metadata.normalizedText;

  // 1. EXECUTE RULES (Feature Engineering)
  const checkRuleCondition = (condition, text, fuzzyText) => {
    if (condition.hasKeywordsAny) {
      return condition.hasKeywordsAny.some(kw => {
        const lowerKw = kw.toLowerCase();
        // Check standard AND fuzzy (e.g. "payment" matches "p-a-y-m-e-n-t" in fuzzyText)
        return text.includes(lowerKw) || fuzzyText.includes(lowerKw.replace(/[^a-z0-9]/g, ''));
      });
    }
    if (condition.hasFeature) {
      if (condition.hasFeature === 'url') return metadata.hasUrl;
      if (condition.hasFeature === 'untrustedUrl') {
        const hasSuspicion = signals.typosquatting > 0 || signals.suspiciousTld > 0 || signals.ipHost > 0 || signals.shortenerObfuscation > 0;
        return metadata.hasUrl && hasSuspicion;
      }
      if (condition.hasFeature === 'phone') return metadata.phoneCount > 0;
    }
    if (condition.hasSignal) {
      return (signals[condition.hasSignal] || 0) > 0;
    }
    if (condition.isMissingSignal) {
      return (signals[condition.isMissingSignal] || 0) === 0;
    }
    if (condition.checkLengthMax) return content.length <= condition.checkLengthMax;
    if (condition.checkLengthMin) return content.length >= condition.checkLengthMin;
    return false;
  };

  let maxImpliedRisk = 0;
  fraudRules.forEach(rule => {
    if (rule.logic?.and && rule.logic.and.every(cond => checkRuleCondition(cond, normalizedText, metadata.fuzzyNormalizedText))) {
      reasons.push(rule.reason);
      rulesFired.push(rule.id);
      
      if (rule.impliedRisk && rule.impliedRisk > maxImpliedRisk) {
        maxImpliedRisk = rule.impliedRisk;
      }

      if (rule.category && (rule.category in signals)) {
        signals[rule.category] = (signals[rule.category] || 0) + 1;
      }
    }
  });

  // 1b. Add Business Entity Discrepancies
  if (entityAnalysis.metadata?.entityDiscrepancies && entityAnalysis.metadata.entityDiscrepancies.length > 0) {
      reasons.push(...entityAnalysis.metadata.entityDiscrepancies);
      maxImpliedRisk = Math.max(maxImpliedRisk, 80); // Strict penalty for CIN/Context mismatch
  }

  console.log(`🧠 [RulesEngine] Result: ${reasons.length} reasons, Max Implied Risk: ${maxImpliedRisk}%, Signals:`, signals);

  // 2. WEIGHTED INFERENCE (Logistic Regression)
  let z = modelWeights.bias || 0;

  // Signal influence
  for (const signal in signals) {
    z += (signals[signal] * (modelWeights.signals[signal] || 0));
  }

  // Metadata influence
  z += (metadata.capsRatio * (modelWeights.metadata.capsRatio || 0));
  z += (metadata.linkCount * (modelWeights.metadata.linkCount || 0));
  z += (metadata.phoneCount * (modelWeights.metadata.phoneCount || 0));

  // 3. TRUST SIGNAL OVERRIDE
  if (signals.trustedDomain) {
    z -= 5; // Aggressive reduction for whitelisted domains
    maxImpliedRisk = Math.min(maxImpliedRisk, 15); // Cap risk for trusted domains
  }

  if (trustSignals.officialDomain) {
    z -= 2; 
  }

  // 4. Sigmoid Function: 1 / (1 + exp(-z))
  const probability = 1 / (1 + Math.exp(-z));
  const mlScore = probability * 100;
  
  // 5. Hybrid Scoring Logic: Use ML score but ensure it doesn't drop below the highest rule risk
  const finalScore = Math.max(mlScore, maxImpliedRisk);

  // 4. Generate Explanatory Flags
  const flags = {
    red: [...new Set(reasons)],
    green: []
  };

  // Populate Green Flags from Trust Signals
  if (trustSignals.officialDomain) {
    flags.green.push("Verified Corporate Domain detected");
    z -= 2; // Slight score reduction bonus
  }
  if (trustSignals.validMetadata) {
    flags.green.push("Document Metadata appears authentic");
  }
  if (trustSignals.standardStructure) {
    flags.green.push("Standard professional formatting");
  }
  
  if (signals.trustedDomain) {
    flags.green.push("Contains verified trusted domain");
  }

  return {
    riskScore: Math.round(finalScore),
    reasons: [...new Set(reasons)].slice(0, 4),
    flags,
    signals,
    rulesFired,
    metadata: { ...metadata, ...activityAnalysis.metadata, ...entityAnalysis.metadata }
  };
}
