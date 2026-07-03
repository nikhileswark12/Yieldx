import joblib
import pandas as pd
import numpy as np
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(ROOT_DIR, 'ml', 'models')

FEATURES = [
    'nitrogen', 'phosphorus', 'potassium', 'soil_ph', 'soil_type',
    'temperature', 'humidity', 'rainfall', 'irrigation_type', 
    'fertilizer_used', 'crop_type', 'season', 'state'
]

_models_cache = None

def load_models():
    global _models_cache
    if _models_cache is not None:
        return _models_cache
    try:
        xgb = joblib.load(os.path.join(MODELS_DIR, 'xgboost_model.pkl'))
        rf = joblib.load(os.path.join(MODELS_DIR, 'rf_model.pkl'))
        scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.pkl'))
        encoders = joblib.load(os.path.join(MODELS_DIR, 'encoders.pkl'))
        _models_cache = (xgb, rf, scaler, encoders)
        return _models_cache
    except Exception as e:
        print(f"Error loading models: {e}. Ensure you have run ml/train.py first.")
        return None, None, None, None

def run_inference(input_dict):
    xgb, rf, scaler, encoders = load_models()
    if not xgb:
        return 0.0, 0.0, "unknown"
        
    df = pd.DataFrame([input_dict])
    
    # Fill missing features with defaults
    for f in FEATURES:
        if f not in df.columns:
            if f in encoders: df[f] = 'unknown'
            else: df[f] = 0.0
            
    # Keep only the required columns in the correct order
    df = df[FEATURES]
    
    # Encode categoricals
    for col, le in encoders.items():
        # Handle unseen labels by assigning 'unknown'
        df[col] = df[col].astype(str).str.lower()
        df[col] = df[col].apply(lambda x: x if x in le.classes_ else 'unknown')
        df[col] = le.transform(df[col])
        
    # Scale numericals
    numerical_cols = ['nitrogen', 'phosphorus', 'potassium', 'soil_ph', 'temperature', 'humidity', 'rainfall', 'fertilizer_used']
    df[numerical_cols] = scaler.transform(df[numerical_cols])
    
    # Predict
    pred_yield = float(xgb.predict(df)[0])
    
    # Calculate confidence proxy (just for demo purposes)
    rf_pred = float(rf.predict(df)[0])
    diff = abs(pred_yield - rf_pred)
    max_val = max(pred_yield, rf_pred, 1.0)
    confidence = max(0.0, min(1.0, 1.0 - (diff / max_val)))
    
    # Risk level determination
    if confidence > 0.85: risk = 'low'
    elif confidence > 0.60: risk = 'medium'
    else: risk = 'high'
    
    return pred_yield, confidence, risk
