import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectStructuralAnomalies } from '../analysis/idValidator.js';
import { analyzeLinks } from '../analysis/linkScanner.js';
import { analyzeEntities } from '../analysis/entityScanner.js';
import { analyzeSmsHeader } from '../analysis/smsHeaderScanner.js';
import { analyzeScamScript } from '../analysis/scriptScanner.js';
import TrustEntity from '../../models/TrustEntity.js';

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
  // Refined: Must (have protocol/www) OR (use known TLD) OR (be a modern deployment subdomain)
  const urls = rawText.match(/(?:https?:\/\/|www\.)[\w\-]+\.[a-z]{2,12}(\/.*)?|[\w\-]+\.(com|net|org|in|co|io|ly|ai|me|info|biz|site|online|top|xyz|gov|ac|edu|ru|ua|tw|cn|uk|pk|jp|de|fr|br|ca|au|us|app|dev|page|link)\b|\b[\w\-]+\.(vercel\.app|github\.io|netlify\.app|pages\.dev|web\.app|firebaseapp\.com)\b/gi) || [];
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
      const vowelCount = (cleanContent.match(/[aeiouy]/gi) || []).length;
      const consonantCount = (cleanContent.match(/[bcdfghjklmnpqrstvwxz]/gi) || []).length;
      const vowelRatio = vowelCount / (vowelCount + consonantCount || 1);
      
      // Keyboard Mashing Detection (Long strings with very few vowels or repeating chars)
      const isKeyboardMash = (cleanContent.length > 15 && vowelRatio < 0.1) || 
                             /(.)\1{4,}/.test(cleanContent); // 5+ repeating chars
      
      // A string is "not text" if it has no spaces, and is just consonant noise
      const looksLikeNoise = cleanContent.length > 20 && !hasSpaces && vowelRatio < 0.15;
      
      if (isKeyboardMash || looksLikeNoise) {
          signals.lowInfoContent = 1;
      }
  }

  // --- MISSION: NATURE OF LANGUAGE & BEHAVIORAL SIGNALS ---
  const scriptAnalysis = analyzeScamScript(content);
  const activityAnalysis = await analyzeLinks(content);
  
  // --- MISSION: HARD IDENTIFICATION (CIN, Aadhaar, PAN, GST) ---
  const entityAnalysis = await analyzeEntities(content);
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
  try {
      const lowerContent = content.toLowerCase();
      
      // Fetch potential matches from DB (using a broad search or pre-filtered names)
      // Since we can't do a perfect "contains" check for 1000s of items in one query efficiently, 
      // we'll optimize: Fetch all trust entities once into memory or cache if small.
      // Small scale (<2000 items) we can keep in a local cache refreshed every 10 mins.
      
      const allEntities = await TrustEntity.find({}).lean();
      
      const redHit = allEntities.find(b => {
          if (b.category !== 'red_flag') return false;
          const entityName = b.nameLower;
          if (entityName.length < 4) {
              return new RegExp(`\\b${entityName}\\b`, 'i').test(lowerContent);
          }
          return lowerContent.includes(entityName);
      });

      if (redHit) {
          signals.knownScamSource = 1;
          reasons.push(`DATABASE MATCH: Associated with known entity "${redHit.name}"`);
      }

      const greyHit = allEntities.find(g => {
          if (g.category !== 'grey_list') return false;
          const entityName = g.nameLower;
          if (entityName.length < 4) {
              return new RegExp(`\\b${entityName}\\b`, 'i').test(lowerContent);
          }
          return lowerContent.includes(entityName);
      });

      if (greyHit) {
          signals.emergingRiskSource = 1;
          reasons.push(`NETWORK ALERT: "${greyHit.name}" is on our active verification list`);
      }

  } catch (e) {
      console.error("RulesEngine: Trust DB Check failed", e);
  }

  // --- INTEGRATED MISSION VERDICT (Evidence First) ---
  let indiaConfidenceRisk = 0;

  // 1b. Evidence: Technical Anomalies (Software/Creation)
  if (externalSignals.softwareMetadata && !signals.trustedDomain) {
      // Only flag if not from a trusted source
      reasons.push("Authentication Alert: Document metadata indicates creation via consumer design tools (e.g. Canva/Photoshop) rather than official ERP systems.");
  }

  // 1. Evidence: Structural Faults (Invalid ID)
  if (hasStructuralAnomaly) {
      indiaConfidenceRisk = Math.max(indiaConfidenceRisk, 95);
      reasons.push("Alert: Invalid Aadhaar/PAN structure detected in content");
  }

  // 1c. Evidence: Missing Critical Official Identifiers (for Jobs)
  if ((signals.jobContext || signals.jobScam) && !externalSignals.hasCin && !externalSignals.hasGst) {
      reasons.push("Regulatory Warning: Internship/Job offer lacks mandatory corporate registration (CIN/GST) details.");
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

  // 4. Evidence: Site Technical Footprints (Curiosity Data)
  const linksWithMeta = activityAnalysis.metadata?.detectedLinks?.filter(l => l.liveMetadata && l.liveMetadata.curiosityTags);
  if (linksWithMeta && linksWithMeta.length > 0) {
      const mainLink = linksWithMeta[0].liveMetadata.curiosityTags;
      const platform = mainLink.platform || 'Unknown';
      const finds = [];
      if (mainLink.hasLoginForm) finds.push("Contains Login/Form");
      if (mainLink.contactFootprint?.length > 0) finds.push(`${mainLink.contactFootprint.length} Contact Details`);
      
      const desc = finds.length > 0 ? ` (${finds.join(', ')})` : "";
      reasons.unshift(`Live Site Analysis: Hosted on ${platform}${desc}.`);
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

  // --- DYNAMIC ENTITY ASSOCIATION (The "New Threat" Detector) ---
  // User Request: "If unique company name comes in doubt by rules, find that as suspicious"
  if (maxImpliedRisk > 75 && !signals.knownScamSource) {
      // Heuristic to find the Org Name if not already known
      // Look for: "Welcome to [Name]", "Team [Name]", "Offer from [Name]"
      const contextRegex = /(?:welcome to|team|hr|joining|offer from|career at)\s+([A-Z][a-zA-Z0-9\s\.]{3,25})\b/i;
      const match = content.match(contextRegex);
      
      if (match && match[1]) {
          const potentialName = match[1].trim();
          // Filter out generic words
          const isGeneric = /^(the|your|our|all|india|private|limited|team|management)$/i.test(potentialName);
          
          if (!isGeneric && potentialName.length > 3) {
             reasons.push(`Suspicious Entity Association: High-risk indicators detected around unverified entity "${potentialName}".`);
             signals.emergingRiskSource = 1; // Mark as emerging threat
          }
      }
  }

  // 1b. Add Business Entity Discrepancies
  if (entityAnalysis.metadata?.entityDiscrepancies && entityAnalysis.metadata.entityDiscrepancies.length > 0) {
      reasons.push(...entityAnalysis.metadata.entityDiscrepancies);
      maxImpliedRisk = Math.max(maxImpliedRisk, 80); // Strict penalty for CIN/Context mismatch
  }

  console.log(`🧠 [RulesEngine] Result: ${reasons.length} reasons, Max Implied Risk: ${maxImpliedRisk}%, Signals:`, signals);

  // --- 4. ADVERSARIAL DEBATE SYSTEM (Prosecution vs Defense) ---
  
  // A. Prosecution Case (Why it looks like Fraud)
  let prosecutionScore = 0;
  const prosecutionEvidence = [...reasons];
  
  if (signals.urgency) prosecutionScore += 30;
  if (signals.financial) prosecutionScore += 40;
  if (signals.jobScam) prosecutionScore += 25;
  if (signals.impersonation) prosecutionScore += 35;
  if (signals.missingCriticalFields) prosecutionScore += 20;
  if (scriptAnalysis.riskScore > 50) prosecutionScore += 15;
  
  // Specific Heavy Hitters
  if (signals.knownScamSource || signals.knownScamLink) prosecutionScore = 1500; // Overwhelming Guilt
  if (signals.structuralAnomalies) prosecutionScore += 50;
  
  // B. Defense Case (Legitimacy Evidence - White Box)
  let defenseScore = 0;
  const defenseEvidence = [];
  
  // 1. Identity & Verifiability
  if (signals.trustedDomain) {
      defenseScore += 100; 
      defenseEvidence.push("Identity Verified: Originates from a verified corporate domain, confirming sender authenticity.");
  } else if (trustSignals.officialDomain) {
      defenseScore += 50;
      defenseEvidence.push("Source Credibility: Sender uses an official business domain implies accountability.");
  }

  // 2. Professional & Legal Indicators
  const hasLegalClauses = /(confidentiality|non-disclosure|termination clause|jurisdiction|intellectual property|code of conduct)/i.test(content);
  if (hasLegalClauses) {
      defenseScore += 25;
      defenseEvidence.push("Professional Standards: Contains standard binding legal clauses (Confidentiality/Termination) consistent with genuine employment contracts.");
  }

  // 3. Financial Integrity (The strongest negative signal)
  if (!signals.financial && !signals.registrationFee && !signals.jobScam) {
      // We credit this slightly to distinguish from pure scams, but it's table stakes.
      defenseScore += 10;
      defenseEvidence.push("Financial Integrity: No suspicious requests for deposits, training fees, or hidden charges were detected.");
  }

  // 4. Document Consistency & Structure
  if (trustSignals.standardStructure || metadata.textLength > 500) {
      defenseScore += 15;
      defenseEvidence.push("Document Consistency: Structure, length, and formatting align with professional business correspondence norms.");
  }

  // 5. Context Awareness (Job Specific)
  if (signals.jobContext && !signals.jobScam && !signals.urgency) {
      defenseScore += 20;
      defenseEvidence.push("Offer Realism: Terms and tone reflect standard recruitment practices without artificial urgency or exaggerated claims.");
  }
  
  // C. The Court Verdict (Weighted Balancing)
  // Base ML Score (The "Gut Feeling")
  let z = modelWeights.bias || 0;
  for (const signal in signals) {
    z += (signals[signal] * (modelWeights.signals[signal] || 0));
  }
  z += (metadata.capsRatio * (modelWeights.metadata.capsRatio || 0));
  
  const probability = 1 / (1 + Math.exp(-z));
  let mlScore = probability * 100;
  
  // Apply The Defense's Reductions
  // CRITICAL: prosecutionScore must be factored in, otherwise Red Flags don't affect the score!
  let finalRiskCalculation = Math.max(mlScore, maxImpliedRisk, prosecutionScore);
  
  // If Defense is STRONG (Verified Domain), it can acquit almost anything except Known Scams
  if (defenseScore > 80 && !signals.knownScamSource && !signals.knownScamLink) {
      finalRiskCalculation = Math.min(finalRiskCalculation, 10); // Acquitted
      defenseEvidence.push("Defense Overruled Prosecution due to Verified Identity");
  } else {
      // Standard mitigation - defense can reduce score but not below floor if red flags exist
      const protectionFactor = Math.min(defenseScore, 40);
      finalRiskCalculation -= protectionFactor;
      
      // If we have critical red flags, the floor should be at least 85%
      if ((signals.knownScamSource || signals.knownScamLink) && finalRiskCalculation < 85) {
          finalRiskCalculation = 95;
      }
  }
  
  // Formatting the Debate Output
  const flags = {
    red: [...new Set(prosecutionEvidence)],
    green: defenseEvidence || [], 
    debate: {
        prosecutionPoints: prosecutionScore,
        defensePoints: defenseScore,
        prosecutionArgument: prosecutionEvidence.length > 0 ? "Evidence of Fraud found." : "No strong evidence of fraud.",
        defenseArgument: (defenseEvidence && defenseEvidence.length > 0) ? defenseEvidence.join('. ') : "No strong authentication signals found."
    }
  };

  // Add curiosity green flags if safe
  if (finalRiskCalculation < 30) {
      const proLink = activityAnalysis.metadata?.detectedLinks?.find(l => l.liveMetadata?.curiosityTags?.platform === 'Custom/Other');
      if (proLink) {
         flags.green.push("Site Authentication: Professional Custom Architecture Detected");
      }
  }

  return {
    riskScore: Math.round(Math.max(0, Math.min(100, finalRiskCalculation))),
    reasons: [...new Set(reasons)].slice(0, 4),
    flags,
    signals,
    rulesFired,
    metadata: { ...metadata, ...activityAnalysis.metadata, ...entityAnalysis.metadata }
  };
}
