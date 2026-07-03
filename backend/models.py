from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    address_line = db.Column(db.String(255), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    profile_pic = db.Column(db.Text, nullable=True)
    farm_size = db.Column(db.Float, nullable=True)
    farming_experience = db.Column(db.Integer, nullable=True)
    preferred_crops = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Crop(db.Model):
    __tablename__ = 'crops'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    season = db.Column(db.String(50))
    min_ph = db.Column(db.Float)
    max_ph = db.Column(db.Float)
    soil_type = db.Column(db.String(100))
    # Additional fields...

class Prediction(db.Model):
    __tablename__ = 'predictions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    crop_type = db.Column(db.String(50))
    nitrogen = db.Column(db.Float)
    phosphorus = db.Column(db.Float)
    potassium = db.Column(db.Float)
    soil_ph = db.Column(db.Float)
    soil_type = db.Column(db.String(50))
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    rainfall = db.Column(db.Float)
    irrigation_type = db.Column(db.String(50))
    season = db.Column(db.String(50))
    fertilizer_used = db.Column(db.Float)
    area_hectares = db.Column(db.Float)
    predicted_yield = db.Column(db.Float)
    total_production = db.Column(db.Float)
    confidence = db.Column(db.Float)
    risk_level = db.Column(db.Enum('low', 'medium', 'high'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class WeatherLog(db.Model):
    __tablename__ = 'weather_logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    location = db.Column(db.String(255))
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    rainfall = db.Column(db.Float)
    description = db.Column(db.String(255))
    fetched_at = db.Column(db.DateTime, default=datetime.utcnow)

class SavedLocation(db.Model):
    __tablename__ = 'saved_locations'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    location_name = db.Column(db.String(255))
    state = db.Column(db.String(100))

class SoilProfile(db.Model):
    __tablename__ = 'soil_profiles'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    location_name = db.Column(db.String(255))
    nitrogen = db.Column(db.Float)
    phosphorus = db.Column(db.Float)
    potassium = db.Column(db.Float)
    soil_ph = db.Column(db.Float)

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(500))
    severity = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CropRecommendation(db.Model):
    __tablename__ = 'crop_recommendations'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prediction_id = db.Column(db.Integer, db.ForeignKey('predictions.id'), nullable=False)
    crop_name = db.Column(db.String(100))
    suitability_score = db.Column(db.Float)
    reason = db.Column(db.String(500))
