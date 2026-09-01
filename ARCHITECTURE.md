# 🏛️ TrustScan AI — System Architecture & Dataflow Specification

> **Version 4.3 — Multi-Modal Credential, Document & Evidence-Based AI Image Forensics**

This document outlines the production architecture of **TrustScan AI**, detailing how uploads (images, academic transcripts, corporate IDs, employment letters) flow through our multi-signal inspection engine, pretrained vision models, signal processing pipelines, and deterministic verification layers.

---

## 🗺️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. INGESTION & FAST-PATH ROUTER"]
        UPLOAD[User Upload: Image / Document] --> ROUTER{Scan Type?}
        ROUTER -->|type: image| FAST[Fast-Path: Native Buffer to Warm Daemon]
        ROUTER -->|type: academic / document| PARALLEL[Parallel Execution: OCR + Forensics]
    end

    subgraph Signals ["2. MULTI-SIGNAL EVIDENCE EXTRACTION (Native Resolution)"]
        FAST & PARALLEL --> S1[Signal 1: Metadata Engine<br/>EXIF & PNG Chunks, Prompt Traces, Tool Signatures]
        FAST & PARALLEL --> S2[Signal 2: ELA Engine<br/>JPEG Recompression Error Level Analysis]
        FAST & PARALLEL --> S3[Signal 3: FFT Frequency Engine<br/>2D Radial 1/f Power Spectrum & Grid Spikes]
        FAST & PARALLEL --> S4[Signal 4: Vectorized 2D DCT Engine<br/>8x8 Orthonormal AC Coefficient Kurtosis]
        FAST & PARALLEL --> S5[Signal 5: Pretrained Vision Ensemble<br/>General ViT + SDXL Specialist - 384px Tensor]
    end

    subgraph Fusion ["3. EVIDENCE-BASED FEATURE FUSION"]
        S1 & S2 & S3 & S4 & S5 --> FUS[Stage 6: Multi-Signal Evidence Aggregation]
        FUS --> CAL[Stage 7: Confidence Calibration Layer]
    end

    subgraph Doc_Engine ["4. DETERMINISTIC CREDENTIAL ENGINES"]
        PARALLEL --> OCR[Sarvam Vision 3B / Tesseract OCR]
        OCR --> UGC[UGC University Accreditation Registry]
        OCR --> MCA[MCA CIN & GSTIN Registry Lookup]
        OCR --> CTC[Salary Math & HR Domain Verifier]
    end

    subgraph Verdict ["5. 5-STATE VERDICT CLASSIFICATION"]
        CAL --> V_OUT[Stage 8: Calibrated Verdict]
        V_OUT --> V_REAL["🟢 AUTHENTIC (Clean)"]
        V_OUT --> V_AI["🤖 AI_GENERATED"]
        V_OUT --> V_TAMP["✂️ TAMPERED_REAL_IMAGE"]
        V_OUT --> V_AI_TAMP["🤖✂️ AI_GENERATED_AND_EDITED"]
        V_OUT --> V_UNC["❓ UNCERTAIN (Inconclusive)"]
    end

    subgraph Output ["6. AUDIT & DASHBOARD LAYER"]
        V_OUT & UGC & MCA & CTC --> MONGO[(MongoDB Atlas - Scan Model)]
        MONGO --> DASH[ResultsInteractive.tsx Domain Views]
    end
```

---

## 🔬 Evidence-Based AI Image Forensics Architecture

Rather than relying on a single neural network or heuristic vote, TrustScan AI utilizes an **evidence-based multi-signal fusion pipeline**:

```
ORIGINAL IMAGE BUFFER (Native Resolution)
  │
  ├──────────────────► Signal 1: Metadata Scanner (EXIF / PNG Chunks / Prompts)
  ├──────────────────► Signal 2: ELA Recompression Analysis (JPEG Error Differentials)
  ├──────────────────► Signal 3: FFT 2D Frequency Domain (1/f Spectral Decay & Grid Spikes)
  ├──────────────────► Signal 4: Vectorized 2D DCT Matrix Transform (Laplacian vs Gaussian Kurtosis)
  └─► [Resize 384px] ─► Signal 5: Pretrained Vision Ensemble (General ViT + SDXL Specialist)
                              │
                              ▼
               ┌──────────────────────────────┐
               │ Multi-Signal Evidence Fusion │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │ 5-State Verdict Output       │
               ├──────────────────────────────┤
               │ • 🟢 AUTHENTIC (Clean)       │
               │ • 🤖 AI_GENERATED            │
               │ • ✂️ TAMPERED (Real Edited)  │
               │ • 🤖✂️ AI & TAMPERED          │
               │ • ❓ UNCERTAIN (Ambiguous)   │
               └──────────────────────────────┘
```

---

### Layer Breakdown

| Signal Layer | Component | Signal Target | Strengths & Role |
| :--- | :--- | :--- | :--- |
| **1. Metadata Signal** | `scan_exif_metadata` | PNG text chunks, EXIF tags, A1111/ComfyUI/Midjourney parameters | Ground-truth direct evidence when raw metadata survives web upload. |
| **2. Signal Processing (ELA)** | `analyze_ela` | JPEG recompression error levels, pixel brightness variance | Detects Photoshop, Canva, spliced regions, copy-paste cloning. |
| **3. Signal Processing (FFT)** | `analyze_frequency_domain` | 2D Fourier power spectrum, 1/f radial slope, high-frequency energy ratio | Identifies structural frequency anomalies and VAE grid upsampling artifacts. |
| **4. Signal Processing (DCT)** | `analyze_dct_uniformity` | 8x8 block discrete cosine transform AC coefficient kurtosis | Measures statistical distribution differences (Laplacian vs Gaussian). |
| **5. Learned ML Model** | `predict_sdxl_detector` | `Organika/sdxl-detector` Vision Transformer / CNN | Deep multi-scale latent feature classifier fine-tuned on diffusion image pairs. |
| **6. Deterministic Engines** | `rulesEngine.js` | UGC Registry, MCA CIN, GSTIN, Salary math, HR email domains | 100% deterministic mathematical & official database verification. |

---

## 📊 AI Detection Performance & Validation Metrics

### Pretrained Vision Model Specification
- **Model**: [`Organika/sdxl-detector`](https://huggingface.co/Organika/sdxl-detector)
- **Base Architecture**: Deep Image Classifier
- **Primary Strength**: High sensitivity to SDXL and modern latent diffusion imagery.
- **Reported Validation Metrics** *(Source: Model Card Validation Dataset)*:
  - **Accuracy**: `98.13%`
  - **F1 Score**: `97.33%`
  - **Precision**: `99.45%`
  - **Recall**: `95.29%`
  - **AUC**: `99.80%`
- **Known Limitations**: Performance is specialized for SDXL/latent diffusion architectures; cross-generator performance on other models (Midjourney, DALL-E, FLUX, GANs) may exhibit domain variance and is reinforced by TrustScan's multi-signal fusion layer.
- **Licensing**: CC-BY-NC-3.0 (Personal, educational, and research evaluation use).

---

## 📁 Key File Map & Responsibilities

| File Path | Role & Technology |
| :--- | :--- |
| [`client/src/app/scan-interface/components/ScanInterfaceInteractive.tsx`](file:///d:/Chakra/Code/CheckIt/client/src/app/scan-interface/components/ScanInterfaceInteractive.tsx) | 4-Portal scanner frontend with file validation and type dispatching |
| [`client/src/app/results-dashboard/components/ResultsInteractive.tsx`](file:///d:/Chakra/Code/CheckIt/client/src/app/results-dashboard/components/ResultsInteractive.tsx) | Domain-specific dashboard router rendering dedicated cards per scan type |
| [`server/routes/scan.js`](file:///d:/Chakra/Code/CheckIt/server/routes/scan.js) | Central ingestion route executing OCR, forensics, rules, and MongoDB persistence |
| [`server/services/analysis/imageForensicsService.js`](file:///d:/Chakra/Code/CheckIt/server/services/analysis/imageForensicsService.js) | Node.js bridge to Python multi-stage forensic analysis |
| [`server/scripts/sdxl_detector.py`](file:///d:/Chakra/Code/CheckIt/server/scripts/sdxl_detector.py) | Hugging Face `Organika/sdxl-detector` vision classifier execution wrapper |
| [`server/scripts/image_forensics.py`](file:///d:/Chakra/Code/CheckIt/server/scripts/image_forensics.py) | Complete 8-stage image forensics pipeline (FFT, ELA, EXIF, DCT, ML model, calibration) |
| [`server/models/Scan.js`](file:///d:/Chakra/Code/CheckIt/server/models/Scan.js) | Mongoose schema with multi-modal enum validation and threat signals |

---

## 🧪 Comprehensive Benchmarking Plan

To rigorously measure TrustScan AI's empirical accuracy across diverse generator families, the following benchmark test matrix is established:

```
BENCHMARK TEST MATRIX
├── REAL
│   ├── DSLR & Smartphone Photos (Natural Sensor Noise)
│   ├── Screenshots & Digital UI Captures
│   ├── Scanned Documents & Transcripts
│   └── Compressed Web Images (WhatsApp / Social Media)
├── AI GENERATED
│   ├── Stable Diffusion (SD 1.5 / SD 2.1)
│   ├── SDXL (1024x1024 Base + Refiner)
│   ├── Midjourney (v5 / v6)
│   ├── DALL-E (DALL-E 2 / DALL-E 3)
│   └── FLUX.1 (Schnell / Dev)
└── TAMPERED / COMPOSITE
    ├── Photoshop Clone / Splicing
    ├── Canva Text & Graphic Overlays
    ├── Document Stamp / Signature Alterations
    └── AI Generation + Photoshop Composite
```
