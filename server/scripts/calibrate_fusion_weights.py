import os
import sys
import glob
import json
import time
import random
import argparse
import numpy as np

# Configure UTF-8 encoding for Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.model_selection import train_test_split, StratifiedKFold

# Ensure script can import image_forensics and vision ensemble
sys.path.append(os.path.dirname(__file__))
from image_forensics import (
    analyze_ela,
    analyze_noise_inconsistency,
    scan_exif_metadata,
    analyze_frequency_domain,
    analyze_dct_uniformity
)

try:
    from sdxl_detector import predict_sdxl_detector
except ImportError:
    def predict_sdxl_detector(img):
        return {"score": 0.0, "is_ai": False, "method": "none", "models_evaluated": {}}


def extract_feature_vector(image_path):
    """
    Extracts 6 normalized forensic signals:
    x0: ViT Vision Score (0.0 - 1.0)
    x1: 512px FFT Frequency Score (0.0 - 1.0)
    x2: Vectorized 2D DCT Kurtosis Score (0.0 - 1.0)
    x3: ELA Tamper Score (0.0 - 1.0)
    x4: Noise Patch Anomaly Score (0.0 - 1.0)
    x5: Metadata Software / AI Indicator (0.0 or 1.0)
    """
    try:
        ela = analyze_ela(image_path)
        noise = analyze_noise_inconsistency(image_path)
        exif = scan_exif_metadata(image_path)
        fft = analyze_frequency_domain(image_path)
        dct = analyze_dct_uniformity(image_path)
        ml = predict_sdxl_detector(image_path)

        # ViT Ensemble Score
        ml_score = ml.get("score", 0.0)
        models_eval = ml.get("models_evaluated", {})
        vit_s = models_eval.get("general_vit_detector", {}).get("score", ml_score)

        # FFT Frequency Score
        fft_s = fft.get("ai_generation_score", 0.0)

        # DCT Kurtosis Score
        dct_s = dct.get("dct_ai_score", 0.0)

        # ELA Score
        ela_s = ela.get("confidence", 0.0)

        # Noise Inpainting / Patch Anomaly Score
        max_patch = noise.get("max_patch_anomaly", 0.0)
        noise_s = float(min(1.0, max_patch / 5.0)) if noise.get("has_inpainting_anomaly") else 0.0

        # Metadata Signature Indicator
        meta_s = 1.0 if (exif.get("has_ai_signature") or exif.get("has_software_signature")) else 0.0

        return [vit_s, fft_s, dct_s, ela_s, noise_s, meta_s]
    except Exception as e:
        print(f"Error extracting features from {image_path}: {e}")
        return [0.5, 0.0, 0.0, 0.0, 0.0, 0.0]


def calibrate_and_evaluate_split(data_dir, total_samples_per_class=100, train_ratio=0.8, output_json="fusion_calibration.json"):
    fake_pattern = os.path.join(data_dir, "**", "FAKE", "*.*")
    real_pattern = os.path.join(data_dir, "**", "REAL", "*.*")

    all_fakes = glob.glob(fake_pattern, recursive=True)
    all_reals = glob.glob(real_pattern, recursive=True)

    print(f"Total Available in Dataset: FAKE={len(all_fakes)}, REAL={len(all_reals)}")

    if not all_fakes or not all_reals:
        print("Error: Could not find FAKE or REAL directories in data path.")
        return None

    random.seed(42)
    sample_fakes = random.sample(all_fakes, min(total_samples_per_class, len(all_fakes)))
    sample_reals = random.sample(all_reals, min(total_samples_per_class, len(all_reals)))

    print(f"\n🚀 Sampling {len(sample_fakes)} FAKE and {len(sample_reals)} REAL images (Total: {len(sample_fakes)+len(sample_reals)})...")

    X_all = []
    y_all = []
    file_paths = []

    # 1. Process FAKE samples (y = 1)
    print("Extracting features from FAKE samples...")
    t0 = time.time()
    for i, fpath in enumerate(sample_fakes):
        feats = extract_feature_vector(fpath)
        X_all.append(feats)
        y_all.append(1)
        file_paths.append(fpath)
        if (i + 1) % 25 == 0 or (i + 1) == len(sample_fakes):
            print(f"  Processed {i+1}/{len(sample_fakes)} FAKEs ({(time.time()-t0):.1f}s)")

    # 2. Process REAL samples (y = 0)
    print("Extracting features from REAL samples...")
    t0 = time.time()
    for i, rpath in enumerate(sample_reals):
        feats = extract_feature_vector(rpath)
        X_all.append(feats)
        y_all.append(0)
        file_paths.append(rpath)
        if (i + 1) % 25 == 0 or (i + 1) == len(sample_reals):
            print(f"  Processed {i+1}/{len(sample_reals)} REALs ({(time.time()-t0):.1f}s)")

    X_all = np.array(X_all, dtype=np.float64)
    y_all = np.array(y_all, dtype=np.int32)

    # 3. Create Strict Disjoint Train / Test Split (Zero Leakage)
    X_train, X_test, y_train, y_test = train_test_split(
        X_all, y_all, test_size=(1.0 - train_ratio), random_state=42, stratify=y_all
    )

    print(f"\n🔒 Split Composition (Zero Leakage):")
    print(f"   Train Set: {len(y_train)} samples (FAKE: {np.sum(y_train==1)}, REAL: {np.sum(y_train==0)})")
    print(f"   Held-Out Test Set: {len(y_test)} samples (FAKE: {np.sum(y_test==1)}, REAL: {np.sum(y_test==0)})")

    # 4. Fit Logistic Regression on TRAIN SET ONLY
    print("\n🧮 Fitting Logistic Regression exclusively on Train Split...")
    clf = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
    clf.fit(X_train, y_train)

    feature_names = ["vit_score", "fft_score", "dct_score", "ela_score", "noise_anomaly_score", "metadata_score"]
    raw_weights = clf.coef_[0].tolist()
    intercept = float(clf.intercept_[0])

    abs_weights = [max(0.0, w) for w in raw_weights]
    sum_w = sum(abs_weights) + 1e-10
    norm_weights = [round(w / sum_w, 4) for w in abs_weights]

    # 5. Evaluate on HELD-OUT TEST SET (Never seen during training)
    test_probs = clf.predict_proba(X_test)[:, 1]
    test_preds = clf.predict(X_test)

    test_acc = accuracy_score(y_test, test_preds)
    test_prec = precision_score(y_test, test_preds, zero_division=0)
    test_rec = recall_score(y_test, test_preds, zero_division=0)
    test_f1 = f1_score(y_test, test_preds, zero_division=0)
    test_auc = roc_auc_score(y_test, test_probs)

    tn, fp, fn, tp = confusion_matrix(y_test, test_preds).ravel()
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    # 5-Fold Stratified Cross-Validation on TRAIN SET
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_acc, cv_prec, cv_rec, cv_f1, cv_auc = [], [], [], [], []

    for tr_idx, val_idx in skf.split(X_train, y_train):
        X_tr, X_val = X_train[tr_idx], X_train[val_idx]
        y_tr, y_val = y_train[tr_idx], y_train[val_idx]

        clf_cv = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
        clf_cv.fit(X_tr, y_tr)
        val_preds = clf_cv.predict(X_val)
        val_probs = clf_cv.predict_proba(X_val)[:, 1]

        cv_acc.append(accuracy_score(y_val, val_preds))
        cv_prec.append(precision_score(y_val, val_preds, zero_division=0))
        cv_rec.append(recall_score(y_val, val_preds, zero_division=0))
        cv_f1.append(f1_score(y_val, val_preds, zero_division=0))
        cv_auc.append(roc_auc_score(y_val, val_probs))

    results = {
        "calibrated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_dataset_available": len(all_fakes) + len(all_reals),
        "total_samples_evaluated": len(y_all),
        "split_policy": {
            "train_samples": len(y_train),
            "held_out_test_samples": len(y_test),
            "train_ratio": train_ratio,
            "leakage_protection": "STRICT_DISJOINT_SPLIT"
        },
        "coefficients": {
            "raw_weights": {name: round(w, 4) for name, w in zip(feature_names, raw_weights)},
            "normalized_weights": {name: nw for name, nw in zip(feature_names, norm_weights)},
            "intercept": round(intercept, 4)
        },
        "held_out_test_metrics": {
            "test_accuracy_pct": round(test_acc * 100.0, 2),
            "test_precision_pct": round(test_prec * 100.0, 2),
            "test_recall_pct": round(test_rec * 100.0, 2),
            "test_f1_score": round(test_f1, 4),
            "test_roc_auc": round(test_auc, 4),
            "false_positive_rate_pct": round(fpr * 100.0, 2),
            "false_negative_rate_pct": round(fnr * 100.0, 2)
        },
        "held_out_confusion_matrix": {
            "true_positives_fake": int(tp),
            "false_positives_real_as_fake": int(fp),
            "true_negatives_real": int(tn),
            "false_negatives_fake_as_real": int(fn)
        },
        "train_cross_validation_metrics": {
            "cv_accuracy_mean_pct": round(float(np.mean(cv_acc)) * 100.0, 2),
            "cv_precision_mean_pct": round(float(np.mean(cv_prec)) * 100.0, 2),
            "cv_recall_mean_pct": round(float(np.mean(cv_rec)) * 100.0, 2),
            "cv_f1_mean": round(float(np.mean(cv_f1)), 4),
            "cv_roc_auc_mean": round(float(np.mean(cv_auc)), 4)
        }
    }

    out_path = os.path.join(os.path.dirname(__file__), output_json)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n" + "="*60)
    print("📊 HELD-OUT GENERALIZATION BENCHMARK — ZERO LEAKAGE")
    print("="*60)
    print(json.dumps(results, indent=2))
    print(f"\nSaved calibrated weights and held-out metrics to: {out_path}")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Calibrate TrustScan multi-signal fusion weights against disjoint train/test dataset.")
    parser.add_argument("--data_dir", type=str, default=r"D:\Chakra\Code\CheckIt\ImageForensicData", help="Path to ImageForensicData folder")
    parser.add_argument("--samples", type=int, default=100, help="Total samples per class (e.g., 100 = 100 FAKE + 100 REAL = 200 total)")
    parser.add_argument("--train_ratio", type=float, default=0.8, help="Train/test split ratio (default: 0.8)")
    parser.add_argument("--output", type=str, default="fusion_calibration.json", help="Output calibration JSON file name")
    args = parser.parse_args()

    calibrate_and_evaluate_split(args.data_dir, total_samples_per_class=args.samples, train_ratio=args.train_ratio, output_json=args.output)
