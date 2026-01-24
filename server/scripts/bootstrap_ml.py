import os
import sys
import copy
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Setup Robust Pathing
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR) # server root

load_dotenv(dotenv_path=os.path.join(ROOT_DIR, '.env'))
MONGO_URI = os.getenv('MONGO_URI')

def bootstrap():
    print("🚀 Bootstrapping ML Ground Truth (Production Location)...")
    if not MONGO_URI:
        print("❌ Error: MONGO_URI not found.")
        return

    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    scans_col = db['scans']

    # 1. Define base cases (Golden Set)
    base_cases = [
        {
            "content": "Dear Customer, your bank account will be blocked today due to incomplete KYC. Update immediately: http://bit.ly/kyc-update",
            "status": "fraud",
            "signals": {"urgency": 1, "financial": 1, "personalData": 1, "scamKeywords": 1},
            "metadata": {"linkCount": 1},
            "userFeedback": "correct",
            "source": "bootstrap"
        },
        {
            "content": "ATTENTION: Your computer has been locked. Send 0.5 BTC to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa to recover your files. Failure will result in data deletion.",
            "status": "fraud",
            "signals": {"urgency": 2, "financial": 1, "techSupport": 1, "scamKeywords": 1, "structuralAnomalies": 1},
            "metadata": {"capsRatio": 0.2},
            "userFeedback": "correct",
            "source": "bootstrap"
        },
        {
            "content": "Official IRS Notification: You have an outstanding tax debt. To avoid immediate arrest, please confirm your Social Security Number (SSN): 000-XX-XXXX",
            "status": "fraud",
            "signals": {"urgency": 1, "personalData": 2, "impersonation": 1, "scamKeywords": 1},
            "metadata": {"capsRatio": 0.15},
            "userFeedback": "correct",
            "source": "bootstrap"
        },
        {
            "content": "Payment Pending: We received your order for iPhone 15. If this was not you, call support immediately at +18881234567 or visit our portal.",
            "status": "fraud",
            "signals": {"urgency": 1, "impersonation": 1, "scamKeywords": 1},
            "metadata": {"phoneCount": 1},
            "userFeedback": "correct",
            "source": "bootstrap"
        },
        {
            "content": "Direct Wire Transfer: Please send the invoice amount to IBAN DE89370400440532013000. Beneficiary: Global Tech Solutions.",
            "status": "fraud",
            "signals": {"financial": 1, "scamKeywords": 1},
            "metadata": {"linkCount": 0},
            "userFeedback": "correct",
            "source": "bootstrap"
        },
        {
            "content": "We reviewed your resume and selected you for work-from-home job. Earn ₹25,000/week. Registration fee ₹999 only.",
            "status": "fraud",
            "signals": {"jobScam": 2, "personalData": 1, "scamKeywords": 1},
            "metadata": {"capsRatio": 0.1},
            "userFeedback": "correct",
            "source": "bootstrap"
        }
    ]

    all_records = []
    for _ in range(5): # 30 records total
        for case in base_cases:
            all_records.append(copy.deepcopy(case))

    try:
        scans_col.insert_many(all_records)
        print(f"✅ Inserted {len(all_records)} records successfully.")
    except Exception as e:
        print(f"⚠️ Insertion had issues: {e}")
    
    # 2. Trigger Training
    print("\n🔄 Triggering Automated Training Script...")
    # Import from same directory
    import train_layer1
    train_layer1.train_model()

if __name__ == "__main__":
    bootstrap()
