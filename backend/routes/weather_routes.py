from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
import requests
import os

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/<string:location>', methods=['GET'])
@jwt_required()
def get_weather(location):
    api_key = os.environ.get('OPENWEATHER_API_KEY')
    if not api_key:
        # Return mock data if API key is not set
        return jsonify({
            "temperature": 28.5,
            "humidity": 65.0,
            "rainfall": 15.0,
            "description": "Mock weather due to missing API key"
        }), 200
        
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    try:
        response = requests.get(url)
        data = response.json()
        if response.status_code == 200:
            return jsonify({
                "temperature": data['main']['temp'],
                "humidity": data['main']['humidity'],
                "rainfall": data.get('rain', {}).get('1h', 0.0),
                "description": data['weather'][0]['description']
            }), 200
        else:
            return jsonify({"message": "Failed to fetch weather"}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@weather_bp.route('/forecast/<string:location>', methods=['GET'])
@jwt_required()
def get_forecast(location):
    api_key = os.environ.get('OPENWEATHER_API_KEY')
    if not api_key:
        from datetime import datetime, timedelta
        mock_list = []
        today = datetime.now()
        for i in range(5):
            day = today + timedelta(days=i)
            mock_list.append({
                "date": day.strftime('%Y-%m-%d'),
                "temperature": round(26.5 + (i * 0.8) - (i % 2 * 1.5), 1),
                "humidity": round(60.0 + (i * 2.0) - (i % 3 * 5.0), 1),
                "rainfall": round(5.0 * (i % 2) + (i * 1.2), 1) if i % 2 == 0 else 0.0,
                "description": "Scattered Clouds" if i % 2 == 0 else "Sunny Day"
            })
        return jsonify({"forecast": mock_list}), 200
        
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={location}&appid={api_key}&units=metric"
    try:
        response = requests.get(url)
        data = response.json()
        if response.status_code == 200:
            forecasts = []
            seen_dates = set()
            for entry in data.get('list', []):
                dt_txt = entry.get('dt_txt', '')
                date_str = dt_txt.split(' ')[0]
                if date_str not in seen_dates and '12:00:00' in dt_txt:
                    seen_dates.add(date_str)
                    forecasts.append({
                        "date": date_str,
                        "temperature": entry['main']['temp'],
                        "humidity": entry['main']['humidity'],
                        "rainfall": entry.get('rain', {}).get('3h', 0.0),
                        "description": entry['weather'][0]['description']
                    })
            
            if not forecasts:
                for entry in data.get('list', []):
                    dt_txt = entry.get('dt_txt', '')
                    date_str = dt_txt.split(' ')[0]
                    if date_str not in seen_dates:
                        seen_dates.add(date_str)
                        forecasts.append({
                            "date": date_str,
                            "temperature": entry['main']['temp'],
                            "humidity": entry['main']['humidity'],
                            "rainfall": entry.get('rain', {}).get('3h', 0.0),
                            "description": entry['weather'][0]['description']
                        })
            return jsonify({"forecast": forecasts[:5]}), 200
        else:
            return jsonify({"message": "Failed to fetch weather forecast"}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

