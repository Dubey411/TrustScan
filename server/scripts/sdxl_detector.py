import sys
import os
import io
import json
import urllib.request
import ssl

# Cache directory for models
CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'cache')
os.makedirs(CACHE_DIR, exist_ok=True)

# Global pipelines cached in memory across invocations if python daemon/process persists
_PIPELINES = {}

def get_pipeline(model_id):
    if model_id in _PIPELINES:
        return _PIPELINES[model_id]
    try:
        from transformers import pipeline
        pipe = pipeline("image-classification", model=model_id, model_kwargs={"cache_dir": CACHE_DIR})
        _PIPELINES[model_id] = pipe
        return pipe
    except Exception as e:
        return None

def predict_sdxl_detector(image_path_or_bytes):
    """
    Evaluates an image using an ensemble of Pretrained AI Image Classifiers:
    1. Organika/sdxl-detector (SDXL / Diffusion Specialist)
    2. umm-maybe/AI-image-detector (General ViT - Midjourney / DALL-E / SD Specialist)
    3. prithivMLmods/Deep-Fake-Detector-Model (Synthetic / DeepFake Specialist)

    Returns: {
        "score": float (0.0 to 1.0),
        "is_ai": bool,
        "label": str,
        "method": str,
        "models_evaluated": dict
    }
    """
    try:
        from PIL import Image

        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('RGB')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('RGB')

        model_results = {}
        ai_scores = []

        # Model 1: Organika/sdxl-detector (SDXL Expert)
        pipe_sdxl = get_pipeline("Organika/sdxl-detector")
        if pipe_sdxl:
            try:
                res_sdxl = pipe_sdxl(img)
                s_score = 0.0
                for item in res_sdxl:
                    lbl = str(item.get('label', '')).lower()
                    score = float(item.get('score', 0.0))
                    if lbl in ['artificial', 'ai', 'fake', 'generated', 'sdxl', 'synthetic']:
                        s_score = score
                    elif lbl in ['human', 'real', 'natural', 'authentic'] and s_score == 0.0:
                        s_score = 1.0 - score
                model_results["sdxl_detector"] = {"score": round(s_score, 4), "raw": res_sdxl}
                ai_scores.append(s_score)
            except Exception as e:
                model_results["sdxl_detector"] = {"error": str(e)}

        # Model 2: umm-maybe/AI-image-detector (ViT General AI Expert: Midjourney / DALL-E / SD)
        pipe_vit = get_pipeline("umm-maybe/AI-image-detector")
        if pipe_vit:
            try:
                res_vit = pipe_vit(img)
                v_score = 0.0
                for item in res_vit:
                    lbl = str(item.get('label', '')).lower()
                    score = float(item.get('score', 0.0))
                    if lbl in ['artificial', 'ai', 'fake', 'generated', 'synthetic']:
                        v_score = score
                    elif lbl in ['human', 'real', 'natural', 'authentic'] and v_score == 0.0:
                        v_score = 1.0 - score
                model_results["general_vit_detector"] = {"score": round(v_score, 4), "raw": res_vit}
                ai_scores.append(v_score)
            except Exception as e:
                model_results["general_vit_detector"] = {"error": str(e)}

        # Model 3: prithivMLmods/Deep-Fake-Detector-Model
        pipe_df = get_pipeline("prithivMLmods/Deep-Fake-Detector-Model")
        if pipe_df:
            try:
                res_df = pipe_df(img)
                df_score = 0.0
                for item in res_df:
                    lbl = str(item.get('label', '')).lower()
                    score = float(item.get('score', 0.0))
                    if lbl in ['fake', 'artificial', 'ai', 'generated']:
                        df_score = score
                    elif lbl in ['real', 'human'] and df_score == 0.0:
                        df_score = 1.0 - score
                model_results["deepfake_detector"] = {"score": round(df_score, 4), "raw": res_df}
                ai_scores.append(df_score)
            except Exception as e:
                model_results["deepfake_detector"] = {"error": str(e)}

        if ai_scores:
            # Ensemble aggregation: Maximum single-model high-confidence detection with cross-model reinforcement
            max_score = max(ai_scores)
            avg_score = sum(ai_scores) / len(ai_scores)
            # If any specialist model fires > 0.50, trust the specialist with gentle cross-weighting
            ensemble_score = max_score if max_score >= 0.50 else (avg_score * 0.7 + max_score * 0.3)
            
            return {
                "score": round(ensemble_score, 4),
                "is_ai": ensemble_score >= 0.40,
                "label": "artificial" if ensemble_score >= 0.40 else "human",
                "method": "pretrained_vision_ensemble (SDXL + General ViT + DeepFake)",
                "models_evaluated": model_results,
                "all_scores": [{"model": k, "score": v.get("score", 0.0)} for k, v in model_results.items() if "score" in v]
            }

    except Exception as local_err:
        pass

    return {
        "score": 0.0,
        "is_ai": False,
        "label": "unknown",
        "method": "fallback_none",
        "models_evaluated": {}
    }

if __name__ == '__main__':
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        res = predict_sdxl_detector(sys.argv[1])
        print(json.dumps(res, indent=2))
    else:
        print(json.dumps({"info": "Pass image path as argument to run Pretrained Vision Ensemble."}))
