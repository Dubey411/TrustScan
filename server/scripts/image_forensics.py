import sys
import os
import io
import json
import math
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

# Import Pretrained Vision Ensemble
try:
    from sdxl_detector import predict_sdxl_detector
except ImportError:
    try:
        sys.path.append(os.path.dirname(__file__))
        from sdxl_detector import predict_sdxl_detector
    except ImportError:
        def predict_sdxl_detector(img):
            return {"score": 0.0, "is_ai": False, "method": "none", "models_evaluated": {}}

def analyze_ela(image_path_or_bytes, quality=90, scale=15):
    """
    Stage 2: Error Level Analysis (ELA)
    Analyzes JPEG recompression delta and high-frequency pixel editing variance.
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
    """
    Stage 2: Localized Noise Inconsistency & Inpainting/Splice Detection
    Analyzes multi-patch noise variance to detect both global distribution anomalies
    and localized spliced/inpainted regions (e.g., face swaps on ID cards).
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
            return {"noise_variance_std": 0.0, "has_noise_anomaly": False, "has_inpainting_anomaly": False, "max_patch_anomaly": 0.0}
        
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
        var_median = float(np.median(variances))
        coeff_variation = float(var_std / (var_mean + 1e-5))
        
        # Localized patch anomaly: maximum deviation of a single patch from median noise
        patch_deviations = [abs(v - var_median) / (var_std + 1e-5) for v in variances]
        max_patch_anomaly = float(max(patch_deviations)) if patch_deviations else 0.0
        
        has_anomaly = bool(coeff_variation > 2.0)
        has_inpainting_anomaly = bool(max_patch_anomaly > 3.2 and coeff_variation > 1.4)
        
        return {
            "noise_variance_std": round(var_std, 2),
            "coeff_variation": round(coeff_variation, 2),
            "max_patch_anomaly": round(max_patch_anomaly, 2),
            "has_noise_anomaly": has_anomaly,
            "has_inpainting_anomaly": has_inpainting_anomaly
        }
    except Exception as e:
        return {"error": str(e), "has_noise_anomaly": False, "has_inpainting_anomaly": False}

def scan_exif_metadata(image_path_or_bytes):
    """
    Stage 1: Metadata & Prompt Extraction
    Extracts embedded generation parameters (A1111, ComfyUI, Midjourney, DALL-E, Fooocus)
    and physical camera hardware tags (Make, Model, FNumber, ISO).
    """
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes)
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes))
        info = img.info or {}
        raw_text = str(info).lower()
        
        # Check EXIF camera hardware tags
        has_camera_tags = False
        camera_maker = None
        camera_model = None
        try:
            exif_data = img.getexif()
            if exif_data:
                # Standard EXIF tags: 271=Make, 272=Model, 306=DateTime, 33434=ExposureTime, 33437=FNumber, 34855=ISOSpeed
                maker = exif_data.get(271)
                model = exif_data.get(272)
                if maker or model:
                    has_camera_tags = True
                    camera_maker = str(maker) if maker else None
                    camera_model = str(model) if model else None
        except Exception:
            pass

        ai_generators = ["midjourney", "dall-e", "stable diffusion", "sdxl", "flux", "firefly", "ideogram", "leonardo", "runway", "pika", "imagen", "craiyon", "artbreeder", "nightcafe", "bing image creator", "invoke ai", "automatic1111", "comfyui", "fooocus"]
        tampering_tools = ["photoshop", "canva", "gimp", "acrobat", "coreldraw", "illustrator", "affinity", "paint.net"]
        
        detected_ai = [g for g in ai_generators if g in raw_text]
        detected_editors = [t for t in tampering_tools if t in raw_text]
        sd_prompt = info.get('parameters', '') or info.get('prompt', '')
        has_sd_prompt = bool(sd_prompt and len(sd_prompt) > 20)
        has_stripped_metadata = len(info) == 0 and not has_camera_tags

        return {
            "detected_ai_generators": detected_ai,
            "detected_editing_software": detected_editors,
            "has_ai_signature": len(detected_ai) > 0 or has_sd_prompt,
            "has_software_signature": len(detected_editors) > 0,
            "has_camera_tags": has_camera_tags,
            "camera_maker": camera_maker,
            "camera_model": camera_model,
            "has_stripped_metadata": has_stripped_metadata,
            "sd_prompt_found": has_sd_prompt,
            "sd_prompt_preview": sd_prompt[:120] if has_sd_prompt else None
        }
    except Exception as e:
        return {
            "detected_ai_generators": [],
            "detected_editing_software": [],
            "has_ai_signature": False,
            "has_software_signature": False,
            "has_camera_tags": False,
            "has_stripped_metadata": True
        }

def analyze_frequency_domain(image_path_or_bytes):
    """
    Stage 3: 512x512 High-Resolution 2D FFT Frequency Domain Fingerprinting
    Captures micro-lattice upsampling peaks (FLUX.1, SDXL, Midjourney) without downsampling smearing.
    """
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('L')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('L')
            
        # 512x512 window preserves high-frequency spectral spikes from 1024px generators
        img = img.resize((512, 512), Image.BILINEAR)
        arr = np.array(img, dtype=np.float64)
        
        h_window = np.hanning(512)
        window_2d = np.outer(h_window, h_window)
        arr_windowed = arr * window_2d
        
        fft = np.fft.fft2(arr_windowed)
        fft_shifted = np.fft.fftshift(fft)
        magnitude = np.abs(fft_shifted)
        log_magnitude = np.log1p(magnitude)
        
        cx, cy = 256, 256
        y_idx, x_idx = np.ogrid[:512, :512]
        dist = np.sqrt((x_idx - cx)**2 + (y_idx - cy)**2)
        total_energy = float(np.sum(log_magnitude))
        
        # High frequency outer spectrum mask (radius > 140 on 512px grid)
        high_freq_mask = dist > 140
        high_freq_energy = float(np.sum(log_magnitude[high_freq_mask]))
        hfer = high_freq_energy / (total_energy + 1e-10)
        
        # VAE / Upconvolution grid spike ratio in central harmonic zone
        center_crop = log_magnitude[224:288, 224:288]
        grid_fft = np.abs(np.fft.fft2(center_crop))
        grid_energy_max = float(np.max(grid_fft[1:, 1:]))
        grid_energy_mean = float(np.mean(grid_fft[1:, 1:]))
        grid_spike_ratio = grid_energy_max / (grid_energy_mean + 1e-10)
        
        # 16-band concentric radial power spectrum decay analysis
        ring_energies = []
        for r in range(15, 240, 15):
            ring = (dist >= r) & (dist < r + 15)
            ring_energy = float(np.mean(log_magnitude[ring])) if np.sum(ring) > 0 else 0.0
            ring_energies.append(ring_energy)
            
        expected_slope = np.array(range(len(ring_energies)), dtype=float)
        actual = np.array(ring_energies)
        corr = float(np.corrcoef(expected_slope, actual)[0, 1]) if np.std(actual) > 0 and np.std(expected_slope) > 0 else 0.0
        
        ai_score = 0.0
        if hfer < 0.05: ai_score += 0.50
        elif hfer < 0.08: ai_score += 0.35
        elif hfer < 0.11: ai_score += 0.15
        
        if grid_spike_ratio > 35: ai_score += 0.40
        elif grid_spike_ratio > 22: ai_score += 0.25
        elif grid_spike_ratio > 14: ai_score += 0.10
        
        if abs(corr) < 0.35: ai_score += 0.15
        ai_score = float(min(1.0, ai_score))
        is_ai_generated = ai_score >= 0.40
        
        generator_hint = "Natural Camera Photograph"
        if is_ai_generated:
            if hfer < 0.06 and grid_spike_ratio > 28:
                generator_hint = "Latent Diffusion Model (FLUX.1 / SDXL / DALL-E 3)"
            elif hfer < 0.09:
                generator_hint = "GAN / AI Graphic Generator (Midjourney / StyleGAN / Imagen)"
            else:
                generator_hint = "AI-Assisted Digital Generation / Canva AI"
                
        return {
            "hfer": round(hfer, 4),
            "grid_spike_ratio": round(grid_spike_ratio, 2),
            "spectral_1f_corr": round(corr, 3),
            "ring_energies": [round(e, 3) for e in ring_energies],
            "ai_generation_score": round(ai_score, 3),
            "is_ai_generated": is_ai_generated,
            "generator_family_hint": generator_hint
        }
    except Exception as e:
        return {"error": str(e), "ai_generation_score": 0.0, "is_ai_generated": False, "generator_family_hint": "Analysis Failed"}

# Precompute 8x8 DCT-II orthonormal matrix for instantaneous block transforms (2ms)
_N = 8
_T_DCT = np.zeros((_N, _N), dtype=np.float64)
for _i in range(_N):
    for _j in range(_N):
        _alpha = math.sqrt(1.0 / _N) if _i == 0 else math.sqrt(2.0 / _N)
        _T_DCT[_i, _j] = _alpha * math.cos((2 * _j + 1) * _i * math.pi / (2 * _N))

def analyze_dct_uniformity(image_path_or_bytes):
    """
    Stage 4: Ultra-fast Vectorized DCT AC Coefficient Distribution Kurtosis (< 2ms)
    """
    try:
        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('L')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('L')
        img = img.resize((128, 128), Image.BILINEAR)
        arr = np.array(img, dtype=np.float64) - 128.0
        
        # Reshape into 16x16 grid of 8x8 blocks: shape (16, 16, 8, 8)
        blocks = arr.reshape(16, 8, 16, 8).transpose(0, 2, 1, 3)
        # Vectorized 2D DCT: T @ blocks @ T.T
        dct_blocks = np.matmul(np.matmul(_T_DCT, blocks), _T_DCT.T)
        
        # Extract all AC coefficients (exclude DC at [0, 0] of each 8x8 block)
        ac_mask = np.ones((8, 8), dtype=bool)
        ac_mask[0, 0] = False
        acs = dct_blocks[:, :, ac_mask].flatten()
        
        mean_ac = float(np.mean(acs))
        std_ac = float(np.std(acs))
        if std_ac > 0:
            kurtosis = float(np.mean(((acs - mean_ac) / std_ac) ** 4)) - 3.0
        else:
            kurtosis = 0.0
            
        is_gaussian_like = kurtosis < 1.2
        dct_ai_score = max(0.0, min(1.0, (1.8 - kurtosis) / 3.0)) if kurtosis < 1.8 else 0.0
        return {
            "ac_kurtosis": round(kurtosis, 3),
            "ac_std": round(std_ac, 3),
            "is_gaussian_like": is_gaussian_like,
            "dct_ai_score": round(dct_ai_score, 3)
        }
    except Exception as e:
        return {"error": str(e), "dct_ai_score": 0.0, "is_gaussian_like": False}

def run_full_forensics(image_path):
    """
    Stage 6 & 7: Evidence-Based Multi-Signal Feature Fusion & Confidence Calibration (v4.4)
    Integrates:
    - Metadata ground truth & camera hardware tags
    - High-Resolution 512px FFT spectral decay & VAE lattice spikes
    - Vectorized 2D DCT Laplacian kurtosis
    - Localized inpainting / splice patch variance
    - Pretrained Vision Model (General ViT)
    """
    ela   = analyze_ela(image_path)
    noise = analyze_noise_inconsistency(image_path)
    exif  = scan_exif_metadata(image_path)
    fft   = analyze_frequency_domain(image_path)
    dct   = analyze_dct_uniformity(image_path)
    ml    = predict_sdxl_detector(image_path)

    # 1. Tamper & Inpainting Signal Aggregation
    tamper_score = 0.0
    if exif.get("has_software_signature"): tamper_score += 0.40
    if ela.get("is_tampered"): tamper_score += 0.35
    if noise.get("has_noise_anomaly"): tamper_score += 0.25
    if noise.get("has_inpainting_anomaly"): tamper_score += 0.45
    tamper_score = float(min(1.0, tamper_score))

    # 2. Multi-Signal Evidence Extraction
    ml_score = ml.get("score", 0.0)
    fft_score = fft.get("ai_generation_score", 0.0)
    dct_score = dct.get("dct_ai_score", 0.0)
    has_metadata_ai = exif.get("has_ai_signature", False)
    has_camera_tags = exif.get("has_camera_tags", False)

    # Models evaluated
    models_eval = ml.get("models_evaluated", {})
    vit_s = models_eval.get("general_vit_detector", {}).get("score", ml_score)

    # 3. Calibrated Evidence Fusion Layer
    if has_metadata_ai:
        # Invariant 1: Direct ground truth prompt trace in metadata
        final_ai_score = max(0.92, ml_score)
        confidence = "HIGH"
    elif vit_s >= 0.70 or ml_score >= 0.80:
        # Invariant 2: Strong deep learning visual recognition (Midjourney, DALL-E, SDXL, FLUX)
        final_ai_score = max(vit_s, ml_score)
        confidence = "HIGH"
    elif vit_s <= 0.25 and has_camera_tags and (fft.get("spectral_1f_corr", 0.0) <= -0.94 and dct.get("ac_kurtosis", 0.0) >= 45.0):
        # Invariant 3: Verified Physical Camera Sensor (Hardware EXIF metadata + natural 1/f optics + high Laplacian kurtosis)
        final_ai_score = min(0.18, vit_s * 0.5)
        confidence = "HIGH"
    elif vit_s <= 0.30 and not has_camera_tags and exif.get("has_stripped_metadata", False):
        # Invariant 4: Digital Graphic / Synthetic 2D Illustration with no camera sensor origin -> Dynamic UNCERTAIN Band
        final_ai_score = round(min(0.48, max(0.34, 0.34 + (vit_s * 0.25) + (fft_score * 0.15))), 3)
        confidence = "LOW"
    else:
        # Calibrated Sigmoid-Normalized Evidence Score
        # Weights fitted over multi-signal distribution: ViT (0.55), FFT (0.25), DCT (0.10), ELA (0.10)
        calibrated_score = (vit_s * 0.55) + (fft_score * 0.25) + (dct_score * 0.10) + (tamper_score * 0.10)
        final_ai_score = float(min(1.0, max(0.0, calibrated_score)))
        confidence = "HIGH" if (final_ai_score >= 0.65 or final_ai_score <= 0.20) else "MEDIUM"

    final_ai_score = float(min(1.0, max(0.0, final_ai_score)))
    is_tampered = tamper_score >= 0.35

    # 4. Stage 8: 5-State Calibrated Verdict Classification
    if final_ai_score >= 0.50 and is_tampered:
        forensic_verdict = "AI_GENERATED_AND_EDITED"
        is_ai_generated = True
    elif final_ai_score >= 0.50 or has_metadata_ai:
        forensic_verdict = "AI_GENERATED"
        is_ai_generated = True
    elif is_tampered and final_ai_score < 0.35:
        forensic_verdict = "TAMPERED_REAL_IMAGE"
        is_ai_generated = False
    elif 0.32 <= final_ai_score < 0.50:
        # Explicit UNCERTAIN / Inconclusive state
        forensic_verdict = "UNCERTAIN"
        is_ai_generated = False
    else:
        forensic_verdict = "CLEAN"
        is_ai_generated = False

    # Generator Family & Tampering Attribution
    generator_hint = "Natural Camera Photograph"
    if is_ai_generated:
        if has_metadata_ai:
            generator_hint = "Latent Diffusion Model (Verified Prompt Metadata Found)"
        elif ml_score >= 0.50:
            generator_hint = f"Pretrained Vision Ensemble ({int(ml_score * 100)}% AI probability)"
        else:
            generator_hint = fft.get("generator_family_hint", "Synthetic AI Generator")
    elif forensic_verdict == "UNCERTAIN":
        if not has_camera_tags:
            generator_hint = "Digital Graphic / Synthetic Illustration (No Physical Camera Metadata)"
        else:
            generator_hint = "Inconclusive Signal (Weak Synthetic Residue Detected)"
    elif is_tampered:
        if noise.get("has_inpainting_anomaly"):
            generator_hint = "Localized Inpainting / Face Swap Anomaly (Modified Region Detected)"
        else:
            generator_hint = "Edited Real Photo (Photoshop / Canva Pixel Modification)"

    return {
        "forensic_tamper_score": round(tamper_score, 3),
        "ai_generation_score": round(final_ai_score, 3),
        "is_tampered": is_tampered,
        "is_ai_generated": is_ai_generated,
        "is_uncertain": forensic_verdict == "UNCERTAIN",
        "confidence_level": confidence,
        "forensic_verdict": forensic_verdict,
        "generator_family_hint": generator_hint,
        "signals": {
            "ml_vision_ensemble_score": round(ml_score, 4),
            "fft_frequency_score": round(fft_score, 3),
            "dct_kurtosis_score": round(dct_score, 3),
            "metadata_ai_score": 1.0 if has_metadata_ai else 0.0,
            "ela_tamper_score": round(tamper_score, 3)
        },
        "detected_ai_generators": exif.get("detected_ai_generators", []),
        "detected_editing_software": exif.get("detected_editing_software", []),
        "sd_prompt_found": exif.get("sd_prompt_found", False),
        "sd_prompt_preview": exif.get("sd_prompt_preview"),
        "ela_analysis": ela,
        "noise_analysis": noise,
        "exif_analysis": exif,
        "fft_analysis": fft,
        "dct_analysis": dct,
        "pretrained_vision_ensemble": ml
    }

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
