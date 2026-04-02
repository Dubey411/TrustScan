import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isNativeThreatEngineAvailable, scanThreatSignaturesNative } from './cppThreatEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHRASES = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'risk_weighted_phrases.json'), 'utf8')
);

const PHASE_CONFIG = {
    fear_triggers: { phase: 'Fear Trigger', flowStage: 'fear' },
    authority_impersonation: { phase: 'Authority Impersonation', flowStage: 'authority' },
    urgency_escalation: { phase: 'Urgency Escalation', flowStage: 'urgency' },
    action_requests: { phase: 'Action Request', flowStage: 'action' },
    recruitment_scams: { phase: 'Recruitment Hook', flowStage: 'action' },
    domestic_emergencies: { phase: 'Domestic Emergency', flowStage: 'fear' },
    upi_scam_patterns: { phase: 'UPI Fraud Pattern', flowStage: 'action' }
};

const NATIVE_THREAT_MIN_TEXT_LENGTH = 120;

function applyMatch(categoryKey, phrase, weight, matches, flowStages) {
    const config = PHASE_CONFIG[categoryKey];
    if (!config) return weight;

    matches.push({ phase: config.phase, match: phrase });
    if (config.flowStage) {
        flowStages[config.flowStage] = true;
    }

    return weight;
}

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

    const nativeThreatResult = normalized.length >= NATIVE_THREAT_MIN_TEXT_LENGTH && isNativeThreatEngineAvailable()
        ? scanThreatSignaturesNative(normalized)
        : null;

    if (nativeThreatResult) {
        nativeThreatResult.matches.forEach(({ category, phrase, weight }) => {
            score += applyMatch(category, phrase, weight, matches, flowStages);
        });
    } else {
        // 1. Evaluate Categories
        Object.entries(PHRASES.fear_triggers).forEach(([phrase, weight]) => {
            if (normalized.includes(phrase)) {
                score += applyMatch('fear_triggers', phrase, weight, matches, flowStages);
            }
        });

        Object.entries(PHRASES.authority_impersonation).forEach(([phrase, weight]) => {
            if (normalized.includes(phrase)) {
                score += applyMatch('authority_impersonation', phrase, weight, matches, flowStages);
            }
        });

        Object.entries(PHRASES.urgency_escalation).forEach(([phrase, weight]) => {
            if (normalized.includes(phrase)) {
                score += applyMatch('urgency_escalation', phrase, weight, matches, flowStages);
            }
        });

        Object.entries(PHRASES.action_requests).forEach(([phrase, weight]) => {
            if (normalized.includes(phrase)) {
                score += applyMatch('action_requests', phrase, weight, matches, flowStages);
            }
        });

        if (PHRASES.recruitment_scams) {
            Object.entries(PHRASES.recruitment_scams).forEach(([phrase, weight]) => {
                if (normalized.includes(phrase)) {
                    score += applyMatch('recruitment_scams', phrase, weight, matches, flowStages);
                }
            });
        }

        if (PHRASES.domestic_emergencies) {
            Object.entries(PHRASES.domestic_emergencies).forEach(([phrase, weight]) => {
                if (normalized.includes(phrase)) {
                    score += applyMatch('domestic_emergencies', phrase, weight, matches, flowStages);
                }
            });
        }

        if (PHRASES.upi_scam_patterns) {
            Object.entries(PHRASES.upi_scam_patterns).forEach(([phrase, weight]) => {
                if (normalized.includes(phrase)) {
                    score += applyMatch('upi_scam_patterns', phrase, weight, matches, flowStages);
                }
            });
        }
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
