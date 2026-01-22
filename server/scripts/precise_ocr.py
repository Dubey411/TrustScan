import sys
import os
import json
import pytesseract
import fitz  # PyMuPDF
from PIL import Image
import io

def process_image(image_data):
    """Internal helper to OCR an image or bytes using Tesseract"""
    try:
        print(f"DEBUG: [Tesseract] Reading text from image data...", file=sys.stderr)
        # Convert bytes to PIL Image if needed
        if isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data))
        else:
            image = Image.open(image_data)
            
        text = pytesseract.image_to_string(image)
        print(f"DEBUG: [Tesseract] Extraction complete (Length: {len(text)}).", file=sys.stderr)
        return text, 0.85 # Tesseract doesn't give a simple per-page confidence easily, returning fixed high placeholder
    except Exception as e:
        print(f"DEBUG: [Tesseract] Image Error: {str(e)}", file=sys.stderr)
        return "", 0

def process_ocr(input_path):
    print(f"DEBUG: [OCR Process] Starting (Lighter Tesseract Version) for: {input_path}", file=sys.stderr)
    try:
        if not os.path.exists(input_path):
            return {"success": False, "error": "File not found"}

        all_text = []
        all_confidences = []
        
        # Check if PDF
        if input_path.lower().endswith('.pdf'):
            print(f"DEBUG: [PyMuPDF] Opening PDF...", file=sys.stderr)
            doc = fitz.open(input_path)
            print(f"DEBUG: [PyMuPDF] PDF opened. Pages: {len(doc)}", file=sys.stderr)
            
            for page_num in range(len(doc)):
                try:
                    print(f"DEBUG: [Page {page_num + 1}] Loading page...", file=sys.stderr)
                    page = doc.load_page(page_num)
                    # 2x zoom usually enough for Tesseract
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_data = pix.tobytes("png")
                    
                    text, conf = process_image(img_data)
                    all_text.append(text)
                    all_confidences.append(conf)
                except Exception as page_e:
                    print(f"❌ Error processing page {page_num}: {page_e}", file=sys.stderr)
                    all_text.append(f"[Page {page_num + 1} Error]")
            doc.close()
        else:
            # Standard Image
            text, conf = process_image(input_path)
            all_text.append(text)
            all_confidences.append(conf)
            
        final_text = "\n".join(all_text)
        final_conf = sum(all_confidences) / len(all_confidences) if all_confidences else 0
        
        print(f"DEBUG: [OCR Complete] Total Text Length: {len(final_text)}", file=sys.stderr)
        return {
            "success": True,
            "text": final_text,
            "confidence": final_conf
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
