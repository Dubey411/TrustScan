import os
import sys
import json

"""
========================================================================================
TRUSTSCAN AI — ROBOFLOW INDIAN CARD DATASETS LOADER & SPECIFICATION
========================================================================================
Datasets:
1. Aadhaar Card Detection Dataset:
   URL: https://universe.roboflow.com/swaroopai-wrgij/card_detection_better
   Classes: ["Aadhaar_Card", "Aadhaar_Number", "DOB", "Gender", "Name", "Photo", "QR_Code", "Emblem"]

2. PAN Card Detection Dataset:
   URL: https://universe.roboflow.com/aadhar-wrezd/pancard-dtefw
   Classes: ["pan_card", "pan_number", "name", "father_name", "dob", "signature", "photo", "income_tax_logo"]
========================================================================================
"""

ROBOFLOW_CONFIG = {
    "aadhaar_dataset": {
        "workspace": "swaroopai-wrgij",
        "project": "card_detection_better",
        "url": "https://universe.roboflow.com/swaroopai-wrgij/card_detection_better",
        "classes": ["Aadhaar_Card", "Aadhaar_Number", "DOB", "Gender", "Name", "Photo", "QR_Code", "Emblem"]
    },
    "pan_dataset": {
        "workspace": "aadhar-wrezd",
        "project": "pancard-dtefw",
        "url": "https://universe.roboflow.com/aadhar-wrezd/pancard-dtefw",
        "classes": ["pan_card", "pan_number", "name", "father_name", "dob", "signature", "photo", "income_tax_logo"]
    }
}

def generate_download_instructions():
    print("===================================================================")
    print("ROBOFLOW INDIAN CARD DATASETS CONFIGURATION")
    print("===================================================================\n")
    
    for key, cfg in ROBOFLOW_CONFIG.items():
        print(f"[*] Dataset: {key.upper()}")
        print(f"   URL: {cfg['url']}")
        print(f"   Annotation Classes: {', '.join(cfg['classes'])}")
        print(f"   Python Download Snippet:")
        print(f"     from roboflow import Roboflow")
        print(f"     rf = Roboflow(api_key='YOUR_ROBOFLOW_KEY')")
        print(f"     project = rf.workspace('{cfg['workspace']}').project('{cfg['project']}')")
        print(f"     dataset = project.version(1).download('yolov8')\n")
        
    print("===================================================================")

if __name__ == '__main__':
    generate_download_instructions()
