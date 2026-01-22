import sys
import os
import json
import pytesseract
import fitz  # PyMuPDF
from PIL import Image
import io
import cv2
import numpy as np

def preprocess_image(image_bytes):
    """
    Advanced preprocessing for Tesseract to improve accuracy
    - Grayscale
    - Denoise
    - Thresholding
    """
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None

        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Rescale (300 DPI equivalent) - simple upscaling if small
        height, width = gray.shape
        if width < 1500:
            scale = 2
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # 3. Denoising
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # 4. Adaptive Thresholding
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )

        return thresh
    except Exception as e:
        print(f"DEBUG: [OpenCV] Preprocessing Error: {str(e)}", file=sys.stderr)
        return None

def process_ocr(input_path):
    print(f"DEBUG: [OCR Process] Starting (Advanced Tesseract) for: {input_path}", file=sys.stderr)
    try:
        if not os.path.exists(input_path):
            return {"success": False, "error": "File not found"}

        all_text = []
        
        # Check if PDF
        if input_path.lower().endswith('.pdf'):
            doc = fitz.open(input_path)
            for page_num in range(len(doc)):
                try:
                    page = doc.load_page(page_num)
                    # Use higher zoom for cleaner source image
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_bytes = pix.tobytes("png")
                    
                    # Preprocess
                    processed_img = preprocess_image(img_bytes)
                    if processed_img is not None:
                        # Convert back to PIL for Tesseract
                        pil_img = Image.fromarray(processed_img)
                        text = pytesseract.image_to_string(pil_img)
                    else:
                        # Fallback to direct bytes
                        text = pytesseract.image_to_string(Image.open(io.BytesIO(img_bytes)))
                        
                    all_text.append(text)
                except Exception as page_e:
                    print(f"❌ Error processing page {page_num}: {page_e}", file=sys.stderr)
                    all_text.append(f"[Page {page_num + 1} Error]")
            doc.close()
        else:
            # Standard Image
            with open(input_path, "rb") as f:
                img_bytes = f.read()
            processed_img = preprocess_image(img_bytes)
            if processed_img is not None:
                text = pytesseract.image_to_string(Image.fromarray(processed_img))
            else:
                text = pytesseract.image_to_string(Image.open(input_path))
            all_text.append(text)
            
        final_text = "\n".join(all_text)
        
        return {
            "success": True,
            "text": final_text,
            "confidence": 0.85
        }
    except Exception as e:
        print(f"DEBUG: [OCR Process] FATAL ERROR: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No input path provided"}))
        sys.exit(1)
        
    input_path = sys.argv[1]
    output = process_ocr(input_path)
    print(json.dumps(output))
