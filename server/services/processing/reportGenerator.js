
export function generateTrustScanReport(riskScore, signals, metadata) {
  // 1. Determine Recommendation
  let recommendation = "SAFE TO OPEN";
  let color = "green";
  
  if (riskScore >= 70) {
      recommendation = "DO NOT OPEN";
      color = "red";
  } else if (riskScore >= 40) {
      recommendation = "OPEN WITH CAUTION";
      color = "yellow";
  }

  // 1.1 Special overrides based on Identity (RED/GREY)
  if (signals.knownScamSource) {
      recommendation = "BLACKLISTED";
      color = "red";
  } else if (signals.emergingRiskSource) {
      recommendation = "GREYLISTED";
      color = "yellow";
  }

  // 2. Generate "Why" (No Jargon - Focus on User Value)
  const reasons = [];
  
  // High Priority / Critical / Greylist-Blacklist Logic
  if (signals.knownScamSource) {
      reasons.push("This entity is a confirmed fraud. Certificates issued by this source are NOT credible for your future.");
  }
  if (signals.emergingRiskSource) {
      reasons.push("This entity is flagged for charging 'Training Fees' or asking money for internship completion.");
  }
  
  // Identity and Verification
  if ((signals.jobContext || signals.jobScam) && !metadata.hasCin && !metadata.hasGst) {
      reasons.push("Critical ID Missing: No valid CIN or GSTIN found. Use 'Company Verifier' to check if this entity exists in MCA records.");
  }
  if (signals.invalidBusinessId) {
      reasons.push("Identification Alert: The provided CIN/GSTID does not match official government records.");
  }

  // Link & Communication Deception
  if (signals.knownScamLink) reasons.push("This specific link is a known scam reported by the community.");
  if (signals.ipHost) reasons.push("It uses a raw number instead of a real website name.");
  if (signals.typosquatting) reasons.push("The website name slightly changes a popular brand to trick you.");
  if (signals.punycodeHomograph) reasons.push("It uses special foreign characters to look like a trusted site.");
  if (signals.contentMismatch) reasons.push("The page title claims to be a different brand than the website address.");
  
  // Obfuscation
  if (signals.shortenerObfuscation) reasons.push("It uses a link shortener to hide the true destination.");
  if (signals.suspiciousTld) reasons.push("It uses an unsafe website ending (like .xyz, .top) rarely used by real businesses.");
  
  // Urgency / Behavioral
  if (signals.urgency) reasons.push("The message is trying to make you panic so you don't think.");
  if (signals.financial) reasons.push("It asks for money, deposits, or hidden processing fees.");

  // Fallback
  if (reasons.length === 0 && riskScore > 40) {
      reasons.push("Multiple suspicious indicators were detected by our AI.");
  }

  // 3. Determine Intent
  let intent = "This link wants to direct you to a website.";
  if (signals.emergingRiskSource || signals.registrationFee) {
      intent = "This entity likely wants to extract money from you in the name of 'training' or 'registration'.";
  } else if (signals.knownScamSource || signals.impersonation) {
      intent = "This is a malicious source pretending to be official to issue fake certificates or steal data.";
  } else if (signals.intent_login) {
      intent = "This link likely wants to steal your password or personal details.";
  } else if (signals.intent_payment || signals.financial) {
      intent = "This link likely wants to trick you into sending money.";
  }

  // 4. Generate Advice (Actionable Steps for User)
  let advice = "Proceed if you trust the sender.";
  
  if (recommendation === "BLACKLISTED" || color === "red") {
      advice = "This certificate is totally USELESS. Do not share your data. If no CIN is available at MCA, this is a total fraud.";
      if (signals.financial) advice = "DO NOT PAY. No legitimate company asks for money to hire you.";
  } else if (recommendation === "GREYLISTED") {
      advice = "Be careful. If they ask for money for 'Training' or 'Selection', it is a recruitment scam. Stop immediately.";
  } else if (recommendation === "OPEN WITH CAUTION") {
      advice = "Verify the CIN via MCA servers first. If the company is not registered, the offer is not trustable.";
  }

  return {
      recommendation,
      color,
      why: reasons.slice(0, 3), // Top 3 reasons
      intent,
      advice
  };
}
