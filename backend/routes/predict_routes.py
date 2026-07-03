from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Prediction
import sys
import os
from backend_app import limiter

# Add ml folder to path to import predict script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml')))
from predict import run_inference

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/yield', methods=['POST'])
@jwt_required()
@limiter.limit("10 per minute")
def predict_yield():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # 1. Validate required fields
    required_fields = ['nitrogen', 'phosphorus', 'potassium', 'soil_ph', 'soil_type', 'crop_type', 'season', 'irrigation_type', 'area_hectares']
    for field in required_fields:
        if data.get(field) is None or str(data.get(field)).strip() == "":
            return jsonify({"error": f"Missing required field: {field}"}), 400
            
    # 2. Validate numeric fields
    numeric_fields = ['nitrogen', 'phosphorus', 'potassium', 'soil_ph', 'area_hectares']
    for field in numeric_fields:
        try:
            float(data.get(field))
        except (ValueError, TypeError):
            return jsonify({"error": f"Field {field} must be a number"}), 400
            
    # Try to extract state from location if provided
    state = data.get('location', '').split(',')[0].strip() if data.get('location') else None
    
    # Set realistic weather defaults based on season if not provided
    temperature = data.get('temperature')
    humidity = data.get('humidity')
    rainfall = data.get('rainfall')
    
    if not temperature or not humidity or not rainfall:
        season = data.get('season', '').lower()
        if season == 'kharif':
            temperature = temperature or 28.5
            humidity = humidity or 75.0
            rainfall = rainfall or 800.0
        elif season == 'rabi':
            temperature = temperature or 20.0
            humidity = humidity or 50.0
            rainfall = rainfall or 100.0
        elif season == 'zaid':
            temperature = temperature or 32.0
            humidity = humidity or 45.0
            rainfall = rainfall or 50.0
        else:
            temperature = temperature or 25.0
            humidity = humidity or 60.0
            rainfall = rainfall or 200.0
            
    # Run ML inference
    predicted_yield, confidence, risk_level = run_inference(data)
    
    total_production = predicted_yield * float(data.get('area_hectares', 1))
    
    prediction = Prediction(
        user_id=user_id,
        crop_type=data.get('crop_type'),
        nitrogen=data.get('nitrogen'),
        phosphorus=data.get('phosphorus'),
        potassium=data.get('potassium'),
        soil_ph=data.get('soil_ph'),
        soil_type=data.get('soil_type'),
        temperature=temperature,
        humidity=humidity,
        rainfall=rainfall,
        irrigation_type=data.get('irrigation_type'),
        season=data.get('season'),
        fertilizer_used=data.get('fertilizer_used'),
        area_hectares=data.get('area_hectares'),
        predicted_yield=predicted_yield,
        total_production=total_production,
        confidence=confidence,
        risk_level=risk_level
    )
    
    db.session.add(prediction)
    db.session.commit()
    
    return jsonify({
        "prediction_id": prediction.id,
        "predicted_yield": predicted_yield,
        "total_production": total_production,
        "confidence": confidence,
        "risk_level": risk_level,
        "recommendations": ["Optimize fertilizer based on ML output.", "Ensure consistent irrigation across seasons."]
    }), 200

@predict_bp.route('/history', methods=['GET'])
@jwt_required()
@limiter.limit("10 per minute")
def get_history():
    user_id = int(get_jwt_identity())
    predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
    
    data = []
    for p in predictions:
        data.append({
            "id": p.id,
            "crop_type": p.crop_type,
            "predicted_yield": p.predicted_yield,
            "risk_level": p.risk_level,
            "created_at": p.created_at.isoformat()
        })
        
    return jsonify({"data": data}), 200

@predict_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@limiter.limit("10 per minute")
def get_prediction(id):
    user_id = int(get_jwt_identity())
    prediction = Prediction.query.filter_by(id=id, user_id=user_id).first()
    
    if not prediction:
        return jsonify({"message": "Not found"}), 404
        
    # Generate dynamic recommendations based on prediction values
    recs = []
    
    if prediction.soil_ph:
        if prediction.soil_ph < 6.0:
            recs.append("Apply agricultural lime to raise soil pH for optimal nutrient absorption.")
        elif prediction.soil_ph > 7.5:
            recs.append("Consider adding organic matter or sulfur to lower soil pH slightly.")
            
    if prediction.nitrogen and prediction.nitrogen < 40:
        recs.append("Nitrogen levels are low. Consider top-dressing with a nitrogen-rich fertilizer.")
        
    if prediction.humidity and prediction.humidity > 80:
        recs.append(f"High humidity detected. Monitor your {prediction.crop_type} closely for fungal diseases.")
        
    if prediction.irrigation_type and prediction.irrigation_type.lower() == 'flood':
        recs.append("Consider switching from flood to drip irrigation to conserve water and improve yield.")
        
    if prediction.risk_level == 'high':
        recs.append(f"High risk level predicted. Strongly recommend investing in crop insurance for this {prediction.crop_type} cycle.")
        
    if not recs:
        recs.append(f"Maintain current farming practices, they look well optimized for {prediction.crop_type}.")
        recs.append("Regularly scout fields to catch any early signs of pests.")

    return jsonify({
        "id": prediction.id,
        "crop_type": prediction.crop_type,
        "predicted_yield": prediction.predicted_yield,
        "total_production": prediction.total_production,
        "confidence": prediction.confidence,
        "risk_level": prediction.risk_level,
        "created_at": prediction.created_at.isoformat(),
        "recommendations": recs,
        "weather_summary": {
            "temperature": prediction.temperature,
            "humidity": prediction.humidity,
            "rainfall": prediction.rainfall,
            "description": "At time of prediction"
        }
    }), 200

def calculate_crop_centroids():
    import os
    import csv
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'Crop_Recommendation.csv')
    if not os.path.exists(csv_path):
        return {}
    
    crop_stats = {}
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                crop = row['Crop'].strip().lower()
                n = float(row['Nitrogen'])
                p = float(row['Phosphorus'])
                k = float(row['Potassium'])
                ph = float(row['pH_Value'])
                
                if crop not in crop_stats:
                    crop_stats[crop] = {'n': [], 'p': [], 'k': [], 'ph': []}
                crop_stats[crop]['n'].append(n)
                crop_stats[crop]['p'].append(p)
                crop_stats[crop]['k'].append(k)
                crop_stats[crop]['ph'].append(ph)
                
        centroids = {}
        for crop, vals in crop_stats.items():
            centroids[crop] = {
                'n': sum(vals['n']) / len(vals['n']),
                'p': sum(vals['p']) / len(vals['p']),
                'k': sum(vals['k']) / len(vals['k']),
                'ph': sum(vals['ph']) / len(vals['ph'])
            }
        return centroids
    except Exception as e:
        print(f"Error calculating crop centroids: {e}")
        return {}

@predict_bp.route('/crop', methods=['POST'])
@jwt_required()
@limiter.limit("10 per minute")
def predict_crop():
    import math
    data = request.get_json()
    
    required_fields = ['nitrogen', 'phosphorus', 'potassium', 'soil_ph']
    for field in required_fields:
        if data.get(field) is None or str(data.get(field)).strip() == "":
            return jsonify({"error": f"Missing required field: {field}"}), 400
            
    numeric_fields = ['nitrogen', 'phosphorus', 'potassium', 'soil_ph']
    for field in numeric_fields:
        try:
            float(data.get(field))
        except (ValueError, TypeError):
            return jsonify({"error": f"Field {field} must be a number"}), 400
            
    n = float(data.get('nitrogen'))
    p = float(data.get('phosphorus'))
    k = float(data.get('potassium'))
    ph = float(data.get('soil_ph'))
    
    centroids = calculate_crop_centroids()
    recommendations = []
    
    if centroids:
        for crop, c in centroids.items():
            # Normalized differences based on approximate feature ranges in the dataset
            diff_n = abs(n - c['n']) / 140.0
            diff_p = abs(p - c['p']) / 145.0
            diff_k = abs(k - c['k']) / 205.0
            diff_ph = abs(ph - c['ph']) / 4.0
            
            # pH holds high significance in agronomic suitability, give it triple weight
            dist = math.sqrt(diff_n**2 + diff_p**2 + diff_k**2 + (3 * diff_ph)**2)
            
            # Map distance to similarity score
            score = max(0, min(100, int(100 * (1 - (dist / 2.0)))))
            
            # Select customized reason based on nutrient deviation
            if diff_ph < 0.15 and diff_n < 0.25:
                reason = f"Excellent match! Soil pH ({ph}) and Nitrogen are perfectly aligned with {crop.capitalize()} needs."
            elif diff_ph > 0.3:
                reason = f"Moderate match. {crop.capitalize()} can tolerate this soil pH, but it is outside its ideal range."
            else:
                reason = f"Good match for {crop.capitalize()}. Nutrient metrics are highly compatible with this crop profile."
                
            recommendations.append({
                "crop": crop.capitalize(),
                "score": score,
                "reason": reason
            })
    else:
        # Fallback to simple rule-based logic if CSV dataset not present
        if 5.5 <= ph <= 7.5:
            recommendations.append({"crop": "Wheat", "score": 90, "reason": "Good soil pH and nutrients for Wheat."})
        if 5.0 <= ph <= 6.5:
            recommendations.append({"crop": "Rice", "score": 85, "reason": "Slightly acidic soil favors Rice."})
        if 5.8 <= ph <= 8.0:
            recommendations.append({"crop": "Cotton", "score": 75, "reason": "Alkaline tolerance matches Cotton."})
            
    if not recommendations:
        recommendations.append({"crop": "Legumes", "score": 90, "reason": "Excellent for soil nitrogen fixation."})
        
    # Sort by score descending
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    
    return jsonify({
        "recommendations": recommendations[:3]
    }), 200

