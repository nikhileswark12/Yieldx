from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Alert, User
import os
import requests
from datetime import datetime

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['GET'])
@jwt_required()
def get_alerts():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Clear old alerts to ensure we only show real-time dynamic alerts
    Alert.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    alerts_to_add = []
    location = user.district or user.state
    api_key = os.environ.get('OPENWEATHER_API_KEY')
    
    if location and api_key:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                temp = data['main']['temp']
                humidity = data['main']['humidity']
                rain = data.get('rain', {}).get('1h', 0.0)
                
                if temp > 35.0 and rain == 0.0:
                    alerts_to_add.append(Alert(user_id=user_id, message=f"Extreme heat detected ({temp}°C). High risk of drought stress on crops. Consider increasing irrigation.", severity="high"))
                elif temp < 10.0:
                    alerts_to_add.append(Alert(user_id=user_id, message=f"Low temperatures detected ({temp}°C). Frost risk for sensitive crops.", severity="high"))
                    
                if humidity > 85.0:
                    alerts_to_add.append(Alert(user_id=user_id, message=f"High humidity ({humidity}%). Fungal diseases and pests thrive in these conditions. Monitor fields closely.", severity="medium"))
                
                if rain > 20.0:
                    alerts_to_add.append(Alert(user_id=user_id, message=f"Heavy rainfall detected ({rain}mm/h). Potential for waterlogging. Ensure adequate drainage.", severity="medium"))
                    
            if not alerts_to_add:
                alerts_to_add.append(Alert(user_id=user_id, message=f"Current weather conditions in {location} are stable and pose low risk to crops.", severity="low"))
        except Exception as e:
            alerts_to_add.append(Alert(user_id=user_id, message="Could not fetch live weather. Using standard alerts.", severity="low"))
    
    if not alerts_to_add:
        alerts_to_add.append(Alert(user_id=user_id, message="Please set your location to receive real-time weather alerts.", severity="low"))
        
    for alert in alerts_to_add:
        db.session.add(alert)
    db.session.commit()
    
    # Fetch newly created alerts
    alerts = Alert.query.filter_by(user_id=user_id).order_by(Alert.severity.desc()).all()
    
    data = [{
        "id": a.id,
        "message": a.message,
        "severity": a.severity,
        "created_at": a.created_at.isoformat() if a.created_at else None
    } for a in alerts]
    
    return jsonify({"data": data}), 200
