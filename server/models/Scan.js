import mongoose from "mongoose";

const scanSchema = new mongoose.Schema({
  userId: {
    type: String, // ID of the user performing the scan (optional)
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: ["message", "link", "document", "email", "job", "transaction", "company", "payment", "image", "academic", "degree", "gov_id"]
  },
  content: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: false
  },
  fileMimeType: {
    type: String,
    required: false
  },

  riskScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["fraud", "suspicious", "safe", "scam", "risky", "action_required"]
  },
  reasons: {
    type: [String], // Array of explanations why it was flagged
    default: []
  },
  
  // -- ML Feature Vector (Signals) --
  signals: {
    urgency: { type: Number, default: 0 },
    financial: { type: Number, default: 0 },
    impersonation: { type: Number, default: 0 },
    jobScam: { type: Number, default: 0 },
    techSupport: { type: Number, default: 0 },
    links: { type: Number, default: 0 },
    personalData: { type: Number, default: 0 },
    scamKeywords: { type: Number, default: 0 },
    trustSignal: { type: Number, default: 0 },
    softwareMetadata: { type: Number, default: 0 },
    genericSuccessMsg: { type: Number, default: 0 },
    missingCriticalFields: { type: Number, default: 0 },
    contextMismatch: { type: Number, default: 0 },
    lowOcrConfidence: { type: Number, default: 0 },
    ocrConfidenceParadox: { type: Number, default: 0 },
    structuralAnomalies: { type: Number, default: 0 },
    // -- Link Layer Signals --
    suspiciousTld: { type: Number, default: 0 },
    typosquatting: { type: Number, default: 0 },
    shortenerObfuscation: { type: Number, default: 0 },
    ipHost: { type: Number, default: 0 },
    // -- Document Specific Signals --
    registrationFee: { type: Number, default: 0 },
    unofficialDomain: { type: Number, default: 0 },
    docAnomalies: { type: Number, default: 0 },
    metadataAnomalies: { type: Number, default: 0 },
    corporateAnomalies: { type: Number, default: 0 }
  },
  
  recommendation: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  
  flags: {
    green: [String],
    red: [String]
  },
  
  // Explainability
  rulesFired: {
    type: [String], // Rule IDs
    default: []
  },
  
  // Metadata Attributes (Extra Features)
  metadata: {
    textLength: { type: Number, default: 0 },
    capsRatio: { type: Number, default: 0 }, // 0.0 to 1.0
    hasUrl: { type: Boolean, default: false },
    linkCount: { type: Number, default: 0 },
    phoneCount: { type: Number, default: 0 },
    normalizedText: { type: String, default: "" }
  },

  // -- Ground Truth (Feedback Loop) --
  userFeedback: {
    type: String,
    enum: ['correct', 'incorrect_safe', 'incorrect_fraud', null],
    default: null
  },
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },

  confidence: {
    type: String,
    enum: ['Very High', 'High', 'Medium', 'Low'],
    required: false
  },
  
  // -- Layer 2 & Monetization --
  analysisLayer: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },
  creditsConsumed: {
    type: Number,
    default: 0
  },

  // -- Fraud Map / Geo Intelligence --
  location: {
    city: String,
    state: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },

  // -- TTL Cleanup (7-day history for free users) --
  senderId: {
    type: String,
    required: false
  },
  smsHeaderAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  aiInsight: {
    type: String,
    default: null
  },
  aiModel: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 } // Document will be deleted at this timestamp
  },

  createdAt: {

    type: Date,
    default: Date.now
  }
}, { strict: false });


const Scan = mongoose.model("Scan", scanSchema);

export default Scan;
