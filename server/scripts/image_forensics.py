import sys
import os
import io
import json
import math
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

def analyze_ela(image_path_or_bytes, quality=90, scale=15):
    try:
        if isinstance(image_path_or_bytes, str):
            orig = Image.open(image_path_or_bytes).convert('RGB')
        else:
            orig = Image.open(io.BytesIO(image_path_or_bytes)).convert('RGB')
        temp_buffer = io.BytesIO()
        orig.save(temp_buffer, 'JPEG', quality=quality)
        temp_buffer.seek(0)
        resaved = Image.open(temp_buffer)
        diff = ImageChops.difference(orig, resaved)
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0: max_diff = 1
        scale_factor = 255.0 / max_diff
        diff = ImageEnhance.Brightness(diff).enhance(min(scale_factor, scale))
        diff_arr = np.array(diff)
        mean_ela = float(np.mean(diff_arr))
        std_ela = float(np.std(diff_arr))
        is_tampered = bool(std_ela > 28.0 or mean_ela > 40.0)
        tamper_confidence = float(min(1.0, (std_ela / 45.0) * 0.5 + (mean_ela / 60.0) * 0.5))
        return {"mean_ela": round(mean_ela, 2), "std_ela": round(std_ela, 2), "is_tampered": is_tampered, "confidence": round(tamper_confidence, 3)}
    except Exception as e:
        return {"error": str(e), "confidence": 0.0, "is_tampered": False}

def analyze_noise_inconsistency(image_path_or_bytes, grid_size=8):
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
                diff_v = np.abs(patch[:-1, :] - patch[1:, :])
                diff_h = np.abs(patch[:, :-1] - patch[:, 1:])
                local_var = float(np.var(diff_v) + np.var(diff_h))
                variances.append(local_var)
        var_std = float(np.std(variances))
        var_mean = float(np.mean(variances))
        coeff_variation = float(var_std / (var_mean + 1e-5))
        has_anomaly = bool(coeff_variation > 2.2)
        return {"noise_variance_std": round(var_std, 2), "coeff_variation": round(coeff_variation, 2), "has_noise_anomaly": has_anomaly}
    except Exception as e:
        return {"error": str(e), "has_noise_anomaly": False}

def scan_exif_metadata(image_path_or_bytes):
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes)
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes))
        info = img.info or {}
        raw_text = str(info).lower()
        ai_generators = ["midjourney", "dall-e", "stable diffusion", "sdxl", "flux", "firefly", "ideogram", "leonardo", "runway", "pika", "imagen", "craiyon", "artbreeder", "nightcafe", "bing image creator", "invoke ai", "automatic1111", "comfyui", "fooocus"]
        tampering_tools = ["photoshop", "canva", "gimp", "acrobat", "coreldraw", "illustrator", "affinity", "paint.net"]
        detected_ai = [g for g in ai_generators if g in raw_text]
        detected_editors = [t for t in tampering_tools if t in raw_text]
        sd_prompt = info.get('parameters', '') or info.get('prompt', '')
        has_sd_prompt = bool(sd_prompt and len(sd_prompt) > 20)
        has_stripped_metadata = len(info) == 0
        return {"detected_ai_generators": detected_ai, "detected_editing_software": detected_editors, "has_ai_signature": len(detected_ai) > 0 or has_sd_prompt, "has_software_signature": len(detected_editors) > 0, "has_stripped_metadata": has_stripped_metadata, "sd_prompt_found": has_sd_prompt, "sd_prompt_preview": sd_prompt[:120] if has_sd_prompt else None}
    except Exception as e:
        return {"detected_ai_generators": [], "detected_editing_software": [], "has_ai_signature": False, "has_software_signature": False, "has_stripped_metadata": True}

def analyze_frequency_domain(image_path_or_bytes):
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('L')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('L')
        img = img.resize((256, 256), Image.LANCZOS)
        arr = np.array(img, dtype=np.float64)
        h_window = np.hanning(256)
        window_2d = np.outer(h_window, h_window)
        arr_windowed = arr * window_2d
        fft = np.fft.fft2(arr_windowed)
        fft_shifted = np.fft.fftshift(fft)
        magnitude = np.abs(fft_shifted)
        log_magnitude = np.log1p(magnitude)
        cx, cy = 128, 128
        y_idx, x_idx = np.ogrid[:256, :256]
        dist = np.sqrt((x_idx - cx)**2 + (y_idx - cy)**2)
        total_energy = float(np.sum(log_magnitude))
        high_freq_mask = dist > 70
        high_freq_energy = float(np.sum(log_magnitude[high_freq_mask]))
        hfer = high_freq_energy / (total_energy + 1e-10)
        center_crop = log_magnitude[112:144, 112:144]
        grid_fft = np.abs(np.fft.fft2(center_crop))
        grid_energy_max = float(np.max(grid_fft[1:, 1:]))
        grid_energy_mean = float(np.mean(grid_fft[1:, 1:]))
        grid_spike_ratio = grid_energy_max / (grid_energy_mean + 1e-10)
        ring_energies = []
        for r in range(10, 120, 10):
            ring = (dist >= r) & (dist < r + 10)
            ring_energy = float(np.mean(log_magnitude[ring])) if np.sum(ring) > 0 else 0
            ring_energies.append(ring_energy)
        expected_slope = np.array(range(len(ring_energies)), dtype=float)
        actual = np.array(ring_energies)
        corr = float(np.corrcoef(expected_slope, actual)[0, 1]) if np.std(actual) > 0 and np.std(expected_slope) > 0 else 0.0
        ai_score = 0.0
        if hfer < 0.05: ai_score += 0.50
        elif hfer < 0.08: ai_score += 0.35
        elif hfer < 0.11: ai_score += 0.15
        if grid_spike_ratio > 40: ai_score += 0.40
        elif grid_spike_ratio > 25: ai_score += 0.25
        elif grid_spike_ratio > 15: ai_score += 0.10
        if abs(corr) < 0.35: ai_score += 0.15
        ai_score = float(min(1.0, ai_score))
        is_ai_generated = ai_score >= 0.40
        generator_hint = "Natural Camera Photograph"
        if is_ai_generated:
            if hfer < 0.06 and grid_spike_ratio > 30:
                generator_hint = "Latent Diffusion Model (SD / SDXL / FLUX / DALL-E 3)"
            elif hfer < 0.09:
                generator_hint = "GAN / AI Graphic Generator (Midjourney / StyleGAN / Imagen)"
            else:
                generator_hint = "AI-Assisted Digital Generation / Canva AI"
        return {"hfer": round(hfer, 4), "grid_spike_ratio": round(grid_spike_ratio, 2), "spectral_1f_corr": round(corr, 3), "ring_energies": [round(e, 3) for e in ring_energies], "ai_generation_score": round(ai_score, 3), "is_ai_generated": is_ai_generated, "generator_family_hint": generator_hint}
    except Exception as e:
        return {"error": str(e), "ai_generation_score": 0.0, "is_ai_generated": False, "generator_family_hint": "Analysis Failed"}

def analyze_dct_uniformity(image_path_or_bytes):
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('L')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('L')
        img = img.resize((128, 128), Image.LANCZOS)
        arr = np.array(img, dtype=np.float64)
        block_acs = []
        for i in range(0, 128 - 8, 8):
            for j in range(0, 128 - 8, 8):
                block = arr[i:i+8, j:j+8] - 128.0
                M = 8
                dct_block = np.zeros((M, M))
                for u in range(M):
                    for v in range(M):
                        cu = (1/math.sqrt(2)) if u == 0 else 1.0
                        cv = (1/math.sqrt(2)) if v == 0 else 1.0
                        s = 0.0
                        for x in range(M):
                            for y in range(M):
                                s += block[x, y] * math.cos((2*x+1)*u*math.pi/16) * math.cos((2*y+1)*v*math.pi/16)
                        dct_block[u, v] = (cu * cv / 4.0) * s
                ac = dct_block.flatten()[1:]
                block_acs.extend(ac.tolist())
        acs = np.array(block_acs)
        mean_ac = float(np.mean(acs))
        std_ac = float(np.std(acs))
        if std_ac > 0:
            kurtosis = float(np.mean(((acs - mean_ac) / std_ac) ** 4)) - 3.0
        else:
            kurtosis = 0.0
        is_gaussian_like = kurtosis < 1.2
        dct_ai_score = max(0.0, min(1.0, (1.8 - kurtosis) / 3.0)) if kurtosis < 1.8 else 0.0
        return {"ac_kurtosis": round(kurtosis, 3), "ac_std": round(std_ac, 3), "is_gaussian_like": is_gaussian_like, "dct_ai_score": round(dct_ai_score, 3)}
    except Exception as e:
        return {"error": str(e), "dct_ai_score": 0.0, "is_gaussian_like": False}

def run_full_forensics(image_path):
    ela   = analyze_ela(image_path)
    noise = analyze_noise_inconsistency(image_path)
    exif  = scan_exif_metadata(image_path)
    fft   = analyze_frequency_domain(image_path)
    dct   = analyze_dct_uniformity(image_path)
    tamper_score = 0.0
    if exif.get("has_software_signature"): tamper_score += 0.40
    if ela.get("is_tampered"): tamper_score += 0.35
    if noise.get("has_noise_anomaly"): tamper_score += 0.25
    ai_gen_score = 0.0
    if exif.get("has_ai_signature"): ai_gen_score += 0.85
    fft_score = fft.get("ai_generation_score", 0.0)
    dct_score = dct.get("dct_ai_score", 0.0)
    ai_gen_score += fft_score * 0.70
    ai_gen_score += dct_score * 0.20
    ai_gen_score = float(min(1.0, ai_gen_score))
    is_ai_generated = ai_gen_score >= 0.40
    is_tampered = tamper_score >= 0.35
    forensic_verdict = "CLEAN"
    if is_ai_generated and is_tampered: forensic_verdict = "AI_GENERATED_AND_EDITED"
    elif is_ai_generated: forensic_verdict = "AI_GENERATED"
    elif is_tampered: forensic_verdict = "TAMPERED_REAL_IMAGE"
    return {"forensic_tamper_score": round(min(1.0, tamper_score), 3), "ai_generation_score": round(ai_gen_score, 3), "is_tampered": is_tampered, "is_ai_generated": is_ai_generated, "forensic_verdict": forensic_verdict, "generator_family_hint": fft.get("generator_family_hint", "Unknown"), "detected_ai_generators": exif.get("detected_ai_generators", []), "detected_editing_software": exif.get("detected_editing_software", []), "sd_prompt_found": exif.get("sd_prompt_found", False), "sd_prompt_preview": exif.get("sd_prompt_preview"), "ela_analysis": ela, "noise_analysis": noise, "exif_analysis": exif, "fft_analysis": fft, "dct_analysis": dct}

if __name__ == '__main__':
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if os.path.exists(target):
            report = run_full_forensics(target)
            print(json.dumps(report, indent=2))
        else:
            print(json.dumps({"error": "File not found"}))
    else:
        dummy = Image.new('RGB', (300, 300), color=(128, 90, 45))
        buf = io.BytesIO()
        dummy.save(buf, 'JPEG', quality=95)
        raw_bytes = buf.getvalue()
        report = run_full_forensics(raw_bytes)
        print(json.dumps(report, indent=2))
