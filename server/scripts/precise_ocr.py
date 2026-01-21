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
    result = reader.readtext(image_data)
    text = " ".join([res[1] for res in result])
    confidences = [res[2] for res in result]
    avg_conf = sum(confidences) / len(confidences) if confidences else 0
    return text, avg_conf

def process_ocr(input_path):
    try:
        # Initialize reader
        print(f"DEBUG: Initializing EasyOCR Reader...", file=sys.stderr)
        reader = easyocr.Reader(['en'], gpu=False)
        print(f"DEBUG: EasyOCR Reader initialized successfully", file=sys.stderr)
        
        all_text = []
        all_confidences = []
        
        # Check if PDF
        if input_path.lower().endswith('.pdf'):
            doc = fitz.open(input_path)
            print(f"DEBUG: Processing PDF with {len(doc)} pages", file=sys.stderr)
            for page_num in range(len(doc)):
                try:
                    print(f"DEBUG: Processing Page {page_num + 1}/{len(doc)}", file=sys.stderr)
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better OCR
                    img_data = pix.tobytes("png")
                    
                    text, conf = process_image(reader, img_data)
                    all_text.append(text)
                    all_confidences.append(conf)
                    print(f"DEBUG: Finished Page {page_num + 1}", file=sys.stderr)
                except Exception as page_e:
                    print(f"❌ Error processing page {page_num}: {page_e}", file=sys.stderr)
                    all_text.append(f"[Page {page_num + 1} Error]")
                    # Continue to next page
            doc.close()
        else:
            # Standard Image
            text, conf = process_image(reader, input_path)
            all_text.append(text)
            all_confidences.append(conf)
            
        final_text = "\n".join(all_text)
        final_conf = sum(all_confidences) / len(all_confidences) if all_confidences else 0
        
        return {
            "success": True,
            "text": final_text,
            "confidence": final_conf
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No input path provided"}))
        sys.exit(1)
        
    input_path = sys.argv[1]
    
    if os.path.exists(input_path):
        output = process_ocr(input_path)
    else:
        output = {"success": False, "error": f"Path not found: {input_path}"}

    print(json.dumps(output))
