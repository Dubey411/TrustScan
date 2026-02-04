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
 * Validates US Social Security Number (SSN)
 */
export function validateSSN(ssn) {
    if (!ssn) return false;
    const cleanSSN = ssn.replace(/-/g, '');
    if (cleanSSN.length !== 9) return false;
    
    // SSN Rules: 
    // - Cannot start with 666, 000, 9xx
    // - Cannot be 00-00-0000
    if (/^000|^666|^9/.test(cleanSSN)) return false;
    if (cleanSSN.substring(3, 5) === '00' || cleanSSN.substring(5) === '0000') return false;
    
    return /^\d{3}-?\d{2}-?\d{4}$/.test(ssn);
}

/**
 * Validates International Bank Account Number (IBAN)
 */
export function validateIBAN(iban) {
    if (!iban) return false;
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    // Basic structural check: Country code (2) + Check digits (2) + BBAN (up to 30)
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z\d]{10,30}$/;
    if (!ibanRegex.test(cleanIban)) return false;
    
    // Mod-97 check
    const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
    const numeric = rearranged.split('').map(c => {
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90) ? (code - 55).toString() : c;
    }).join('');
    
    // BigInt needed for mod-97 since numeric string is very long
    try {
        const remainder = BigInt(numeric) % 97n;
        return remainder === 1n;
    } catch (e) {
        return false;
    }
}

/**
 * Validates Bitcoin/Crypto Addresses (Common in global scams)
 */
export function validateCryptoAddress(address) {
    if (!address) return false;
    // BTC (Legacy, SegWit, bech32)
    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[ac-hj-np-z02-9]{11,71})$/;
    // ETH
    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    
    return btcRegex.test(address) || ethRegex.test(address);
}

/**
 * Scans text and extracts all IDs, validating each
 * Returns true if ANY invalid ID structure is found
 */
export function detectStructuralAnomalies(text) {
    if (!text) return false;
    
    // 1. Aadhaar Patterns
    const aadhaarMatches = text.match(/\b\d{4}[\s-]\d{4}[\s-]\d{4}\b|\b\d{12}\b/g) || [];
    for (const match of aadhaarMatches) {
        if (!validateAadhaar(match)) return true;
    }
    
    // 2. PAN Patterns
    const panMatches = text.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi) || [];
    for (const match of panMatches) {
        if (!validatePAN(match)) return true;
    }

    // 3. SSN Patterns (US Context)
    const ssnMatches = text.match(/\b\d{3}-\d{2}-\d{4}\b/g) || [];
    for (const match of ssnMatches) {
        if (!validateSSN(match)) return true;
    }

    // 4. Crypto Addresses (Global Risk)
    // Often found in "Send BTC to get job" scams
    const cryptoMatches = text.match(/\b(1|3|bc1|0x)[a-zA-Z0-9]{25,71}\b/g) || [];
    for (const match of cryptoMatches) {
        if (validateCryptoAddress(match)) {
            // Mentioning a crypto address in an unsolicited offer is itself a structural anomaly for our motive
            return true; 
        }
    }
    
    return false;
}
