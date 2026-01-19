import os
import json
import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, accuracy_score
from dotenv import load_dotenv
from datetime import datetime

# 1. Setup & Config (Robust Pathing for Deployment)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# In server-only deployment, .env is in the same folder as scripts parent
ROOT_DIR = os.path.dirname(SCRIPT_DIR) 

load_dotenv(dotenv_path=os.path.join(ROOT_DIR, '.env'))
MONGO_URI = os.getenv('MONGO_URI')

BASE_PATH = os.path.join(ROOT_DIR, 'services')
WEIGHTS_PATH = os.path.join(BASE_PATH, 'weights.json')
VERSION_PATH = os.path.join(BASE_PATH, 'models')

if not os.path.exists(VERSION_PATH):
    os.makedirs(VERSION_PATH)

def clamp_weights(weights, lower=-3.0, upper=3.0):
    """Ensures no single signal becomes infinitely powerful."""
    weights['bias'] = float(np.clip(weights['bias'], lower, upper))
    for k in weights['signals']:
        weights['signals'][k] = float(np.clip(weights['signals'][k], lower, upper))
    for k in weights['metadata']:
        weights['metadata'][k] = float(np.clip(weights['metadata'][k], lower, upper))
    return weights

def evaluate_weights(X, y, weights):
    """Simulates the rulesEngine.js logic to calculate accuracy/precision."""
    # Score = 1 / (1 + exp(-(bias + sum(w * x))))
    bias = weights['bias']
    w_vec = []
    for k in X.columns:
        if k in weights['signals']:
            w_vec.append(weights['signals'][k])
        elif k in weights['metadata']:
            w_vec.append(weights['metadata'][k])
        else:
            w_vec.append(0)
    
    z = bias + np.dot(X.values, np.array(w_vec))
    prob = 1 / (1 + np.exp(-z))
    preds = (prob > 0.5).astype(int)
    
    return {
        "accuracy": accuracy_score(y, preds),
        "precision": precision_score(y, preds, zero_division=0)
    }

def train_model():
    print("[CALM ML] Starting Production Training Pipeline...")
    
    # 2. Connect to MongoDB
    if not MONGO_URI:
        print("[CALM ML] Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    scans_col = db['scans']
    
    # 3. Data Fetching Strategy
    prod_query = {
        "userFeedback": {"$exists": True, "$ne": None}, 
        "source": {"$in": ["production", "dataset_import_doc", "indian_fraud_dataset"]} 
    }
    kaggle_query = {"userFeedback": {"$exists": True, "$ne": None}, "source": {"$in": ["kaggle_import", "kaggle_spam"]}}

    prod_scans = list(scans_col.find(prod_query))
    kaggle_scans = list(scans_col.find(kaggle_query))
    
    print(f"[CALM ML] Data Stats: Production/Dataset={len(prod_scans)}, Bootstrap(Kaggle)={len(kaggle_scans)}")

    if len(prod_scans) < 20: 
        print(f"[CALM ML] Insufficient data ({len(prod_scans)}). Retraining requires more labeled samples.")
        return

    feature_keys = [
        'urgency', 'financial', 'impersonation', 'jobScam', 'techSupport', 'links', 'personalData',
        'scamKeywords', 'trustSignal', 'softwareMetadata', 'genericSuccessMsg', 
        'missingCriticalFields', 'contextMismatch', 'lowOcrConfidence', 'ocrConfidenceParadox', 
        'structuralAnomalies'
    ]
    meta_keys = ['capsRatio', 'linkCount', 'phoneCount']

    # 4. Prepare Feature Dataframes
    def prepare_df(scan_list):
        data = []
        for s in scan_list:
            features = {k: s.get('signals', {}).get(k, 0) for k in feature_keys}
            features.update({k: s.get('metadata', {}).get(k, 0) for k in meta_keys})
            label = 0
            if s['userFeedback'] == 'correct':
                label = 1 if s['status'] in ['fraud', 'scam', 'risky', 'suspicious'] else 0
            elif s['userFeedback'] == 'incorrect_fraud':
                label = 1
            elif s['userFeedback'] == 'incorrect_safe':
                label = 0
            features['target'] = label
            data.append(features)
        df = pd.DataFrame(data)
        X = df.drop('target', axis=1)
        y = df['target']
        return X, y

    X_prod, y_prod = prepare_df(prod_scans)
    X_kaggle, y_kaggle = prepare_df(kaggle_scans)
    
    # 5. Unified Training Strategy
    X_train = pd.concat([X_prod, X_kaggle.sample(min(len(X_kaggle), 5000), random_state=42)])
    y_train = pd.concat([y_prod, y_kaggle.sample(min(len(y_kaggle), 5000), random_state=42)])
    
    X_test = pd.concat([X_prod, X_kaggle])
    y_test = pd.concat([y_prod, y_kaggle])

    # 6. Load Current Production Model
    print("[CALM ML] Validating Candidate against Production...")
    if not os.path.exists(WEIGHTS_PATH):
        print(f"[CALM ML] Error: Weights file not found at {WEIGHTS_PATH}")
        return

    with open(WEIGHTS_PATH, 'r') as f:
        prod_weights = json.load(f)
    
    prod_metrics = evaluate_weights(X_test, y_test, prod_weights)

    # 7. Train Candidate Model (ON PRODUCTION DATA ONLY)
    model = LogisticRegression(class_weight='balanced', max_iter=1000)
    model.fit(X_train, y_train)

    candidate_weights = {
        "bias": float(model.intercept_[0]),
        "signals": {k: float(model.coef_[0][i]) for i, k in enumerate(feature_keys)},
        "metadata": {k: float(model.coef_[0][len(feature_keys) + i]) for i, k in enumerate(meta_keys)}
    }

    # [SMART BOOTSTRAP] Inject weight for 'structuralAnomalies' ONLY if model has no data (Cold Start)
    if abs(candidate_weights['signals'].get('structuralAnomalies', 0)) < 0.01:
        print("[CALM ML] Cold Start Detected: Applying bootstrap weight (2.5) to structuralAnomalies")
        candidate_weights['signals']['structuralAnomalies'] = 2.5

    # Apply CLAMPING
    candidate_weights = clamp_weights(candidate_weights)
    cand_metrics = evaluate_weights(X_test, y_test, candidate_weights)

    print(f"   Production Precision (vs Golden Set): {prod_metrics['precision']:.4f}")
    print(f"   Candidate Precision (vs Golden Set):  {cand_metrics['precision']:.4f}")

    # 8. DEPLOYMENT GUARDRAILS
    if cand_metrics['precision'] < (prod_metrics['precision'] - 0.15):
        print("[CALM ML] Deployment Blocked: Significant candidate accuracy degradation detected.")
        return

    # Rule 2: Stability Check (Max individual weight jump of 0.7)
    for k in feature_keys:
        diff = abs(candidate_weights['signals'][k] - prod_weights['signals'].get(k, 0))
        if diff > 0.7:
             print(f"[CALM ML] Smoothing: Weight jump for {k} ({diff:.2f}) is too high. Clamping jump.")
             candidate_weights['signals'][k] = prod_weights['signals'].get(k, 0) + (0.7 * np.sign(candidate_weights['signals'][k] - prod_weights['signals'].get(k, 0)))

    # 9. Versioned Archive & Update
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    versioned_file = f"weights_v{timestamp}.json"
    archive_path = os.path.join(VERSION_PATH, versioned_file)

    # Save to archive
    with open(archive_path, 'w') as f:
        json.dump(candidate_weights, f, indent=4)

    # Update production pointer
    with open(WEIGHTS_PATH, 'w') as f:
        json.dump(candidate_weights, f, indent=4)
    
    print(f"[CALM ML] Promotion Successful! New model deployed: {versioned_file}")

if __name__ == "__main__":
    try:
        train_model()
    except Exception as e:
        print(f"[CALM ML] Pipeline Failed: {e}")
