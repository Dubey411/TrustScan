import sys
import os
import io
import json
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'cache')
os.makedirs(CACHE_DIR, exist_ok=True)

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
    Optimized Fast Pretrained Vision Ensemble:
    1. Runs Organika/sdxl-detector (SDXL Expert) first (~150ms).
    2. If high confidence (> 0.60), returns immediately for sub-second latency.
    3. If low/inconclusive, runs umm-maybe/AI-image-detector (General ViT) to catch Midjourney/DALL-E.
    """
    try:
        from PIL import Image

        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('RGB')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('RGB')

        model_results = {}
        ai_scores = []

        # Model 1: Organika/sdxl-detector (Primary Diffusion Expert)
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
                model_results["sdxl_detector"] = {"score": round(s_score, 4)}
                ai_scores.append(s_score)

                # FAST PATH: If SDXL expert is already highly confident, return immediately!
                if s_score >= 0.70:
                    return {
                        "score": round(s_score, 4),
                        "is_ai": True,
                        "label": "artificial",
                        "method": "fast_sdxl_detector",
                        "models_evaluated": model_results,
                        "all_scores": [{"model": "sdxl_detector", "score": round(s_score, 4)}]
                    }
            except Exception as e:
                model_results["sdxl_detector"] = {"error": str(e)}

        # Model 2: umm-maybe/AI-image-detector (General ViT - Midjourney / DALL-E / FLUX Expert)
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
                model_results["general_vit_detector"] = {"score": round(v_score, 4)}
                ai_scores.append(v_score)
            except Exception as e:
                model_results["general_vit_detector"] = {"error": str(e)}

        if ai_scores:
            max_score = max(ai_scores)
            avg_score = sum(ai_scores) / len(ai_scores)
            ensemble_score = max_score if max_score >= 0.50 else (avg_score * 0.7 + max_score * 0.3)
            
            return {
                "score": round(ensemble_score, 4),
                "is_ai": ensemble_score >= 0.40,
                "label": "artificial" if ensemble_score >= 0.40 else "human",
                "method": "fast_vision_ensemble (SDXL + General ViT)",
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
        print(json.dumps({"info": "Pass image path as argument to run Fast Pretrained Vision Ensemble."}))
