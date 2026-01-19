import sys
import os

print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")

try:
    import fitz
    print("✅ PyMuPDF (fitz) imported successfully")
    print(f"   Version: {fitz.__version__}")
except ImportError as e:
    print(f"❌ Failed to import fitz: {e}")

try:
    import easyocr
    print("✅ EasyOCR imported successfully")
    # reader = easyocr.Reader(['en'], gpu=False) # This takes time, maybe skip for quick check or do it?
    # print("✅ EasyOCR Reader initialized")
except ImportError as e:
    print(f"❌ Failed to import easyocr: {e}")

try:
    import PIL
    print("✅ Pillow (PIL) imported successfully")
except ImportError as e:
    print(f"❌ Failed to import PIL: {e}")
