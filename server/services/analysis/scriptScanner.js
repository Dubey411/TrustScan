import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHRASES = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'risk_weighted_phrases.json'), 'utf8')
);

/**
 * Script Intelligence Layer (SIL)
 * Detects conversational patterns of specialized Indian scams.
 */
export function analyzeScamScript(text) {
    if (!text) return { riskScore: 0, matches: [], detectedFlow: [] };

    const normalized = text.toLowerCase();
    let score = 0;
    const matches = [];
    const flowStages = {
        fear: false,
        authority: false,
        urgency: false,
        action: false
    };

    // 1. Evaluate Categories
    Object.entries(PHRASES.fear_triggers).forEach(([phrase, weight]) => {
        if (normalized.includes(phrase)) {
            score += weight;
            matches.push({ phase: 'Fear Trigger', match: phrase });
            flowStages.fear = true;
        }
    });

    Object.entries(PHRASES.authority_impersonation).forEach(([phrase, weight]) => {
        if (normalized.includes(phrase)) {
            score += weight;
            matches.push({ phase: 'Authority Impersonation', match: phrase });
            flowStages.authority = true;
        }
    });

    Object.entries(PHRASES.urgency_escalation).forEach(([phrase, weight]) => {
        if (normalized.includes(phrase)) {
            score += weight;
            matches.push({ phase: 'Urgency Escalation', match: phrase });
            flowStages.urgency = true;
        }
    });

    Object.entries(PHRASES.action_requests).forEach(([phrase, weight]) => {
        if (normalized.includes(phrase)) {
            score += weight;
            matches.push({ phase: 'Action Request', match: phrase });
            flowStages.action = true;
        }
    });
    
    if (PHRASES.recruitment_scams) {
        Object.entries(PHRASES.recruitment_scams).forEach(([phrase, weight]) => {
            if (normalized.includes(phrase)) {
                score += weight;
                matches.push({ phase: 'Recruitment Hook', match: phrase });
                flowStages.action = true;
            }
        });
    }

    if (PHRASES.domestic_emergencies) {
        Object.entries(PHRASES.domestic_emergencies).forEach(([phrase, weight]) => {
            if (normalized.includes(phrase)) {
                score += weight;
                matches.push({ phase: 'Domestic Emergency', match: phrase });
                flowStages.fear = true;
            }
        });
    }

    if (PHRASES.upi_scam_patterns) {
        Object.entries(PHRASES.upi_scam_patterns).forEach(([phrase, weight]) => {
            if (normalized.includes(phrase)) {
                score += weight;
                matches.push({ phase: 'UPI Fraud Pattern', match: phrase });
                flowStages.action = true;
            }
        });
    }

    // 2. Behavioral Combo Scoring (The "Script Logic" boost)
    let comboMultiplier = 1;
    const stagesHit = Object.values(flowStages).filter(v => v).length;
    
    if (stagesHit >= 3) {
        // High confidence conversational flow detected
        comboMultiplier = 1.5;
    }
    
    // Fear + Action Request is a deadly combo
    if (flowStages.fear && flowStages.action) {
        score += 20; 
    }

    // 3. Urgency Velocity Calculation (Sentiment Slope)
    // Measures if the pressure increases specifically at the end of the document.
    let urgencyVelocity = 0;
    const words = normalized.split(/\s+/);
    if (words.length > 50) {
        const lastThirdIndex = Math.floor(words.length * 0.7);
        const firstTwoThirds = words.slice(0, lastThirdIndex).join(' ');
        const lastThird = words.slice(lastThirdIndex).join(' ');

        // Check density of urgency phrases in intro vs outro
        const urgencyPhrases = Object.keys(PHRASES.urgency_escalation);
        let introCount = 0;
        let outroCount = 0;

        urgencyPhrases.forEach(p => {
            if (firstTwoThirds.includes(p)) introCount++;
            if (lastThird.includes(p)) outroCount++;
        });

        // If the density in the final third is 2x the intro, that's high velocity (Pressure Tactic)
        if (outroCount > (introCount * 2) && outroCount > 0) {
            urgencyVelocity = 25; 
        }
    }

    const finalScore = Math.min(100, (score * comboMultiplier) + urgencyVelocity);
    
    const detectedFlow = [];
    if (flowStages.fear) detectedFlow.push("Fear Trigger");
    if (flowStages.authority) detectedFlow.push("Authority Impersonation");
    if (flowStages.urgency) detectedFlow.push("Urgency Escalation");
    if (flowStages.action) detectedFlow.push("Action Request");
    if (urgencyVelocity > 0) detectedFlow.push("Mounting Pressure Tactic");

    return {
        riskScore: finalScore,
        matches: matches.slice(0, 5),
        detectedFlow,
        urgencyVelocity,
        confidence: stagesHit >= 2 ? (stagesHit >= 3 ? "Very High" : "High") : "Low"
    };
}
