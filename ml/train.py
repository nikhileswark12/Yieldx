import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# Define the expected features (13 features)
FEATURES = [
    'nitrogen', 'phosphorus', 'potassium', 'soil_ph', 'soil_type',
    'temperature', 'humidity', 'rainfall', 'irrigation_type', 
    'fertilizer_used', 'crop_type', 'season', 'state'
]

# Paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(ROOT_DIR, 'ml', 'models')
DATA_PATH = os.path.join(ROOT_DIR, 'yield_df.csv')

def mean_absolute_percentage_error(y_true, y_pred): 
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    # Avoid division by zero
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

def load_or_generate_data():
    try:
        # Load the provided Kaggle/FAO dataset
        df = pd.read_csv(DATA_PATH)
        print(f"Loaded dataset from {DATA_PATH} with {len(df)} rows.")
        
        # Mapping the FAO dataset to our required 13 features
        # The FAO dataset has: Area, Item, Year, hg/ha_yield, average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp
        
        # Base mapping
        df['crop_type'] = df['Item'].str.lower()
        df['state'] = df['Area'].str.lower()
        df['temperature'] = df['avg_temp']
        df['rainfall'] = df['average_rain_fall_mm_per_year']
        # Convert hg/ha to kg/ha (1 hg = 0.1 kg)
        df['yield_kg_ha'] = df['hg/ha_yield'] * 0.1
        
        # Drop rows with NaNs in required columns
        df = df.dropna(subset=['temperature', 'rainfall', 'yield_kg_ha'])
        
        # Take a subset if it's too large to train quickly for demo (e.g., max 100k rows)
        if len(df) > 50000:
            df = df.sample(n=50000, random_state=42)
            
        print("Synthesizing missing features (NPK, pH, Humidity, Season, Irrigation, Fertilizer)...")
        np.random.seed(42)
        size = len(df)
        
        df['nitrogen'] = np.random.uniform(0, 140, size)
        df['phosphorus'] = np.random.uniform(5, 145, size)
        df['potassium'] = np.random.uniform(5, 205, size)
        df['soil_ph'] = np.random.uniform(4.5, 8.5, size)
        df['humidity'] = np.random.uniform(30, 90, size)
        df['fertilizer_used'] = np.random.uniform(0, 200, size)
        
        soil_types = ['sandy', 'loamy', 'clay', 'silt', 'alluvial', 'black']
        df['soil_type'] = np.random.choice(soil_types, size)
        
        seasons = ['kharif', 'rabi', 'zaid']
        df['season'] = np.random.choice(seasons, size)
        
        irrigation_types = ['drip', 'flood', 'sprinkler', 'rainfed']
        df['irrigation_type'] = np.random.choice(irrigation_types, size)
        
        return df[FEATURES + ['yield_kg_ha']]
        
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Generating fully synthetic dataset as fallback...")
        return generate_synthetic_data()

def generate_synthetic_data(samples=5000):
    np.random.seed(42)
    data = {
        'nitrogen': np.random.uniform(0, 140, samples),
        'phosphorus': np.random.uniform(5, 145, samples),
        'potassium': np.random.uniform(5, 205, samples),
        'soil_ph': np.random.uniform(4.5, 8.5, samples),
        'soil_type': np.random.choice(['sandy', 'loamy', 'clay', 'silt', 'alluvial', 'black'], samples),
        'temperature': np.random.uniform(15, 40, samples),
        'humidity': np.random.uniform(30, 90, samples),
        'rainfall': np.random.uniform(200, 2000, samples),
        'irrigation_type': np.random.choice(['drip', 'flood', 'sprinkler', 'rainfed'], samples),
        'fertilizer_used': np.random.uniform(0, 200, samples),
        'crop_type': np.random.choice(['wheat', 'rice', 'sugarcane', 'cotton', 'maize'], samples),
        'season': np.random.choice(['kharif', 'rabi', 'zaid'], samples),
        'state': np.random.choice(['maharashtra', 'punjab', 'gujarat'], samples),
    }
    df = pd.DataFrame(data)
    # Synthetic target based on some logical relation
    df['yield_kg_ha'] = (
        df['nitrogen'] * 2 + 
        df['rainfall'] * 0.5 + 
        df['fertilizer_used'] * 3 +
        np.random.normal(0, 200, samples)
    )
    df['yield_kg_ha'] = df['yield_kg_ha'].clip(lower=500, upper=8000)
    return df

def train():
    os.makedirs(MODELS_DIR, exist_ok=True)
    df = load_or_generate_data()
    
    print("Encoding categorical variables...")
    categorical_cols = ['soil_type', 'irrigation_type', 'crop_type', 'season', 'state']
    encoders = {}
    
    for col in categorical_cols:
        le = LabelEncoder()
        # adding 'unknown' class handling by fitting on unique values + 'unknown'
        unique_vals = list(df[col].unique())
        unique_vals.append('unknown')
        le.fit(unique_vals)
        df[col] = le.transform(df[col])
        encoders[col] = le
        
    print("Normalizing numerical features...")
    numerical_cols = ['nitrogen', 'phosphorus', 'potassium', 'soil_ph', 'temperature', 'humidity', 'rainfall', 'fertilizer_used']
    scaler = MinMaxScaler()
    df[numerical_cols] = scaler.fit_transform(df[numerical_cols])
    
    X = df[FEATURES]
    y = df['yield_kg_ha']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Regressor...")
    xgb = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42)
    xgb.fit(X_train, y_train)
    
    print("Training Random Forest Regressor (Fallback)...")
    rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    
    # Evaluation
    xgb_preds = xgb.predict(X_test)
    rf_preds = rf.predict(X_test)
    
    print("\n--- XGBoost Performance ---")
    print(f"MAE: {mean_absolute_error(y_test, xgb_preds):.2f} kg/ha")
    print(f"RMSE: {np.sqrt(mean_squared_error(y_test, xgb_preds)):.2f} kg/ha")
    print(f"R2 Score: {r2_score(y_test, xgb_preds):.4f}")
    print(f"MAPE: {mean_absolute_percentage_error(y_test, xgb_preds):.2f}%")
    
    print("\n--- Random Forest Performance ---")
    print(f"R2 Score: {r2_score(y_test, rf_preds):.4f}")
    
    print("\nExporting models and preprocessors...")
    joblib.dump(xgb, os.path.join(MODELS_DIR, 'xgboost_model.pkl'))
    joblib.dump(rf, os.path.join(MODELS_DIR, 'rf_model.pkl'))
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
    joblib.dump(encoders, os.path.join(MODELS_DIR, 'encoders.pkl'))
    print("Export complete. Models saved to ml/models/")

if __name__ == '__main__':
    train()
