# 🤝 Contributing to TrustScan AI

Welcome to the **TrustScan AI** open-source contributor community! 🇮🇳✨

TrustScan is India's leading AI-powered document, government ID, corporate registry, and fraud intelligence platform. We welcome contributions from developers, students, researchers, and security analysts across India and the globe.

---

## 🗺️ Why Contribute?
- 🛡️ **Fight Real Scams:** Help protect millions of citizens, job seekers, and merchants against forgery and cyber fraud.
- 🧠 **Cutting-Edge Stack:** Work with Next.js 16, Sarvam Vision 3B, PyTorch, OpenCV Image Forensics, and MLOps.
- 🌟 **Portfolio & Recognition:** Get featured on our contributor wall and build high-impact production engineering experience.

---

## ⚡ 5-Minute Quickstart

### Prerequisites
- **Node.js:** `v18.0+`
- **Python:** `v3.10+` (with `pip` & `venv`)
- **Git**

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/TrustScan.git
cd TrustScan
```

### 2. Frontend Setup (Next.js)
```bash
cd client
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

### 3. Backend Setup (Node.js & Python)
```bash
cd ../server
npm install

# Setup Python Virtual Environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt  # Or install opencv-python, scikit-learn, pillow

# Start Server
npm run dev
```

---

## 🎯 Contribution Tracks & Good First Issues

| Area | What You Can Build | Key Files |
| :--- | :--- | :--- |
| 🏛️ **Govt ID Adapters** | Add Driving License (DL) format validators or Passport MRZ parsers | [`server/services/engine/rulesEngine.js`](server/services/engine/rulesEngine.js) |
| 🔬 **Image Forensics** | Improve ELA heatmaps, JPEG ghost analysis, or clone-region detection | [`server/scripts/image_forensics.py`](server/scripts/image_forensics.py) |
| 👁️ **Roboflow Datasets** | Add new Indian document classes (Voter ID, University Degrees) | [`server/scripts/download_indian_card_datasets.py`](server/scripts/download_indian_card_datasets.py) |
| 🎨 **UI / UX** | Enhance domain-specific result cards or dark mode aesthetics | [`client/src/app/results-dashboard/`](client/src/app/results-dashboard/) |
| 📊 **ML Evaluation** | Add adversarial test samples to our Indian document dataset | [`server/tests/indian_document_dataset.json`](server/tests/indian_document_dataset.json) |

---

## 📐 Git & Commit Guidelines

To maintain crystal-clear rollback points and safety:

1. **Commit Every File Separately:**  
   Always stage and commit each distinct file or feature chunk separately with a descriptive Conventional Commit message.
   ```bash
   git add client/src/app/results-dashboard/components/GovIdVerificationCard.tsx
   git commit -m "feat(ui): Add dedicated Government ID verification result card"
   ```

2. **Commit Message Prefixes:**
   - `feat(...)`: A new feature or validator
   - `fix(...)`: A bug fix or security patch
   - `docs(...)`: Documentation or architecture updates
   - `test(...)`: Adding test datasets or verification scripts
   - `refactor(...)`: Code restructuring without functional changes

---

## 🧪 Testing Your Changes

Before submitting a Pull Request:
```bash
# 1. Run Next.js Client Build
cd client && npm run build

# 2. Run Python & Architecture Test Suite
cd ../server
python scripts/train_document_rules.py
```

---

## 🛡️ Code of Conduct & Privacy
- **Zero Real PII:** Never commit real Aadhaar numbers, personal PAN cards, or private bank statements to GitHub. Always use synthesized or dummy samples.
- **Respectful Collaboration:** We are building for everyone. Be welcoming, constructive, and supportive of fellow contributors!
