import sys
import os
import io
import json
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

def analyze_ela(image_path_or_bytes, quality=90, scale=15):
    """
    Performs Error Level Analysis (ELA) on an image.
    Resaves image at a known JPEG quality (90%) and measures pixel variance.
    High variance in text patches indicates localized tampering or spliced fonts.
    """
    try:
        if isinstance(image_path_or_bytes, str):
            orig = Image.open(image_path_or_bytes).convert('RGB')
        else:
            orig = Image.open(io.BytesIO(image_path_or_bytes)).convert('RGB')
            
        temp_buffer = io.BytesIO()
        orig.save(temp_buffer, 'JPEG', quality=quality)
        temp_buffer.seek(0)
        resaved = Image.open(temp_buffer)
        
        # Calculate pixel-level difference
        diff = ImageChops.difference(orig, resaved)
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1
        
        # Scale for contrast enhancement
        scale_factor = 255.0 / max_diff
        diff = ImageEnhance.Brightness(diff).enhance(min(scale_factor, scale))
        
        diff_arr = np.array(diff)
        mean_ela = float(np.mean(diff_arr))
        std_ela = float(np.std(diff_arr))
        
        # High ELA standard deviation across patches indicates localized editing
        is_tampered = bool(std_ela > 25.0 or mean_ela > 35.0)
        tamper_confidence = float(min(1.0, (std_ela / 40.0) * 0.5 + (mean_ela / 50.0) * 0.5))
        
        return {
            "mean_ela": round(mean_ela, 2),
            "std_ela": round(std_ela, 2),
            "is_tampered": is_tampered,
            "confidence": round(tamper_confidence, 3)
        }
    except Exception as e:
        return {"error": str(e), "confidence": 0.0, "is_tampered": False}

def analyze_noise_inconsistency(image_path_or_bytes, grid_size=8):
    """
    Splits image into grid patches and calculates local noise variance.
    Inconsistent noise across patches indicates composite/spliced images.
    """
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('L')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('L')
            
        arr = np.array(img, dtype=np.float32)
        h, w = arr.shape
        patch_h, patch_w = h // grid_size, w // grid_size
        
        if patch_h < 4 or patch_w < 4:
            return {"noise_variance_std": 0.0, "has_noise_anomaly": False}
            
        variances = []
        for i in range(grid_size):
            for j in range(grid_size):
                patch = arr[i*patch_h:(i+1)*patch_h, j*patch_w:(j+1)*patch_w]
                # High-pass filter via Laplacian-like diff
                diff_v = np.abs(patch[:-1, :] - patch[1:, :])
                diff_h = np.abs(patch[:, :-1] - patch[:, 1:])
                local_var = float(np.var(diff_v) + np.var(diff_h))
                variances.append(local_var)
                
        var_std = float(np.std(variances))
        var_mean = float(np.mean(variances))
        coeff_variation = float(var_std / (var_mean + 1e-5))
        
        has_anomaly = bool(coeff_variation > 1.8)
        return {
            "noise_variance_std": round(var_std, 2),
            "coeff_variation": round(coeff_variation, 2),
            "has_noise_anomaly": has_anomaly
        }
    except Exception as e:
        return {"error": str(e), "has_noise_anomaly": False}

def scan_exif_metadata(image_path_or_bytes):
    """
    Parses EXIF headers for traces of editing software.
    """
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes)
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes))
            
        info = img.info or {}
        raw_text = str(info).lower()
        
        tampering_tools = ["photoshop", "canva", "gimp", "acrobat", "midjourney", "dall-e", "stable diffusion", "coreldraw", "illustrator"]
        detected = [tool for tool in tampering_tools if tool in raw_text]
        
        has_stripped_metadata = len(info) == 0
        
        return {
            "detected_software": detected,
            "has_software_signature": len(detected) > 0,
            "has_stripped_metadata": has_stripped_metadata
        }
    except Exception as e:
        return {"detected_software": [], "has_software_signature": False, "has_stripped_metadata": True}

def run_full_forensics(image_path):
    ela = analyze_ela(image_path)
    noise = analyze_noise_inconsistency(image_path)
    exif = scan_exif_metadata(image_path)
    
    # Aggregate Forensic Score (0.0 to 1.0)
    score = 0.0
    if exif.get("has_software_signature"):
        score += 0.40
    if ela.get("is_tampered"):
        score += 0.35
    if noise.get("has_noise_anomaly"):
        score += 0.25
        
    result = {
        "forensic_tamper_score": round(min(1.0, score), 3),
        "is_tampered": score >= 0.35,
        "ela_analysis": ela,
        "noise_analysis": noise,
        "exif_analysis": exif
    }
    return result

if __name__ == '__main__':
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if os.path.exists(target):
            report = run_full_forensics(target)
            print(json.dumps(report, indent=2))
        else:
            print(json.dumps({"error": "File not found"}))
    else:
        # Self-test on synthetic dummy image
        dummy = Image.new('RGB', (300, 300), color=(255, 255, 255))
        buf = io.BytesIO()
        dummy.save(buf, 'JPEG', quality=95)
        report = {
            "ela_analysis": analyze_ela(buf.getvalue()),
            "noise_analysis": analyze_noise_inconsistency(buf.getvalue()),
            "exif_analysis": scan_exif_metadata(buf.getvalue())
        }
        print(json.dumps(report, indent=2))
