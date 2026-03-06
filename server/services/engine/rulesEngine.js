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
    fuzzyNormalizedText: rawText.toLowerCase().replace(/[^a-z0-9]/g, ''),
    phones
  };
}

/**
 * Core Decision Engine
 * @param {string} content - Text to analyze
 * @param {object} externalSignals - Signals from OCR/Vision layers
 * @param {object} trustSignals - Whitelist/Internal trust signals
 * @param {string} senderId - Optional SMS Header ID (Indian standard)
 * @param {number} analysisLayer - 1 (Basic), 2 (Standard), 3 (Deep)
 */
export async function runRules(content, externalSignals = {}, trustSignals = {}, senderId = null, analysisLayer = 1) {
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
  
  // Trust signals will be calculated after entity analysis
  let matchedFamousOrg = null;
  let isVerifiedEntity = false;
  let hasVerifiableIdentity = false;
  
  // -- Gibberish / Low Info Detection --
  const cleanContent = content.trim();
  if (cleanContent.length > 0) {
      const hasSpaces = cleanContent.includes(' ');
      const vowelCount = (cleanContent.match(/[aeiouy]/gi) || []).length;
      const consonantCount = (cleanContent.match(/[bcdfghjklmnpqrstvwxz]/gi) || []).length;
      const vowelRatio = vowelCount / (vowelCount + consonantCount || 1);
      
      const isKeyboardMash = (cleanContent.length > 15 && vowelRatio < 0.1) || 
                             /(.)\1{4,}/.test(cleanContent);
      
      const looksLikeNoise = cleanContent.length > 20 && !hasSpaces && vowelRatio < 0.15;
      
      if ((isKeyboardMash || looksLikeNoise) && !isVerifiedEntity && !matchedFamousOrg) {
          signals.lowInfoContent = 1;
      }
  }

  // --- MISSION: NATURE OF LANGUAGE & BEHAVIORAL SIGNALS ---
  const scriptAnalysis = analyzeScamScript(content);
  const activityAnalysis = await analyzeLinks(content, analysisLayer);
  
  // --- MISSION: HARD IDENTIFICATION (CIN, Aadhaar, PAN, GST) ---
  const entityAnalysis = await analyzeEntities(content, analysisLayer);
  const smsAnalysis = senderId ? analyzeSmsHeader(senderId, content) : null;
  const hasStructuralAnomaly = detectStructuralAnomalies(content);

  // --- MISSION: IDENTITY-BASED TRUST (Moving away from hardcoded name lists) ---
  const detectedCins = entityAnalysis.metadata?.detectedEntities?.filter(e => e.type === 'CIN' && e.isValid) || [];
  const detectedGsts = entityAnalysis.metadata?.detectedEntities?.filter(e => e.type === 'GSTIN' && e.isValid) || [];
  
  hasVerifiableIdentity = (detectedCins.length > 0 || detectedGsts.length > 0);
  isVerifiedEntity = entityAnalysis.metadata?.detectedEntities?.some(e => e.enrichment && e.enrichment.source !== 'CIN_DECODE');
  
  const famousOrgMatch = /(edunet|ibm|aicte|skill india|nptel|coursera|udemy|larsen & toubro|l&t|tata|tcs|infosys|wipro|hcl|reliance|accenture|capgemini|google|microsoft|amazon)/i.exec(content);
  matchedFamousOrg = famousOrgMatch ? famousOrgMatch[0] : null;
  
  if (isVerifiedEntity || matchedFamousOrg) {
      signals.trustedOrg = 1;
  }

  // Initialize Signals Vector
  signals = { 
      ...signals, 
      ...activityAnalysis.signals, 
      ...entityAnalysis.signals,
      smsSpoofRisk: smsAnalysis?.isSpoofed ? 1 : 0,
      scamFlowDetected: scriptAnalysis?.riskScore > 50 ? 1 : 0,
      structuralAnomalies: hasStructuralAnomaly ? 1 : 0,
      knownScamSource: 0,
      emergingRiskSource: 0,
      suspiciousAge: activityAnalysis.signals.suspiciousAge || 0
  };

  // --- MISSION: ENTITY RECOGNITION (RED/GREY LISTS & TRUST CASCADE) ---
  try {
      const lowerContent = content.toLowerCase();
      const fuzzyContent = lowerContent.replace(/[^a-z0-9]/g, '');
      const phones = metadata.phones || [];
      
      // Fetch all entities to check both names AND associated identifiers (Trust Cascade)
      const allEntities = await TrustEntity.find({}).lean();
      
      // 1. Check for Name Matches (Red Flag)
      const redHit = allEntities.find(b => {
          if (b.category !== 'red_flag') return false;
          const entityName = b.nameLower;
          const fuzzyEntity = entityName.replace(/[^a-z0-9]/g, '');
          
          if (fuzzyEntity.length < 10) {
              const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              return new RegExp(`\\b${escaped}\\b`, 'i').test(lowerContent);
          }
          return fuzzyContent.includes(fuzzyEntity);
      });

      // 2. Trust Cascade: Check for Identifier Matches (Phones/URLs)
      // This catches scammers even if they change the company name.
      const cascadeHit = allEntities.find(e => {
          return e.associatedIdentifiers?.some(id => {
              const cleanId = id.replace(/[^a-z0-9]/g, '');
              // Check if any extracted phone or URL matches a known scam identifier
              return phones.some(p => p.includes(cleanId)) || lowerContent.includes(cleanId);
          });
      });

      const databaseHits = [];

      if (redHit || cascadeHit) {
          const hit = redHit || cascadeHit;
          signals.knownScamSource = 1;
          reasons.push(`TRUST CASCADE: Associated with ${hit.name} via shared credentials (phone/infrastructure)`);
          databaseHits.push({
              name: hit.name,
              category: 'red_flag',
              type: hit.type || 'Documented Scam',
              addedAt: hit.addedAt
          });
      }

      // 3. Grey List Check
      const greyHit = allEntities.find(g => {
          if (g.category !== 'grey_list') return false;
          const entityName = g.nameLower;
          const fuzzyEntity = entityName.replace(/[^a-z0-9]/g, '');
          
          if (fuzzyEntity.length < 10) {
              const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              return new RegExp(`\\b${escaped}\\b`, 'i').test(lowerContent);
          }
          return fuzzyContent.includes(fuzzyEntity);
      });

      if (greyHit) {
          signals.emergingRiskSource = 1;
          reasons.push(`NETWORK ALERT: "${greyHit.name}" is on our active verification list`);
          databaseHits.push({
              name: greyHit.name,
              category: 'grey_list',
              type: greyHit.type || 'Suspicious Behavioral Patterns',
              addedAt: greyHit.addedAt
          });
      }

      // Return metadata include database hits
      metadata.databaseHits = databaseHits;

  } catch (e) {
      console.error("RulesEngine: Trust DB Check failed", e);
  }

  // --- INTEGRATED MISSION VERDICT (Evidence First) ---
  let indiaConfidenceRisk = 0;

  // 1. Evidence: Visual Paradox (OCR Variance)
  if (externalSignals.ocrConfidenceParadox) {
      indiaConfidenceRisk = Math.max(indiaConfidenceRisk, 75);
      reasons.push("Visual Paradox: Significant variance in text clarity detected (Standard Body vs Variable Zone). Possible digital manipulation/collage.");
  }

  // 1b. Evidence: Technical Anomalies (Software/Creation)
  if (externalSignals.softwareMetadata && !signals.trustedDomain) {
      reasons.push("Authentication Alert: Document metadata indicates creation via consumer design tools (e.g. Canva/Photoshop) rather than official ERP systems.");
  }

  // 1c. Evidence: Temporal Paradox (Old Entity vs Throwaway or Young Infrastructure)
  const mainCin = entityAnalysis.metadata?.detectedEntities?.find(e => e.type === 'CIN' && e.parsed);
  if (mainCin && mainCin.parsed.year < (new Date().getFullYear() - 5)) {
      const isThrowawayDomain = /(vercel\.app|github\.io|netlify\.app|pages\.dev|web\.app|firebaseapp\.com|form\.jotform|xyz|online|site|top|shop|info|vip|club)/i.test(content);
      if (isThrowawayDomain || signals.suspiciousAge || signals.suspiciousTld) {
          indiaConfidenceRisk = Math.max(indiaConfidenceRisk, 85);
          const ageReason = signals.suspiciousAge ? "Domain is less than 1 year old" : (signals.suspiciousTld ? "Using a suspicious TLD" : "Using throwaway/instant infrastructure");
          reasons.push(`Temporal Paradox: Entity registered in ${mainCin.parsed.year} but ${ageReason} detected for official business.`);
      }
  }

  // 2. Evidence: Nature of Language (Urgency Velocity)
  if (scriptAnalysis.riskScore > 40) {
      indiaConfidenceRisk = Math.max(indiaConfidenceRisk, scriptAnalysis.riskScore);
      if (scriptAnalysis.urgencyVelocity > 0) {
          reasons.push("Behavioral Signal: High 'Urgency Velocity' (Psychological pressure mounting towards the end of document).");
      }
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
      reasons.unshift(`Intelligence Layer: Hosted on ${platform}${desc}.`);
  }

  // --- ANALYSIS PERFORMANCE METRIC ---
  const layerNames = { 1: "Basic", 2: "Standard", 3: "Deep" };
  console.log(`🚀 [Inference] Depth: ${layerNames[analysisLayer] || 'Unknown'} (L${analysisLayer})`);

  const normalizedText = metadata.normalizedText;

  // 1. EXECUTE RULES (Feature Engineering)
  const checkRuleCondition = (condition, text, fuzzyText) => {
    if (condition.hasKeywordsAny) {
      return condition.hasKeywordsAny.some(kw => {
        const lowerKw = kw.toLowerCase();
        // 1. Strict Word Boundary Check (Primary)
        const escaped = lowerKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boundaryRegex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (boundaryRegex.test(text)) return true;

        // 2. Fuzzy/Fragment Check (Secondary - only for longer or complex terms)
        if (lowerKw.length > 5) {
            const fuzzyKw = lowerKw.replace(/[^a-z0-9]/g, '');
            if (fuzzyKw.length > 0 && fuzzyText.includes(fuzzyKw)) return true;
        }
        
        return false;
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

  // --- 4. ADVERSARIAL DEBATE SYSTEM (Prosecution vs Defense) ---
  let prosecutionScore = 0;
  const prosecutionEvidence = [...reasons];
  
  if (signals.urgency) prosecutionScore += 30;
  if (signals.financial) prosecutionScore += 40;
  if (signals.jobScam) prosecutionScore += 25;
  if (signals.impersonation) prosecutionScore += 35;
  if (signals.missingCriticalFields) prosecutionScore += 20;
  if (scriptAnalysis.riskScore > 50) prosecutionScore += 15;
  
  if (signals.knownScamSource) prosecutionScore += 85; 
  if (signals.knownScamLink) prosecutionScore += 90;
  if (signals.structuralAnomalies) prosecutionScore += 50;
  
  let defenseScore = 0;
  const defenseEvidence = [];
  
  if (signals.trustedDomain) {
      defenseScore += 100; 
      defenseEvidence.push("Identity Verified: Originates from a verified corporate domain, confirming sender authenticity.");
  } else if (isVerifiedEntity) {
      defenseScore += 80;
      const source = entityAnalysis.metadata.detectedEntities.find(e => e.enrichment)?.enrichment?.source || "Official Registry";
      defenseEvidence.push(`Identity Verified: Entity confirmed via ${source}. Positive registration record found.`);
  } else if (matchedFamousOrg) {
      defenseScore += 60;
      defenseEvidence.push(`Reputation Check: Document mentions a known legitimate organization (${matchedFamousOrg}).`);
  } else if (hasVerifiableIdentity) {
      defenseScore += 40;
      defenseEvidence.push("Identity Provided: Document includes structurally valid business registration IDs (CIN/GST).");
  } else if (trustSignals.officialDomain) {
      defenseScore += 50;
      defenseEvidence.push("Source Credibility: Sender uses an official business domain implies accountability.");
  }

  const hasLegalClauses = /(confidentiality|non-disclosure|termination clause|jurisdiction|intellectual property|code of conduct)/i.test(content);
  if (hasLegalClauses) {
      defenseScore += 25;
      defenseEvidence.push("Professional Depth: Contains official legal or confidentiality clauses.");
  }

  const hasDetailedOps = /(performance review|probation period|leave policy|intellectual property|indemnity|governing law|code of conduct|benefits|gratuity|provident fund|working hours|joining date|notice period|bonus structure)/i.test(content);
  if (hasDetailedOps) {
      defenseScore += 35;
      defenseEvidence.push("Professional Depth: Contains detailed clauses regarding operations, benefits, and legalities consistent with genuine institutions.");
  }

  if (trustSignals.standardStructure || metadata.textLength > 500) {
      defenseScore += 15;
      defenseEvidence.push("Document Consistency: Structure, length, and formatting align with professional business correspondence norms.");
  }

  // --- DYNAMIC ENTITY ASSOCIATION (The "New Threat" Detector) ---
  // Heuristic: If risk from other rules is already EXTREME (>85%) AND there's no defense, 
  // identify the unknown entity as a potential emerging threat.
  if (maxImpliedRisk >= 85 && !signals.knownScamSource && !hasTrustedOrg && defenseScore < 40) {
      // Heuristic to find the Org Name if not already known
      // Look for: "Welcome to [Name]", "Team [Name]", "Offer from [Name]"
      const contextRegex = /(?:welcome to|team|hr|joining|offer from|career at)\s+([A-Z][a-zA-Z0-9\s\.]{3,25})\b/i;
      const match = content.match(contextRegex);
      
      if (match && match[1]) {
          const potentialName = match[1].trim();
          // Filter out generic words
          const isGeneric = /^(the|your|our|all|india|private|limited|team|management)$/i.test(potentialName);
          
          if (!isGeneric && potentialName.length > 3) {
             reasons.push(`Suspicious Entity Association: Extremely high-risk indicators detected around unverified entity "${potentialName}".`);
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
  
  // Scoring aggregation complete. Ready for dynamic association check.
  
  // --- 4. EXONERATION SYSTEM (Trusted & Verified Entities) ---
  // If we have a verified identity AND NO red/grey list flags, we offer full mitigation.
  const isVerified = (isVerifiedEntity || matchedFamousOrg);
  const hasNetworkWarnings = (signals.knownScamSource || signals.emergingRiskSource);
  const isExonerated = isVerified && !hasNetworkWarnings;
  const exonerationTarget = matchedFamousOrg || "Verified Business Entity";
  
  if (isExonerated) {
      // If there's a financial demand, we still keep a moderate floor.
      if (signals.financial > 0 || signals.jobScam > 0) {
          defenseScore += 40; // Significant defense boost
          defenseEvidence.push(`Exoneration (Partial): ${exonerationTarget} verified but requests for money (Fees/Security) detected. Verified businesses rarely ask for money.`);
      } else {
          defenseScore += 100; // Full acquittal
          defenseEvidence.push(`Exoneration: ${exonerationTarget} verified. Identity trust established.`);
      }
  } else if (isVerified && signals.emergingRiskSource) {
      // "Verified but Grey" - Handles companies like Bluestock (Registered but predatory/paid)
      defenseScore += 30; // Minor defense because we know who they are
      defenseEvidence.push("Verification Note: Entity is registered but has active reports of 'Pay-to-Work' or predatory recruitment models.");
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

  // --- ANOMALY MODE: High Confidence Conflict Resolution ---
  if (prosecutionScore > 75 && defenseScore > 75) {
      finalRiskCalculation = Math.max(90, finalRiskCalculation); 
      reasons.unshift("ANOMALY DETECTED: Found authoritative identity alongside extreme risk signals. High-sophistication impersonation suspected.");
      defenseEvidence.push("Anomaly Alert: Legitimacy signals are high, but criminal patterns are present. Manual verification required.");
  }
  // --- FINANCIAL FLOOR: Verified brands asking for money ---
  else if (signals.financial > 0) {
      const mitigation = Math.min(defenseScore * 0.4, 30); // Max 30% reduction for verified entities
      finalRiskCalculation = Math.max(70, finalRiskCalculation - mitigation);
      
      if (isVerifiedEntity || matchedFamousOrg) {
          defenseEvidence.push(`Payment Alert: Verified entity is requesting payment. While the identity is confirmed, legitimate direct recruitment rarely involves advance fees.`);
          if (signals.emergingRiskSource) {
              reasons.push("Business Model Warning: Entity is known for 'Paid Internship' or 'Training-cum-Placement' models. Not a standard direct hire.");
          }
      } else {
          defenseEvidence.push("Financial Context Penalty: Legitimate brands do not request advance payments for recruitment or training.");
      }
  }
  // --- JOB CONTEXT FLOOR: Stay cautious about offers from unverified sources ---
  else if (signals.jobScam > 0) {
      const mitigation = Math.min(defenseScore * 0.7, 60); // More room for mitigation if trusted
      
      if (isVerifiedEntity || matchedFamousOrg) {
          // If it's a verified or famous org, allow 'Safe' status
          finalRiskCalculation = Math.max(20, finalRiskCalculation - mitigation); 
          const targetName = matchedFamousOrg || "Verified Institution";
          defenseEvidence.push(`Verified Institution (${targetName}): Legitimate offer likely. Verified safe reference detected.`);
      } else {
          finalRiskCalculation = Math.max(40, finalRiskCalculation - mitigation);
          defenseEvidence.push("Recruitment Safety Alert: Verify company registration for unverified offer letters.");
      }
  }
  // If Defense is MODERATE to STRONG, dampen the risk
  else if (defenseScore > 50 && !signals.knownScamSource && !signals.knownScamLink) {
      const suppression = (defenseScore / 100) * 40; // Max 40% reduction
      finalRiskCalculation = Math.max(0, finalRiskCalculation - suppression);
      
      // Verification identity check (Acquittal)
      if (defenseScore > 80) {
          finalRiskCalculation = Math.min(finalRiskCalculation, 10); 
          defenseEvidence.push("Defense Analysis: Identity or professional depth exceeds risk thresholds. Verification recommended.");
      }
  } else {
      // Standard mitigation - defense can reduce score but not below floor if red flags exist
      const protectionFactor = Math.min(defenseScore, 30);
      finalRiskCalculation -= protectionFactor;
      
  }

  // --- 🔥 FINAL DATABASE OVERRIDES: Human Intelligence ALWAYS takes priority ---
  // Moved outside of logic to ensure they dominate any other signals.
  if (signals.knownScamSource) {
      finalRiskCalculation = 99; // Red List Force
      reasons.unshift("CRITICAL BLACKLIST: This entity is confirmed as a fraudulent source in our database.");
  } else if (signals.emergingRiskSource) {
      finalRiskCalculation = Math.max(70, finalRiskCalculation); // Grey List Floor
      reasons.unshift("GREYLIST ALERT: Entity matches patterns of predatory recruitment consultancies.");
  }

  // Legacy catch-all for scam links
  if (signals.knownScamLink && !signals.knownScamSource && finalRiskCalculation < 85) {
      finalRiskCalculation = 95;
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

  return {
    riskScore: Math.round(Math.max(0, Math.min(100, finalRiskCalculation))),
    reasons: [...new Set(reasons)].slice(0, 4),
    flags,
    signals,
    rulesFired,
    metadata: { ...metadata, ...activityAnalysis.metadata, ...entityAnalysis.metadata }
  };
}
