import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANK_DATA = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'bankHeaders.json'), 'utf8')
);

/**
 * Verified Sender Pattern Engine (VSPE)
 * Logic to detect SMS Spoofing without internal DB access.
 */

// Helper: Levenshtein Distance for typo detection
function getLevenshteinDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => 
        Array.from({ length: b.length + 1 }, (_, j) => j)
    );
    for (let i = 1; i <= a.length; i++) matrix[i][0] = i;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
}

export function analyzeSmsHeader(headerId, messageBody = "") {
    if (!headerId) return null;

    const normalizedHeader = headerId.toUpperCase().trim();
    const normalizedBody = messageBody.toLowerCase();
    
    // 1. Structural Breakdown (The TRAIL: Provider-Sender)
    // India Standard: XX-YYYYYY (6 chars for ID)
    const headerParts = normalizedHeader.split('-');
    const senderId = headerParts.length > 1 ? headerParts[1] : headerParts[0];
    
    let report = {
        header: headerId,
        senderId: senderId,
        detectedBrand: "Unknown",
        isSpoofed: false,
        riskScore: 0,
        flags: [],
        confidence: 0
    };

    // 2. Pattern Validity Checks
    if (senderId.length !== 6 && headerParts.length > 1) {
        report.flags.push("Irregular ID Length (Indian SMS standard is 6)");
        report.riskScore += 30;
    }
    
    if (/[^A-Z0-9]/.test(senderId)) {
        report.flags.push("Suspicious symbols in Header ID");
        report.riskScore += 50;
    }

    // 3. Typo & Extra Character Detection (VSPE Logic)
    let closestMatch = null;
    let minDistance = 10;

    for (const bank of BANK_DATA) {
        for (const officialId of bank.officialIds) {
            const distance = getLevenshteinDistance(senderId, officialId);
            
            // Exact match?
            if (distance === 0) {
                report.detectedBrand = bank.brand;
                report.confidence = 100;
                closestMatch = bank;
                break;
            }

            // Typo detection (Distance of 1 or 2 is VERY suspicious)
            if (distance <= 2 && distance < minDistance) {
                minDistance = distance;
                closestMatch = bank;
                report.detectedBrand = bank.brand;
            }
        }
        if (report.confidence === 100) break;
    }

    // 4. Spoof Detection Logic
    if (closestMatch && report.confidence < 100) {
        report.isSpoofed = true;
        report.flags.push(`Look-alike ID: Attempts to impersonate ${closestMatch.brand}`);
        report.riskScore += (3 - minDistance) * 35; // Dist 1 = 70 risk, Dist 2 = 35 risk
    }

    // 5. Header-Content Mismatch
    if (closestMatch) {
        // Does the body mention a DIFFERENT bank?
        const mismatchFound = closestMatch.mismatchKeywords.find(kw => normalizedBody.includes(kw));
        if (mismatchFound) {
            report.isSpoofed = true;
            report.flags.push(`Brand Mismatch: Header is ${closestMatch.brand} but body mentions ${mismatchFound.toUpperCase()}`);
            report.riskScore += 50;
        }

        // Does the body NOT mention the detected brand at all? (Low confidence)
        const brandMentioned = closestMatch.contentKeywords.some(kw => normalizedBody.includes(kw));
        if (!brandMentioned && normalizedBody.length > 20) {
            report.flags.push(`Content Mismatch: Header says ${closestMatch.brand} but message context is irrelevant`);
            report.riskScore += 20;
        }
    }
    
    // 5b. Numeric Sender vs Bank Context (The "Grey Route" Check)
    const isNumeric = /^\d+$/.test(senderId);
    const hasBankKeywords = ["bank", "a/c", "debited", "credited", "otp", "upi"].some(kw => normalizedBody.includes(kw));
    
    if (isNumeric && hasBankKeywords && senderId.length > 5) {
        report.isSpoofed = true;
        report.flags.push(`Numeric Sender: Official bank alerts MUST use Alphanumeric Headers (TRAI DLT Rule)`);
        report.riskScore = Math.max(report.riskScore, 65);
    }

    // 6. Final Risk Scoring
    report.riskScore = Math.min(100, report.riskScore);
    if (report.riskScore > 40) report.isSpoofed = true;

    return report;
}
