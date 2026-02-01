/**
 * Entity Scanner Service
 * Extracts and validates official Indian business identifiers (GSTIN, CIN).
 * Now includes CIN Partial Match Detection.
 */

const GST_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}/g;
const CIN_REGEX = /[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}/g;

const GST_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const STATE_CODES = ["AP", "AR", "AS", "BR", "CT", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "MP", "MH", "MN", "ML", "MZ", "NL", "OR", "PB", "RJ", "SK", "TN", "TG", "TR", "UP", "UK", "WB", "AN", "CH", "DH", "DD", "DL", "LD", "PY"];

const INDUSTRY_GROUPS = {
    "01": "Agriculture/Farming",
    "15": "Food/Beverages",
    "62": "IT/Software",
    "65": "Banking/Finance",
    "72": "R&D/Consultancy",
    "74": "Business Services",
    "80": "Education",
    "85": "Health/Social Work"
};

/**
 * Validates GSTIN Checksum
 */
function validateGSTChecksum(gstin) {
  if (!gstin || gstin.length !== 15) return false;
  
  const chars = gstin.toUpperCase().split('');
  const checksumTarget = chars[14];
  const inputChars = chars.slice(0, 14);
  
  let factor = 1;
  let sum = 0;
  
  for (let i = 0; i < inputChars.length; i++) {
    const codePoint = GST_CHARS.indexOf(inputChars[i]);
    if (codePoint === -1) return false;
    
    let product = codePoint * factor;
    sum += Math.floor(product / 36) + (product % 36);
    factor = factor === 1 ? 2 : 1;
  }
  
  const calculatedChecksum = GST_CHARS[(36 - (sum % 36)) % 36];
  return calculatedChecksum === checksumTarget;
}

/**
 * Parses CIN into components for Context Matching
 * Format: L 12345 MH 2022 PTC 123456
 */
function parseCIN(cin) {
    if (!cin || cin.length !== 21) return null;
    return {
        listing: cin[0] === 'L' ? 'Listed' : 'Unlisted',
        industryCode: cin.substring(1, 6),
        industryGroup: cin.substring(1, 3),
        state: cin.substring(6, 8),
        year: cin.substring(8, 12),
        ownership: cin.substring(12, 15),
        regNo: cin.substring(15, 21)
    };
}

/**
 * Detects discrepancies between CIN and Document Text (Partial Match Fraud)
 */
function detectPartialMatchDiscrepancies(parsedCin, text) {
    const discrepancies = [];
    const normalizedText = text.toLowerCase();

    // 1. Year Mismatch
    // If text mentions "Founded in 1995" but CIN says "2022"
    const yearsInText = text.match(/\b(19|20)\d{2}\b/g) || [];
    if (yearsInText.length > 0 && !yearsInText.includes(parsedCin.year)) {
        // Only flag if a distinct "founded" or "established" keyword is near
        if (normalizedText.includes('founded') || normalizedText.includes('established') || normalizedText.includes('doj')) {
            discrepancies.push(`Year Mismatch: Document context implies different era than CIN (${parsedCin.year})`);
        }
    }

    // 2. State Mismatch
    // Filter out state codes that don't match the CIN
    const otherStates = STATE_CODES.filter(s => s !== parsedCin.state);
    for (const s of otherStates) {
        // Check for full state name to avoid false positives with state codes in random text
        // This is a simplified check for demo
        if (normalizedText.includes(`headquarters: ${s}`) || normalizedText.includes(`office: ${s}`)) {
           discrepancies.push(`State Discrepancy: CIN belongs to ${parsedCin.state}, but document mentions ${s} office.`);
           break;
        }
    }

    // 3. Industry Mismatch
    const groupName = INDUSTRY_GROUPS[parsedCin.industryGroup];
    if (groupName === "IT/Software" && (normalizedText.includes("construction") || normalizedText.includes("spices") || normalizedText.includes("cement"))) {
        discrepancies.push(`Industry Conflict: Listed as ${groupName} but content suggests different business activity.`);
    }

    return discrepancies;
}

/**
 * Analyzes text for business entities with Intel Layer
 */
export function analyzeEntities(text) {
  if (!text) return { signals: {}, metadata: {} };

  const rawGsts = text.match(GST_REGEX) || [];
  const rawCins = text.match(CIN_REGEX) || [];

  const detectedEntities = [];
  let invalidBusinessIdCount = 0;
  let partialMatchAnomalyCount = 0;
  const entityDiscrepancies = [];

  // Process GSTs
  rawGsts.forEach(gst => {
    const isValid = validateGSTChecksum(gst);
    if (!isValid) invalidBusinessIdCount++;
    
    detectedEntities.push({
        type: 'GSTIN',
        value: gst,
        isValid: isValid,
        label: isValid ? 'Valid GSTIN' : 'Invalid GSTIN (Checksum Failed)'
    });
  });

  // Process CINs with Partial Match Intelligence
  rawCins.forEach(cin => {
    const parsed = parseCIN(cin);
    const discrepancies = parsed ? detectPartialMatchDiscrepancies(parsed, text) : [];
    
    const isStructurallyValid = parsed && STATE_CODES.includes(parsed.state) && parseInt(parsed.year) > 1850 && parseInt(parsed.year) <= new Date().getFullYear();
    
    if (!isStructurallyValid) {
        invalidBusinessIdCount++;
    }

    if (discrepancies.length > 0) {
        partialMatchAnomalyCount++;
        entityDiscrepancies.push(...discrepancies);
    }

    detectedEntities.push({
        type: 'CIN',
        value: cin,
        isValid: isStructurallyValid && discrepancies.length === 0,
        parsed,
        discrepancies,
        label: discrepancies.length > 0 ? 'CIN Partial Match Discrepancy' : (isStructurallyValid ? 'Valid CIN Structure' : 'Invalid CIN Structure')
    });
  });

  const signals = {
    hasGst: rawGsts.length > 0 ? 1 : 0,
    hasCin: rawCins.length > 0 ? 1 : 0,
    invalidBusinessId: invalidBusinessIdCount > 0 ? 1 : 0,
    businessContextMismatch: partialMatchAnomalyCount > 0 ? 1 : 0
  };

  return {
    signals,
    metadata: {
      entityCount: detectedEntities.length,
      detectedEntities,
      entityDiscrepancies
    }
  };
}
