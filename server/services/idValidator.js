/**
 * ID Validator Service
 * Mathematical and Structural validation for Indian Identity Documents
 */

// --- Verhoeff Algorithm Tables ---
const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates Aadhaar number using Verhoeff Algorithm
 */
export function validateAadhaar(aadhaarString) {
    if (!aadhaarString || typeof aadhaarString !== 'string') return false;
    
    // Clean input: remove spaces/hyphens
    const cleanAadhaar = aadhaarString.replace(/[\s-]/g, '');
    
    // Aadhaar must be exactly 12 digits
    if (!/^\d{12}$/.test(cleanAadhaar)) return false;
    
    // Verhoeff Check
    let c = 0;
    const digits = cleanAadhaar.split('').map(Number).reverse();
    
    for (let i = 0; i < digits.length; i++) {
        c = d[c][p[i % 8][digits[i]]];
    }
    
    return c === 0;
}

/**
 * Validates PAN structure
 */
export function validatePAN(panString) {
    if (!panString || typeof panString !== 'string') return false;
    
    const cleanPAN = panString.toUpperCase().trim();
    
    /**
     * PAN Format: [A-Z]{5}[0-9]{4}[A-Z]
     * 1-3: Three random characters
     * 4: Status (P: Person, C: Company, H: HUF, F: Firm, A: AOP, T: Trust, etc.)
     * 5: First character of Surname / Last Name
     */
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    
    if (!panRegex.test(cleanPAN)) return false;
    
    // 4th character check
    const validStatus = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
    if (!validStatus.includes(cleanPAN[3])) return false;
    
    return true;
}

/**
 * Validates UPI VPA format
 */
export function validateUPI(upiString) {
    if (!upiString || typeof upiString !== 'string') return false;
    
    // Basic structural check: identifier@bank
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiString);
}

/**
 * Scans text and extracts all IDs, validating each
 * Returns true if ANY invalid ID structure is found
 */
export function detectStructuralAnomalies(text) {
    if (!text) return false;
    
    // 1. Aadhaar Patterns (Groups of 4 digits, or 12 digits)
    const aadhaarMatches = text.match(/\b\d{4}[\s-]\d{4}[\s-]\d{4}\b|\b\d{12}\b/g) || [];
    for (const match of aadhaarMatches) {
        if (!validateAadhaar(match)) return true; // Found invalid Aadhaar
    }
    
    // 2. PAN Patterns (ABCDE1234F)
    const panMatches = text.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi) || [];
    for (const match of panMatches) {
        if (!validatePAN(match)) return true; // Found invalid PAN
    }
    
    return false;
}
