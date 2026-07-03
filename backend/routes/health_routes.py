from flask import Blueprint, jsonify
from models import db

health_bp = Blueprint('health', __name__)

@health_bp.route('/', methods=['GET'])
def get_health():
    try:
        from sqlalchemy import text
        # Check database
        db.session.execute(text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'
        
    # Check ML models (Mocking for now, will implement actual check later)
    # import os
    # if os.path.exists('../ml/models/xgboost_model.pkl'): models_status = 'loaded'
    
    return jsonify({
        "status": "ok",
        "db": db_status,
        "models": "loaded"  # Placeholder
    }), 200
