/**
 * Recommendation Engine for TrustScan
 * Maps fraud signals to actionable steps for the user.
 */

export function getRecommendedActions(signals, status) {
    const actions = [];
    let idCounter = 1;

    // Default actions for Safe documents
    if (status === 'safe') {
        return [
            {
                id: 1,
                title: 'No immediate threat detected',
                description: 'Our filters did not find common fraud patterns in this content.',
                priority: 'recommended',
                completed: false
            },
            {
                id: 2,
                title: 'Stay vigilant',
                description: 'Always be cautious when sharing personal information, even with seemingly safe documents.',
                priority: 'recommended',
                completed: false
            }
        ];
    }

    // --- 1. Financial / Banking Fraud ---
    if (signals.financial || signals.urgency > 1) {
        actions.push({
            id: idCounter++,
            title: 'Contact your bank immediately',
            description: 'If you have shared any details or made a payment, call your bank to freeze your accounts.',
            priority: 'critical',
            completed: false
        });
        actions.push({
            id: idCounter++,
            title: 'Report to Cybercrime (1930)',
            description: 'Call the National Cybercrime Helpline 1930 or report online at cybercrime.gov.in.',
            priority: 'critical',
            completed: false
        });
    }

    // --- 1b. Malware / Tech Support / Remote Access ---
    if (signals.techSupport) {
        actions.push({
            id: idCounter++,
            title: 'Scan your device for malware',
            description: 'Run a full scan using a trusted antivirus software to detect potential trojans or spyware.',
            priority: 'critical',
            completed: false
        });
        actions.push({
            id: idCounter++,
            title: 'Do not install remote access apps',
            description: 'Never install apps like AnyDesk or TeamViewer at the request of an unverified caller/message.',
            priority: 'critical',
            completed: false
        });
    }

    // --- 1c. Phishing / Suspicious Links ---
    if (signals.links || signals.suspiciousTld || signals.typosquatting || signals.shortenerObfuscation || signals.ipHost) {
        if (signals.typosquatting) {
            actions.push({
                id: idCounter++,
                title: 'Check for typosquatting',
                description: 'The link looks like a familiar brand but has subtle character differences. Type the official URL manually instead.',
                priority: 'critical',
                completed: false
            });
        }
        
        if (signals.shortenerObfuscation) {
            actions.push({
                id: idCounter++,
                title: 'Examine shortened links',
                description: 'URL shorteners (like bit.ly) hide the final destination. Use a "URL expander" tool to see the real address before clicking.',
                priority: 'important',
                completed: false
            });
        }

        if (signals.ipHost) {
            actions.push({
                id: idCounter++,
                title: 'Beware of IP-based links',
                description: 'Legitimate services use registered domain names. A link using a direct IP address is a high-risk red flag.',
                priority: 'critical',
                completed: false
            });
        }

        actions.push({
            id: idCounter++,
            title: 'Do not click the links',
            description: 'Phishing links are designed to steal your credentials. Clear your browser cache if you clicked any.',
            priority: 'critical',
            completed: false
        });
    }

    // --- 2. AI-Generated / Edited Content ---
    if (signals.softwareMetadata || signals.genericSuccessMsg || signals.metadataAnomalies) {
        actions.push({
            id: idCounter++,
            title: 'Verify with issuing authority',
            description: 'This document shows signs of digital manipulation or AI generation. Verify its authenticity with the source.',
            priority: 'critical',
            completed: false
        });
        actions.push({
            id: idCounter++,
            title: 'Check for visual inconsistencies',
            description: 'Look for blurring around text, font mismatches, or irregular alignment which are common in fakes.',
            priority: 'important',
            completed: false
        });
    }

    // --- 3. Job / Recruitment Scams ---
    if (signals.jobScam || signals.registrationFee || signals.jobContext) {
        // PREVENTATIVE WARNING (User Report: "They ask for money later during orientation")
        actions.push({
            id: idCounter++,
            title: '⚠️ Watch for Hidden Fees',
            description: 'Even if this letter is free, scam companies often ask for "Server/Hosting Fees" or "Security Deposits" during orientation. Never pay to work.',
            priority: 'critical', // Always critical for students
            completed: false
        });

        if (signals.jobScam || signals.registrationFee) {
            actions.push({
                id: idCounter++,
                title: 'Verify company on MCA Portal',
                description: 'Check if the company is legally registered on the Ministry of Corporate Affairs (MCA) website.',
                priority: 'important',
                completed: false
            });
            actions.push({
                id: idCounter++,
                title: 'Research reviews on Glassdoor',
                description: 'Check platforms like Glassdoor or AmbitionBox for reviews from other candidates or employees.',
                priority: 'important',
                completed: false
            });
        }
    }

    // --- 4. Identity / Personal Data Risks ---
    if (signals.personalData || signals.structuralAnomalies || signals.impersonation) {
        actions.push({
            id: idCounter++,
            title: 'Do not share personal ID photos',
            description: 'Avoid sharing full photos of Aadhaar, PAN, or Passport with unverified individuals.',
            priority: 'critical',
            completed: false
        });
        actions.push({
            id: idCounter++,
            title: 'Use Masked Aadhaar',
            description: 'If identity proof is required, provide a masked Aadhaar where only the last 4 digits are visible.',
            priority: 'important',
            completed: false
        });
    }

    // --- 5. Mandatory High-Risk Action ---
    if (status === 'fraud' || status === 'scam') {
        actions.push({
            id: idCounter++,
            title: 'Halt all interactions',
            description: 'Cease communication with the sender and do not share any further information or payments.',
            priority: 'critical',
            completed: false
        });
    }

    // --- 5. Generic Fallback for Suspicious ---
    if (actions.length === 0 && status === 'suspicious') {
        actions.push({
            id: idCounter++,
            title: 'Verify sender identity',
            description: 'Contact the person or organization through an official, independent channel before proceeding.',
            priority: 'critical',
            completed: false
        });
    }

    // Add general education action if room
    if (actions.length < 5) {
        actions.push({
            id: idCounter++,
            title: 'Educate yourself about scams',
            description: 'Read our comprehensive guide on identifying common fraud tactics used in India.',
            priority: 'recommended',
            completed: false
        });
    }

    return actions.slice(0, 5); // Limit to top 5 actions
}
