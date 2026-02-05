# TrustScan Hybrid Learning Architecture & Safety Guardrails

## 1. Risk Analysis: The Dangers of Unsupervised Auto-Learning
Implementing an autonomous blacklisting system based on user reports introduces specific "Failure Modes" that must be mitigated.

### Failure Modes detected:
*   **The "Competitor Raid" (Poisoning)**: A malicious actor uses bots or distinct guest accounts to mass-report a legitimate competitor's offer letter. Without guardrails, the system "learns" the competitor is a scammer.
*   **The "Startup Paradox"**: Early-stage startups often use free email domains, generic templates, or have low SEO presence (Red Flags). If they also have high hiring urgency (Urgency Signal), they mimic scam patterns purely by accident.
*   **The "Echo Chamber"**: Users often misinterpret legitimate rejection emails or rigorous selection processes as "Scams". If 5 angry candidates report a company for not hiring them, we don't want to blacklist the company.

## 2. Mandatory Guardrails (The "Safety Swiches")

To prevent false positives, the Auto-Blacklisting engine must enforce **Multi-Factor Corroboration**.

### A. Non-Negotiable Fraud Signals
A high "Risk Score" is NOT enough. To auto-ban a company, the reports must contain **Specific Intent Indicators**:
*   **Financial Demand**: The document *must* ask for money (training fee, laptop deposit, security charge).
*   **Predatory Pattern**: Explicit "Work from Home - Daily Income" syntax.
*   **Identity Theft**: Requests for full credit card/banking credentials.

**Logic Rule**: `IF (Risk > 80) AND (Contains_Financial_Demand OR Contains_Predatory_Pattern) THEN Candidate_For_Learning`

### B. User Trust Weighting
Not all votes are equal.
*   **Guest User**: 0.25 Vote (Requires 20 guests to ban).
*   **Verified Free User**: 1.0 Vote.
*   **Premium User (Long History)**: 2.0 Votes.
*   **User with High "False Report" History**: 0.0 Vote (Ignored).

### C. Time-Window Constraints (Spike vs. Accumulation)
*   **Spike (Risk of Raid)**: 50 reports in 1 hour is suspiciously artificial. **Action**: Trigger "Calm Mode" (Pause learning) + Admin Alert.
*   **Accumulation (Organic)**: 5 to 10 reports spread over 7-30 days is an organic pattern. **Action**: Valid for Auto-Blacklisting.

## 3. Reversibility & The "Forgiveness Path"
Auto-blacklisting must never be permanent without review. 
*   **Auto-Expiration**: Auto-learned blacklisting expires after 90 days unless re-confirmed.
*   **Appeal Path**: If a domain matches a newly Verified Trust Source (e.g. they get MCA registered), the system automatically downgrades them: `Blacklist -> Greylist`.

## 4. Proposed Safe Decision Flow (Architecture)

1.  **Signal Capture**: System detects "Suspicious Entity" (Unknown Name + High Risk).
2.  **Filter Stage (The Guardrail)**:
    *   Does the scan contain `PAYMENT_REQUEST` or `HIDDEN_FEE` signals? 
    *   **YES**: Proceed.
    *   **NO**: Stop. Record as "Noise".
3.  **Voter Verification**:
    *   Calculate `VotePower = UserTrustScore * 1`.
4.  **Threshold Check**:
    *   Accumulated `VotePower` > 5.0?
5.  **Sanity Check**:
    *   Is the target name a "Stop Word" (e.g. "Private Limited", "HR Department")?
    *   Is the target domain a "Major Whitelist" (gmail.com, linkedin.com)?
6.  **Action**:
    *   **Promote to Blacklist**.
    *   **Tag**: `type: "Auto-Detected (Financial Fraud Pattern)"`.
    *   **Notify**: Log to Admin Dashboard.

## 5. Implementation Plan
We will update `entityLearner.js` to strictly enforce **Signal Corroboration**. It will no longer blacklist based on name matches alone; it will require the presence of specific 'reasons' (Hidden Fee, Pay-to-Work) in the source scans.
