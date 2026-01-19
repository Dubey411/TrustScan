import os
import shutil
import sys

# 1. Setup Robust Pathing
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR) # server root
BASE_PATH = os.path.join(ROOT_DIR, 'services')
VERSION_PATH = os.path.join(BASE_PATH, 'models')
PROD_WEIGHTS = os.path.join(BASE_PATH, 'weights.json')

def list_versions():
    if not os.path.exists(VERSION_PATH):
        print("📁 No model archive found.")
        return []
    
    versions = sorted([f for f in os.listdir(VERSION_PATH) if f.endswith('.json')], reverse=True)
    return versions

def rollback(version_name):
    source = os.path.join(VERSION_PATH, version_name)
    if not os.path.exists(source):
        print(f"❌ Version {version_name} not found.")
        return False
    
    shutil.copy2(source, PROD_WEIGHTS)
    print(f"✅ Rollback Successful! Production now using: {version_name}")
    return True

if __name__ == "__main__":
    versions = list_versions()
    
    if not versions:
        sys.exit(0)

    if len(sys.argv) < 2:
        print("\n📜 Available Model Versions:")
        for i, v in enumerate(versions):
            print(f"  [{i}] {v}")
        print("\nUsage: python server/scripts/rollback.py <version_index_or_filename>")
    else:
        target = sys.argv[1]
        try:
            # Try index
            idx = int(target)
            if 0 <= idx < len(versions):
                rollback(versions[idx])
            else:
                print("❌ Invalid index.")
        except ValueError:
            # Try filename
            rollback(target)
