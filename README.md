# TrustScan (formerly CheckIt) 🛡️🇮🇳

**TrustScan** is a production-grade, AI-powered fraud detection system specifically engineered for the Indian market. It combines multi-modal intelligence to detect fake documents, payment scams, and identity fraud with high precision.

## 🚀 Key Features

### 🔍 Advanced Hybrid OCR Architecture
- **Primary Layer:** Google Vision API & Tesseract.js for fast text extraction.
- **Deep Scan Booster:** Gated Python (EasyOCR) process that triggers for "unreadable" or high-risk documents.
- **Scanned PDF Support:** High-resolution rendering of image-only PDFs (using PyMuPDF) to detect fraud in digital scans where traditional parsers fail.

### 🧠 Self-Learning ML Engine
- **Logistic Regression Model:** A custom-trained Layer-1 classifier that weighs textual signals against document metadata.
- **Self-Correction Logic:** Automatically triggers retraining based on real-world user feedback (Ground Truth).
- **Deployment Guardrails:** Automated precision checks to prevent accuracy degradation during model promotion.

### 🏛️ Indian Identity Validation
- **Aadhaar Verification:** Mathematical checksum validation using the Verhoeff algorithm.
- **PAN Structural Checks:** Validates registration status (Individual/Company) vs format.
- **GSTIN/CIN Validation:** Deep mathematical checksum verification for official business identifiers.

### 🛡️ Fraud & AI Detection
- **AI Forensics:** Detects traces of Midjourney, DALL-E, and other generative tools.
- **Edit Detection:** Finds metadata signatures of Photoshop, Canva, and GIMP.
- **Context Awareness:** Recognizes "payment successful" bait, missing critical transaction fields, and localized Indian scam keywords.

## 🛠️ Tech Stack
- **Frontend:** Next.js, Tailwind CSS, Framer Motion.
- **Backend:** Node.js, Express, MongoDB.
- **Intelligence:** Python (Scikit-Learn, EasyOCR, PyMuPDF, Pandas).
- **Security:** Google Cloud Vision, Custom Rules Engine.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Local or Atlas)
- Google Cloud Vision API Key

### Installation

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/Dubey411/TrustScan.git
   cd TrustScan
   ```

2. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Configure your .env file with MONGO_URI and GOOGLE_CREDENTIALS
   npm start
   ```

## 🧠 ML Operations (MLOps)

The "Brain" of TrustScan is fully portable and located in `server/scripts/`.

- **To Manually Retrain:**
  ```bash
  python server/scripts/train_layer1.py
  ```
- **To Rollback to a Previous Version:**
  ```bash
  python server/scripts/rollback.py
  ```

## 📜 License
© 2026 TrustScan AI. All Rights Reserved.
Designed to secure the Indian digital ecosystem. 🛡️💎✨
