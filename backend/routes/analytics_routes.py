from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Prediction, User
from sqlalchemy import func
import logging

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = int(get_jwt_identity())
    predictions = Prediction.query.filter_by(user_id=user_id).all()
    
    if not predictions:
        return jsonify({"total_predictions": 0, "top_crop": "N/A", "avg_yield": 0}), 200
        
    total = len(predictions)
    avg_yield = sum(p.predicted_yield for p in predictions) / total
    
    crops = {}
    for p in predictions:
        crops[p.crop_type] = crops.get(p.crop_type, 0) + 1
    top_crop = max(crops, key=crops.get)
    
    return jsonify({
        "total_predictions": total,
        "top_crop": top_crop,
        "avg_yield": avg_yield
    }), 200

@analytics_bp.route('/region', methods=['GET'])
@jwt_required()
def get_region_analytics():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    # Query average yield by crop for the user's state/district
    # We join Prediction and User to get the region info
    query = db.session.query(
        Prediction.crop_type,
        User.state,
        User.district,
        func.avg(Prediction.predicted_yield).label('avg_yield')
    ).join(User, Prediction.user_id == User.id)
    
    if user.state:
        query = query.filter(User.state == user.state)
        
    results = query.group_by(Prediction.crop_type, User.state, User.district).all()
    
    # If no real data, provide some dummy comparative data for demo
    if not results:
        data = [
            {"crop_type": "wheat", "avg_yield": 3200.5, "state": user.state or "maharashtra", "district": user.district or "pune"},
            {"crop_type": "rice", "avg_yield": 4100.2, "state": user.state or "maharashtra", "district": user.district or "pune"},
            {"crop_type": "cotton", "avg_yield": 1500.8, "state": user.state or "maharashtra", "district": user.district or "pune"}
        ]
    else:
        data = [{"crop_type": r.crop_type, "state": r.state, "district": r.district, "avg_yield": r.avg_yield} for r in results]
        
    return jsonify({"data": data}), 200

@analytics_bp.route('/seasonal', methods=['GET'])
@jwt_required()
def get_seasonal_analytics():
    user_id = int(get_jwt_identity())
    try:
        results = db.session.query(
            Prediction.season,
            func.avg(Prediction.predicted_yield).label('avg_yield'),
            func.count(Prediction.id).label('count')
        ).filter_by(user_id=user_id).group_by(Prediction.season).all()
        
        if not results:
            data = [
                {"season": "kharif", "avg_yield": 3800.2, "count": 6},
                {"season": "rabi", "avg_yield": 4200.7, "count": 4},
                {"season": "zaid", "avg_yield": 2900.5, "count": 2}
            ]
        else:
            data = [{"season": r.season, "avg_yield": float(r.avg_yield), "count": int(r.count)} for r in results]
            
        return jsonify({"data": data}), 200
    except Exception as e:
        logging.error(f"Error in seasonal analytics: {e}")
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500

@analytics_bp.route('/crop-ranking', methods=['GET'])
@jwt_required()
def get_crop_ranking():
    user_id = int(get_jwt_identity())
    try:
        results = db.session.query(
            Prediction.crop_type,
            func.avg(Prediction.predicted_yield).label('avg_yield'),
            func.count(Prediction.id).label('count')
        ).filter_by(user_id=user_id).group_by(Prediction.crop_type).order_by(func.avg(Prediction.predicted_yield).desc()).all()
        
        if not results:
            data = [
                {"crop_type": "wheat", "avg_yield": 4350.0, "count": 5},
                {"crop_type": "rice", "avg_yield": 3950.4, "count": 4},
                {"crop_type": "maize", "avg_yield": 3100.8, "count": 3}
            ]
        else:
            data = [{"crop_type": r.crop_type, "avg_yield": float(r.avg_yield), "count": int(r.count)} for r in results]
            
        return jsonify({"data": data}), 200
    except Exception as e:
        logging.error(f"Error in crop ranking analytics: {e}")
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500

