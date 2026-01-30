import os
import sys
import shutil
import json
from datetime import datetime

"""
=========================================================================================
TRUSTSCAN AI ROLLBACK UTILITY
"Reversibility is a core mission pillar."
=========================================================================================
This script helps admins or automated agents to restore a previous model version
if a deployment causes issues or violates trust.
"""

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
BASE_PATH = os.path.join(ROOT_DIR, 'services')
WEIGHTS_PATH = os.path.join(BASE_PATH, 'weights.json')
VERSION_PATH = os.path.join(BASE_PATH, 'models')

def list_versions():
    if not os.path.exists(VERSION_PATH):
        print("No version history found.")
        return []
    
    files = sorted([f for f in os.listdir(VERSION_PATH) if f.startswith('weights_v')], reverse=True)
    return files

def rollback(target_version=None):
    versions = list_versions()
    if not versions:
        print("❌ Rollback Failed: No history available.")
        return

    print("📜 Available Versions:")
    for i, v in enumerate(versions):
        print(f"[{i}] {v}")

    if target_version is None:
        # Default: Rollback to previous (index 1, as index 0 is likely the current bad one if we just deployed)
        # Actually, let's just ask user or pick index 0 if it's a specific file request
        # If run automatically without args, verify what "rollback" means.
        # Usually means "Undo last deployment".
        if len(versions) > 1:
            target = versions[1] # The one before the latest
            print(f"\nTargeting previous version: {target}")
        else:
            print("\n❌ Only one version exists. Cannot rollback.")
            return
    else:
        target = target_version

    source_path = os.path.join(VERSION_PATH, target)
    if not os.path.exists(source_path):
        print(f"❌ Target version {target} not found.")
        return

    # Perform Rollback
    print(f"🔄 Rolling back production weights to {target}...")
    try:
        shutil.copy2(source_path, WEIGHTS_PATH)
        print("✅ Rollback Successful. System restored to trusted state.")
        
        # Log metadata from the restored file
        with open(source_path, 'r') as f:
            data = json.load(f)
            audit = data.get('audit', {})
            print(f"   - Restored Precision: {audit.get('precision_score', 'N/A')}")
            print(f"   - Original Train Date: {audit.get('timestamp', 'N/A')}")
            
    except Exception as e:
        print(f"❌ Rollback Error: {e}")

if __name__ == "__main__":
    # If a specific version file is passed as arg, use it. Otherwise auto-rollback to previous.
    if len(sys.argv) > 1:
        rollback(sys.argv[1])
    else:
        rollback()
