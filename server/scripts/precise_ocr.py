import sys
import os
import json
import base64
import easyocr
import io
import fitz  # PyMuPDF
from PIL import Image

def process_image(reader, image_data):
    """Internal helper to OCR an image or bytes"""
    print(f"DEBUG: [EasyOCR] Reading text from image data...", file=sys.stderr)
    result = reader.readtext(image_data)
    print(f"DEBUG: [EasyOCR] Found {len(result)} text regions.", file=sys.stderr)
    text = " ".join([res[1] for res in result])
    confidences = [res[2] for res in result]
    avg_conf = sum(confidences) / len(confidences) if confidences else 0
    return text, avg_conf

def process_ocr(input_path):
    print(f"DEBUG: [OCR Process] Starting for path: {input_path}", file=sys.stderr)
    try:
        if not os.path.exists(input_path):
            print(f"DEBUG: [OCR Process] ERROR: File not found at {input_path}", file=sys.stderr)
            return {"success": False, "error": "File not found"}

        # Initialize reader
        print(f"DEBUG: [EasyOCR] Initializing Reader (English, no GPU)...", file=sys.stderr)
        reader = easyocr.Reader(['en'], gpu=False)
        print(f"DEBUG: [EasyOCR] Reader initialized.", file=sys.stderr)
        
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
                    print(f"DEBUG: [Page {page_num + 1}] Rendering pixmap (2x zoom)...", file=sys.stderr)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_data = pix.tobytes("png")
                    print(f"DEBUG: [Page {page_num + 1}] Image rendering complete ({len(img_data)} bytes).", file=sys.stderr)
                    
                    text, conf = process_image(reader, img_data)
                    print(f"DEBUG: [Page {page_num + 1}] OCR Complete. Text length: {len(text)}", file=sys.stderr)
                    all_text.append(text)
                    all_confidences.append(conf)
                except Exception as page_e:
                    print(f"❌ Error processing page {page_num}: {page_e}", file=sys.stderr)
                    all_text.append(f"[Page {page_num + 1} Error]")
            doc.close()
        else:
            # Standard Image
            print(f"DEBUG: [Image] Processing standard image...", file=sys.stderr)
            text, conf = process_image(reader, input_path)
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
