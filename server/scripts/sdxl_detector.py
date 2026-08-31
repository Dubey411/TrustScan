import sys
import os
import io
import json
import urllib.request
import ssl

def predict_sdxl_detector(image_path_or_bytes):
    """
    Evaluates an image using Organika/sdxl-detector model.
    First attempts local transformers pipeline; falls back to HuggingFace API if available.
    Returns: {"score": float (0.0 to 1.0), "label": str, "method": str}
    """
    # Strategy 1: Local Transformers Pipeline
    try:
        from transformers import pipeline
        from PIL import Image

        if isinstance(image_path_or_bytes, str):
            img = Image.open(image_path_or_bytes).convert('RGB')
        else:
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('RGB')

        # Cache model locally in server/models/cache
        cache_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'cache')
        os.makedirs(cache_dir, exist_ok=True)

        pipe = pipeline("image-classification", model="Organika/sdxl-detector", model_kwargs={"cache_dir": cache_dir})
        results = pipe(img)
        
        # Results format: [{'label': 'artificial', 'score': 0.98}, {'label': 'human', 'score': 0.02}]
        ai_score = 0.0
        label_detected = "human"
        for item in results:
            lbl = str(item.get('label', '')).lower()
            score = float(item.get('score', 0.0))
            if lbl in ['artificial', 'ai', 'fake', 'generated', 'sdxl', 'synthetic']:
                ai_score = score
                label_detected = item.get('label')
            elif lbl in ['human', 'real', 'natural', 'authentic']:
                if ai_score == 0.0:
                    ai_score = 1.0 - score

        return {
            "score": round(ai_score, 4),
            "is_ai": ai_score > 0.40,
            "label": label_detected,
            "method": "local_transformers_sdxl_detector",
            "all_scores": results
        }
    except Exception as local_err:
        pass

    # Strategy 2: Hugging Face Inference API / Router API
    hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")
    if hf_token:
        try:
            if isinstance(image_path_or_bytes, str):
                with open(image_path_or_bytes, 'rb') as f:
                    img_data = f.read()
            else:
                img_data = image_path_or_bytes

            url = "https://router.huggingface.co/hf-inference/models/Organika/sdxl-detector"
            req = urllib.request.Request(
                url,
                data=img_data,
                headers={
                    "Content-Type": "image/jpeg",
                    "Authorization": f"Bearer {hf_token}",
                    "User-Agent": "CheckIt-AI-Detector/1.0"
                }
            )
            ctx = ssl.create_default_context()
            with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
                res = json.loads(resp.read().decode())
                ai_score = 0.0
                label_detected = "human"
                for item in res:
                    lbl = str(item.get('label', '')).lower()
                    score = float(item.get('score', 0.0))
                    if lbl in ['artificial', 'ai', 'fake', 'generated', 'sdxl']:
                        ai_score = score
                        label_detected = item.get('label')

                return {
                    "score": round(ai_score, 4),
                    "is_ai": ai_score > 0.40,
                    "label": label_detected,
                    "method": "hf_api_sdxl_detector",
                    "all_scores": res
                }
        except Exception as api_err:
            pass

    return {
        "score": 0.0,
        "is_ai": False,
        "label": "unknown",
        "method": "fallback_none"
    }

if __name__ == '__main__':
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        res = predict_sdxl_detector(sys.argv[1])
        print(json.dumps(res, indent=2))
    else:
        print(json.dumps({"info": "Pass image path as argument to run Organika/sdxl-detector model."}))
