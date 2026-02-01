import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHRASES = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'risk_weighted_phrases.json'), 'utf8')
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

    const finalScore = Math.min(100, score * comboMultiplier);
    
    const detectedFlow = [];
    if (flowStages.fear) detectedFlow.push("Fear Trigger");
    if (flowStages.authority) detectedFlow.push("Authority Impersonation");
    if (flowStages.urgency) detectedFlow.push("Urgency Escalation");
    if (flowStages.action) detectedFlow.push("Action Request");

    return {
        riskScore: finalScore,
        matches: matches.slice(0, 5),
        detectedFlow,
        confidence: stagesHit >= 2 ? (stagesHit >= 3 ? "Very High" : "High") : "Low"
    };
}
