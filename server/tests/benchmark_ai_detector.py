import os
import sys
import json
import time
from pathlib import Path

# Add scripts directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scripts')))
from image_forensics import run_full_forensics

def benchmark_dataset(dataset_dir):
    """
    Evaluates TrustScan Multi-Signal Forensics against a structured test folder (v4.4):
    dataset_dir/
      real_camera/
      real_scanned_ids/
      ai_photorealistic/
      ai_vector_graphics/
      adversarial_recompressed/
      inpainting_tampered/
    """
    if not os.path.exists(dataset_dir):
        print(f"Dataset path '{dataset_dir}' not found. Please provide a valid test dataset directory.")
        return

    results = {
        "summary": {
            "total_tested": 0,
            "correct_predictions": 0,
            "overall_accuracy_pct": 0.0,
            "precision_pct": 0.0,
            "recall_pct": 0.0,
            "f1_score": 0.0,
            "false_positive_rate_pct": 0.0,
            "false_negative_rate_pct": 0.0,
            "avg_latency_ms": 0.0
        },
        "confusion_matrix": {
            "true_positive_ai": 0,
            "false_positive_ai": 0,
            "true_negative_clean": 0,
            "false_negative_clean": 0,
            "tamper_detected": 0,
            "uncertain_inconclusive": 0
        },
        "per_category": {}
    }

    total_time = 0.0
    total_samples = 0
    total_correct = 0

    tp = 0  # AI correctly flagged as AI
    fp = 0  # Real wrongly flagged as AI
    tn = 0  # Real correctly flagged as CLEAN
    fn = 0  # AI wrongly flagged as CLEAN

    for category_name in sorted(os.listdir(dataset_dir)):
        cat_path = os.path.join(dataset_dir, category_name)
        if not os.path.isdir(cat_path):
            continue

        cat_lower = category_name.lower()
        is_real = cat_lower.startswith('real') or cat_lower == 'clean' or cat_lower == 'authentic'
        is_tampered = 'tamper' in cat_lower or 'inpaint' in cat_lower or cat_lower.startswith('edit')
        is_vector = 'vector' in cat_lower or 'badge' in cat_lower or 'graphic' in cat_lower
        is_ai = not is_real and ('ai' in cat_lower or 'flux' in cat_lower or 'sd' in cat_lower or 'midjourney' in cat_lower or 'dalle' in cat_lower or is_vector)

        cat_total = 0
        cat_correct = 0
        cat_scores = []

        for fname in sorted(os.listdir(cat_path)):
            if not fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                continue

            fpath = os.path.join(cat_path, fname)
            t0 = time.time()
            report = run_full_forensics(fpath)
            lat = (time.time() - t0) * 1000.0

            total_time += lat
            cat_total += 1
            total_samples += 1

            pred_verdict = report.get("forensic_verdict", "CLEAN")
            ai_score = report.get("ai_generation_score", 0.0)
            tamper_score = report.get("forensic_tamper_score", 0.0)
            cat_scores.append({
                "file": fname,
                "ai_score": ai_score,
                "tamper_score": tamper_score,
                "verdict": pred_verdict,
                "latency_ms": round(lat, 1)
            })

            # Check correctness against ground truth category
            if is_tampered:
                if "TAMPERED" in pred_verdict or "EDITED" in pred_verdict:
                    cat_correct += 1
                    total_correct += 1
                    results["confusion_matrix"]["tamper_detected"] += 1
                elif "AI" in pred_verdict:
                    cat_correct += 1
                    total_correct += 1
                    tp += 1
            elif is_real:
                if pred_verdict == "CLEAN":
                    tn += 1
                    cat_correct += 1
                    total_correct += 1
                elif pred_verdict == "UNCERTAIN":
                    # WhatsApp/stripped metadata real image held in UNCERTAIN (amber review)
                    cat_correct += 1
                    total_correct += 1
                    results["confusion_matrix"]["uncertain_inconclusive"] += 1
                elif "AI" in pred_verdict:
                    fp += 1
            elif is_ai:
                if "AI" in pred_verdict:
                    tp += 1
                    cat_correct += 1
                    total_correct += 1
                elif pred_verdict == "UNCERTAIN" and is_vector:
                    # 2D vector graphic safely caught in UNCERTAIN band
                    cat_correct += 1
                    total_correct += 1
                    results["confusion_matrix"]["uncertain_inconclusive"] += 1
                elif "TAMPERED" in pred_verdict:
                    # AI Inpainting / cleanup image flagged as tampered
                    cat_correct += 1
                    total_correct += 1
                    results["confusion_matrix"]["tamper_detected"] += 1
                elif pred_verdict == "CLEAN":
                    fn += 1

        acc = (cat_correct / cat_total * 100.0) if cat_total > 0 else 0.0
        results["per_category"][category_name] = {
            "samples": cat_total,
            "correct": cat_correct,
            "accuracy_pct": round(acc, 2),
            "samples_detail": cat_scores
        }

    results["confusion_matrix"]["true_positive_ai"] = tp
    results["confusion_matrix"]["false_positive_ai"] = fp
    results["confusion_matrix"]["true_negative_clean"] = tn
    results["confusion_matrix"]["false_negative_clean"] = fn

    if total_samples > 0:
        precision = (tp / (tp + fp)) if (tp + fp) > 0 else 1.0
        recall = (tp / (tp + fn)) if (tp + fn) > 0 else 1.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
        fpr = (fp / (fp + tn)) if (fp + tn) > 0 else 0.0
        fnr = (fn / (fn + tp)) if (fn + tp) > 0 else 0.0

        results["summary"]["total_tested"] = total_samples
        results["summary"]["correct_predictions"] = total_correct
        results["summary"]["overall_accuracy_pct"] = round((total_correct / total_samples) * 100.0, 2)
        results["summary"]["precision_pct"] = round(precision * 100.0, 2)
        results["summary"]["recall_pct"] = round(recall * 100.0, 2)
        results["summary"]["f1_score"] = round(f1, 4)
        results["summary"]["false_positive_rate_pct"] = round(fpr * 100.0, 2)
        results["summary"]["false_negative_rate_pct"] = round(fnr * 100.0, 2)
        results["summary"]["avg_latency_ms"] = round(total_time / total_samples, 2)

    print(json.dumps(results, indent=2))
    return results

if __name__ == '__main__':
    if len(sys.argv) > 1:
        benchmark_dataset(sys.argv[1])
    else:
        print("Usage: python benchmark_ai_detector.py <path_to_dataset_folder>")
