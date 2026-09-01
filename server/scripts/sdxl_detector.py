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
        # ⚡ Instant Offline Load: Check local cache first with ZERO network latency
        try:
            pipe = pipeline("image-classification", model=model_id, model_kwargs={"cache_dir": CACHE_DIR, "local_files_only": True})
            _PIPELINES[model_id] = pipe
            return pipe
        except Exception:
            # Fallback to online download once if not yet cached
            pipe = pipeline("image-classification", model=model_id, model_kwargs={"cache_dir": CACHE_DIR})
            _PIPELINES[model_id] = pipe
            return pipe
    except Exception as e:
        return None

def predict_sdxl_detector(image_path_or_bytes):
    """
    High-Performance General Vision Classifier (< 200ms)
    Uses umm-maybe/AI-image-detector (General ViT trained on Midjourney, DALL-E, SDXL, and Real photos)
    """
    try:
        from PIL import Image
        import torch
        torch.set_num_threads(4)

        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('RGB')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('RGB')

        # Fast smart downscaling to 384px max for sub-200ms ViT inference
        if max(img.size) > 384:
            img.thumbnail((384, 384), Image.BILINEAR)

        pipe_vit = get_pipeline("umm-maybe/AI-image-detector")
        if not pipe_vit:
            # Fallback to SDXL detector if ViT not cached
            pipe_vit = get_pipeline("Organika/sdxl-detector")

        if pipe_vit:
            res = pipe_vit(img)
            v_score = 0.0
            for item in res:
                lbl = str(item.get('label', '')).lower()
                score = float(item.get('score', 0.0))
                if lbl in ['artificial', 'ai', 'fake', 'generated', 'synthetic', 'sdxl']:
                    v_score = score
                elif lbl in ['human', 'real', 'natural', 'authentic'] and v_score == 0.0:
                    v_score = 1.0 - score

            model_name = "general_vit_detector"
            return {
                "score": round(v_score, 4),
                "is_ai": v_score >= 0.50,
                "label": "artificial" if v_score >= 0.50 else "human",
                "method": "general_vit_classifier",
                "models_evaluated": {model_name: {"score": round(v_score, 4)}},
                "all_scores": [{"model": model_name, "score": round(v_score, 4)}]
            }

        return {"score": 0.0, "is_ai": False, "label": "human", "method": "none", "models_evaluated": {}}
    except Exception as e:
        return {"error": str(e), "score": 0.0, "is_ai": False, "label": "error", "models_evaluated": {}}

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
