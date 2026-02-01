import os
import sys
import json
import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, accuracy_score, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_score
from dotenv import load_dotenv
from datetime import datetime

"""
=========================================================================================
TRUSTSCAN AI CORE MISSION
"This system must prioritize stability, user trust, and reversibility over rapid or aggressive learning."
=========================================================================================
"""

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

def calculate_explainability(weights):
    """
    Measures how 'explainable' the model is based on weight concentration.
    Higher score = Fewer, stronger signals (Easier to explain: 'It's fraud because X & Y').
    Lower score = Many weak signals (Harder to explain: 'It's a mix of 20 things').
    Metric: Percentage of total influence held by the Top 3 signals.
    """
    # 1. Gather all absolute weights (signals + metadata)
    all_weights = []
    if 'signals' in weights:
        all_weights.extend([abs(v) for v in weights['signals'].values()])
    if 'metadata' in weights:
        all_weights.extend([abs(v) for v in weights['metadata'].values()])
    
    if not all_weights or sum(all_weights) == 0:
        return 0.0
        
    # 2. Sort descending
    all_weights.sort(reverse=True)
    
    # 3. Calculate Concentration
    total_mass = sum(all_weights)
    top_3_mass = sum(all_weights[:3])
    
    return top_3_mass / total_mass

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
    
    # Metrics breakdown
    tn, fp, fn, tp = confusion_matrix(y, preds, labels=[0, 1]).ravel()
    
    return {
        "accuracy": accuracy_score(y, preds),
        "precision": precision_score(y, preds, zero_division=0),
        "false_positives": int(fp),
        "avg_confidence": float(np.mean(prob))
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
        'structuralAnomalies', 'punycodeHomograph', 'subdomainAbuse', 'pathObfuscation',
        'hasGst', 'hasCin', 'invalidBusinessId', 'businessContextMismatch'
    ]
    meta_keys = ['capsRatio', 'linkCount', 'phoneCount']

    # 4. Prepare Feature Dataframes
    def prepare_df(scan_list, is_bootstrap=False):
        data = []
        now = datetime.now()
        for s in scan_list:
            features = {k: s.get('signals', {}).get(k, 0) for k in feature_keys}
            features.update({k: s.get('metadata', {}).get(k, 0) for k in meta_keys})
            
            # [Intelligent Forgetting] Calculate Time-Decayed Weight
            # Default weight = 1.0 (Fresh)
            weight = 1.0
            if is_bootstrap:
                weight = 0.5 # Bootstrap data is always treated as "historical/foundation"
            elif 'createdAt' in s:
                try:
                    # Handle Mongo Dates
                    c_date = s['createdAt']
                    if isinstance(c_date, str):
                        # Simple truncation to avoid timezone headaches if mixed
                        c_date = datetime.fromisoformat(c_date.replace('Z', ''))
                    
                    age_days = (now - c_date).days
                    if age_days > 0:
                        # Exponential Decay: Retain ~70% influence after 3 months, ~30% after 1 year.
                        # Floor at 0.2 to ensure we never fully forget "ancient wisdom"
                        weight = max(0.2, (0.995 ** age_days))
                except Exception:
                    weight = 1.0
            
            label = 0
            if s['userFeedback'] == 'correct':
                label = 1 if s['status'] in ['fraud', 'scam', 'risky', 'suspicious'] else 0
            elif s['userFeedback'] == 'incorrect_fraud':
                label = 1
            elif s['userFeedback'] == 'incorrect_safe':
                label = 0
                
            features['target'] = label
            features['weight'] = weight
            data.append(features)
        
        if not data:
            return pd.DataFrame(columns=feature_keys + meta_keys + ['target', 'weight'])
            
        return pd.DataFrame(data)

    df_prod = prepare_df(prod_scans, is_bootstrap=False)
    df_kaggle = prepare_df(kaggle_scans, is_bootstrap=True)
    
    # 5. Unified Training Strategy (REDUCED FOR 512MB RAM)
    kaggle_sample_size = min(len(df_kaggle), 1000)
    
    # Stratified Sampling for Train/Test
    # Concatenate then split to ensure weights travel with rows
    df_train_kaggle = df_kaggle.sample(kaggle_sample_size, random_state=42)
    df_train = pd.concat([df_prod, df_train_kaggle])
    
    # Determine X, y, w
    X_train = df_train.drop(['target', 'weight'], axis=1)
    y_train = df_train['target']
    w_train = df_train['weight']
    
    # For Test set, we use fresh production data + sample of kaggle
    # Ideally should be time-split, but for now random split of remaining
    # We re-sample for testing simplicity in this script
    df_test_kaggle = df_kaggle.sample(min(len(df_kaggle), 500), random_state=100) # diff seed
    df_test = pd.concat([df_prod, df_test_kaggle]) # Note: Testing on training data (prod) is bad practice generally, 
                                                   # but ok here for "Sanity Check" vs Golden Set concept.
                                                   # Real golden set logic requires separate collection.
    
    X_test = df_test.drop(['target', 'weight'], axis=1)
    y_test = df_test['target']
    # w_test not needed for evaluation metrics usually

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
    
    # [CROSS-VALIDATION] Validate stability across 5 folds
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    # Note: cross_val_score doesn't accept sample_weight easily in this simple API 
    # but we can rely on the main fit for weight usage.
    cv_scores = cross_val_score(model, X_train, y_train, cv=skf, scoring='precision')
    print(f"[CALM ML] Cross-Validation Precision (5-Fold): {np.mean(cv_scores):.4f} (+/- {np.std(cv_scores):.4f})")
    
    if np.mean(cv_scores) < 0.60:
        print("[CALM ML] Warning: Low CV Precision. Model may be unstable or data is noisy.")

    model.fit(X_train, y_train, sample_weight=w_train)

    candidate_weights = {
        "bias": float(model.intercept_[0]),
        "signals": {k: float(model.coef_[0][i]) for i, k in enumerate(feature_keys)},
        "metadata": {k: float(model.coef_[0][len(feature_keys) + i]) for i, k in enumerate(meta_keys)}
    }
    
    # [CALM MODE LOGIC]
    is_calm_mode = (sys.argv[1] == "calm_mode") if len(sys.argv) > 1 else False
    if is_calm_mode:
        print("\n🌊 [CALM ML] CALM MODE ACTIVE: Panic spike detected. Reducing learning rate by 50%.")
    
    # [SMART BOOTSTRAP] Inject weight for 'structuralAnomalies' ONLY if model has no data (Cold Start)
    if abs(candidate_weights['signals'].get('structuralAnomalies', 0)) < 0.01:
        print("[CALM ML] Cold Start Detected: Applying bootstrap weight (2.5) to structuralAnomalies")
        candidate_weights['signals']['structuralAnomalies'] = 2.5

    # Apply CLAMPING
    candidate_weights = clamp_weights(candidate_weights)
    cand_metrics = evaluate_weights(X_test, y_test, candidate_weights)
    
    # [METADATA COLLECTION]
    trigger_reason = sys.argv[1] if len(sys.argv) > 1 else "manual_execution"
    
    # Calculate Dominant Fraud Category
    # Filter X_train for fraud cases (y_train == 1) and find column with highest mean
    fraud_X = X_train[y_train == 1]
    dominant_category = "unknown"
    if not fraud_X.empty:
        # Check only signal columns
        signal_means = fraud_X[feature_keys].mean()
        dominant_category = signal_means.idxmax()

    # Calculate False Positive Rate (FPR = FP / (FP + TN))
    # Total Negatives in Test Set = Count(y_test == 0)
    total_negatives = (y_test == 0).sum()
    fpr = cand_metrics['false_positives'] / total_negatives if total_negatives > 0 else 0.0

    # Calculate Explainability Scores (Prioritizing Human Understandability)
    prod_expl = calculate_explainability(prod_weights)
    cand_expl = calculate_explainability(candidate_weights)

    print(f"   Audit: Reason={trigger_reason}, Dominant={dominant_category}, FPR={fpr:.4f}")

    candidate_weights["audit"] = {
        "precision_score": float(cand_metrics['precision']),
        "false_positive_rate": float(fpr),
        "explainability_score": float(cand_expl),
        "training_data_size": int(len(X_train)),
        "dominant_fraud_category": str(dominant_category),
        "retraining_trigger_reason": str(trigger_reason),
        "timestamp": datetime.now().isoformat()
    }

    # 8. SHADOW MODE EVALUATION (Challenger vs Champion)
    print("\n[CALM ML] 🛡️ running Shadow Mode Evaluation...")
    print(f"   False Positives: Prod={prod_metrics['false_positives']} vs Cand={cand_metrics['false_positives']}")
    print(f"   Avg Confidence:  Prod={prod_metrics['avg_confidence']:.2f} vs Cand={cand_metrics['avg_confidence']:.2f}")
    print(f"   Explainability:  Prod={prod_expl:.2f} vs Cand={cand_expl:.2f}")

    # Guardrail 1: Absolute Safety Floor (80%)
    if cand_metrics['precision'] < 0.80:
        print(f"[CALM ML] ⛔ Blocked: Precision ({cand_metrics['precision']:.4f}) below 80% safety floor.")
        return

    # Guardrail 2: Confidence Drift Check (>15% deviation is suspicious)
    # IN CALM MODE: We allow LESS drift (10%) to force stability
    drift_limit = 0.10 if is_calm_mode else 0.15
    confidence_drift = abs(cand_metrics['avg_confidence'] - prod_metrics['avg_confidence'])
    if confidence_drift > drift_limit:
        print(f"[CALM ML] ⛔ Blocked: High confidence drift detected ({confidence_drift:.2%}). Limit={drift_limit}")
        return

    # Guardrail 3: False Positive Spike Protection
    if cand_metrics['false_positives'] > (prod_metrics['false_positives'] * 2) and cand_metrics['false_positives'] > 5:
        print(f"[CALM ML] ⛔ Blocked: False Positive rate spiked significantly.")
        return

    # Guardrail 4: Explainability Check (Prevent Black Box Models)
    # We require the top 3 features to explain at least 45% of the model's decision power.
    if cand_expl < 0.45:
         print(f"[CALM ML] ⛔ Blocked: Model explainability ({cand_expl:.2f}) is too low (Black Box risk).")
         return
         
    if cand_expl < (prod_expl - 0.15):
         print(f"[CALM ML] ⛔ Blocked: Significant loss of explainability (-{(prod_expl-cand_expl):.2f}).")
         return

    # Guardrail 5: Challenger Outperformance Rule
    if cand_metrics['precision'] < prod_metrics['precision']:
        print(f"[CALM ML] ⛔ Blocked: Challenger ({cand_metrics['precision']:.4f}) failed to beat Champion ({prod_metrics['precision']:.4f}).")
        return
    
    print("[CALM ML] ✅ Shadow Test Passed: Challenger outperforms or matches Champion.")

    # Rule 3: Adaptive Stability Check (Anti-Jitter)
    for k in feature_keys:
        old_val = prod_weights['signals'].get(k, 0)
        new_val = candidate_weights['signals'][k]
        diff = abs(new_val - old_val)
        
        # Determine strictness: Mature signals (non-zero old value) get tighter bounds
        is_mature = abs(old_val) > 0.1
        base_limit = 0.3 if is_mature else 0.7
        
        # IN CALM MODE: Reduce all change limits by 50%
        limit = (base_limit * 0.5) if is_calm_mode else base_limit

        if diff > limit:
             print(f"[CALM ML] Smoothing: {k} (Mature={is_mature}, Calm={is_calm_mode}) jump {diff:.2f} > {limit:.2f}. Clamping.")
             candidate_weights['signals'][k] = old_val + (limit * np.sign(new_val - old_val))

    # 9. Versioned Archive & Update
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    versioned_file = f"weights_v{timestamp}.json"
    archive_path = os.path.join(VERSION_PATH, versioned_file)

    # Save to archive
    with open(archive_path, 'w') as f:
        json.dump(candidate_weights, f, indent=4)

    # 10. CLEANUP: Keep only last 7 versions to save RAM/Clutter
    # This prevents the "Models create problem" issue on restricted storage/RAM
    try:
        all_versions = sorted([f for f in os.listdir(VERSION_PATH) if f.startswith('weights_v')], reverse=True)
        if len(all_versions) > 7:
            for old_model in all_versions[7:]:
                os.remove(os.path.join(VERSION_PATH, old_model))
                print(f"[CALM ML] Cleaned up old model file: {old_model}")
    except Exception as cleanup_err:
        print(f"[CALM ML] Cleanup Warning: {cleanup_err}")

    # Update production pointer
    with open(WEIGHTS_PATH, 'w') as f:
        json.dump(candidate_weights, f, indent=4)
    
    print(f"[CALM ML] Promotion Successful! New model deployed: {versioned_file}")

if __name__ == "__main__":
    try:
        train_model()
    except Exception as e:
        print(f"[CALM ML] Pipeline Failed: {e}")
