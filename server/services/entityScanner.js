/**
 * Entity Scanner Service
 * Extracts and validates official Indian business identifiers (GSTIN, CIN).
 */

const GST_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}/g;
const CIN_REGEX = /[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}/g;

const GST_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Validates GSTIN Checksum
 * GSTIN Format: 15 chars
 * [0-1] State Code
 * [2-11] PAN (5 chars + 4 digits + 1 char)
 * [12] Entity Number
 * [13] Z (Default)
 * [14] Checksum Digit
 */
function validateGSTChecksum(gstin) {
  if (!gstin || gstin.length !== 15) return false;
  
  const chars = gstin.toUpperCase().split('');
  const checksumTarget = chars[14];
  const inputChars = chars.slice(0, 14);
  
  let factor = 1;
  let sum = 0;
  let checkCodePoint = 0;
  
  for (let i = 0; i < inputChars.length; i++) {
    const codePoint = GST_CHARS.indexOf(inputChars[i]);
    if (codePoint === -1) return false; // Invalid char
    
    let product = codePoint * factor;
    let quotient = Math.floor(product / 36);
    let remainder = product % 36;
    
    sum += quotient + remainder;
    
    // Toggle factor between 1 and 2
    factor = factor === 1 ? 2 : 1;
  }
  
  checkCodePoint = (36 - (sum % 36)) % 36;
  const calculatedChecksum = GST_CHARS[checkCodePoint];
  
  return calculatedChecksum === checksumTarget;
}

/**
 * Validates a GSTIN based on basic structural rules
 */
function validateGST(gst) {
  if (!gst) return false;
  // Regex check is already done by extractor, now do checksum
  return validateGSTChecksum(gst);
}

/**
 * Analyzes text for business entities
 */
export function analyzeEntities(text) {
  if (!text) return { signals: {}, metadata: {} };

  const rawGsts = text.match(GST_REGEX) || [];
  const rawCins = text.match(CIN_REGEX) || [];

  const detectedEntities = [];
  let invalidBusinessIdCount = 0;

  // Process GSTs
  rawGsts.forEach(gst => {
    const isValid = validateGST(gst);
    if (!isValid) {
        invalidBusinessIdCount++;
        console.log(`❌ Invalid GSTIN Checksum: ${gst}`);
    }
    
    detectedEntities.push({
        type: 'GSTIN',
        value: gst,
        isValid: isValid, // Now correctly reflects checksum
        portalUrl: `https://services.gst.gov.in/services/searchtp?gstin=${gst}`,
        label: isValid ? 'Valid GSTIN' : 'Invalid GSTIN (Checksum Failed)'
    });
  });

  // Process CINs (No checksum available publically efficiently, trust regex)
  rawCins.forEach(cin => {
    detectedEntities.push({
        type: 'CIN',
        value: cin,
        isValid: true, 
        portalUrl: `https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do`,
        label: 'MCA Registered Company'
    });
  });

  const signals = {
    hasGst: rawGsts.length > 0 ? 1 : 0,
    hasCin: rawCins.length > 0 ? 1 : 0,
    invalidBusinessId: invalidBusinessIdCount > 0 ? 1 : 0
  };

  return {
    signals,
    metadata: {
      entityCount: detectedEntities.length,
      detectedEntities
    }
  };
}
