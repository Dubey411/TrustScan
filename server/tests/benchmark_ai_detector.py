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
    Evaluates TrustScan Multi-Signal Forensics against a structured test folder:
    dataset_dir/
      real/
      ai_sdxl/
      ai_midjourney/
      ai_dalle/
      ai_flux/
      tampered/
    """
    if not os.path.exists(dataset_dir):
        print(f"Dataset path '{dataset_dir}' not found. Please provide a valid test dataset directory.")
        return

    results = {
        "summary": {
            "total_tested": 0,
            "correct_predictions": 0,
            "overall_accuracy": 0.0,
            "avg_latency_ms": 0.0
        },
        "per_category": {}
    }

    total_time = 0.0
    total_samples = 0
    total_correct = 0

    for category_name in os.listdir(dataset_dir):
        cat_path = os.path.join(dataset_dir, category_name)
        if not os.path.isdir(cat_path):
            continue

        is_real = category_name.lower().startswith('real')
        is_tampered = 'tamper' in category_name.lower() or 'edit' in category_name.lower()
        is_ai = 'ai' in category_name.lower() or 'sd' in category_name.lower() or 'flux' in category_name.lower() or 'dalle' in category_name.lower() or 'midjourney' in category_name.lower()

        cat_total = 0
        cat_correct = 0
        cat_scores = []

        for fname in os.listdir(cat_path):
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
            cat_scores.append({"file": fname, "ai_score": ai_score, "tamper_score": tamper_score, "verdict": pred_verdict})

            # Check correctness
            if is_real and pred_verdict == "CLEAN":
                cat_correct += 1
                total_correct += 1
            elif is_ai and "AI" in pred_verdict:
                cat_correct += 1
                total_correct += 1
            elif is_tampered and "TAMPERED" in pred_verdict:
                cat_correct += 1
                total_correct += 1

        acc = (cat_correct / cat_total * 100.0) if cat_total > 0 else 0.0
        results["per_category"][category_name] = {
            "samples": cat_total,
            "correct": cat_correct,
            "accuracy_pct": round(acc, 2),
            "samples_detail": cat_scores[:5] # sample preview
        }

    if total_samples > 0:
        results["summary"]["total_tested"] = total_samples
        results["summary"]["correct_predictions"] = total_correct
        results["summary"]["overall_accuracy"] = round((total_correct / total_samples) * 100.0, 2)
        results["summary"]["avg_latency_ms"] = round(total_time / total_samples, 2)

    print(json.dumps(results, indent=2))
    return results

if __name__ == '__main__':
    if len(sys.argv) > 1:
        benchmark_dataset(sys.argv[1])
    else:
        print("Usage: python benchmark_ai_detector.py <path_to_dataset_folder>")
