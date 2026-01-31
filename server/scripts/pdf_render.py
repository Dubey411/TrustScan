
import sys
import fitz  # PyMuPDF
import json
import base64
import os

def render_specific_page(pdf_path, page_index, scale=2.0):
    """
    Renders ONLY one specific page to minimize memory usage.
    """
    try:
        doc = fitz.open(pdf_path)
        if page_index < 0 or page_index >= len(doc):
            return {"success": False, "error": f"Page {page_index} out of range"}
            
        page = doc.load_page(page_index)
        
        # Scaling logic to prevent massive memory spikes
        # 2.0 scale at 72 DPI = 144 DPI (good for OCR)
        mat = fitz.Matrix(scale, scale)
        pix = page.get_pixmap(matrix=mat)
        
        # Convert to PNG buffer
        png_data = pix.tobytes("png")
        
        result = {
            "success": True,
            "page": page_index + 1,
            "image": base64.b64encode(png_data).decode('utf-8'),
            "width": pix.width,
            "height": pix.height
        }
        
        doc.close()
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Expect: pdf_path page_index scale
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else ""
    page_idx = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    scale = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
    
    if not pdf_path:
        print(json.dumps({"success": False, "error": "No PDF path provided"}))
        sys.exit(1)
        
    result = render_specific_page(pdf_path, page_idx, scale)
    print(json.dumps(result))
