from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import csv
import os

# Load environment variables early so config.py can read them
load_dotenv()

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate

from config import config_by_name
from models import db, Crop

# Initialize rate limiter
# NOTE: Currently using default in-memory storage. This resets on restart 
# and is not suitable for multi-worker production deployment.
# For production upgrade path, configure a Redis backend, e.g.:
# storage_uri="redis://localhost:6379"
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

def bootstrap_crops(db, Crop):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'Crop_Recommendation.csv')
    
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}, skipping crop bootstrap.")
        return
        
    try:
        if Crop.query.first() is not None:
            # Already bootstrapped
            return
            
        crops_data = {}
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                crop_name = row['Crop'].strip().lower()
                ph = float(row['pH_Value'])
                rainfall = float(row['Rainfall'])
                
                if crop_name not in crops_data:
                    crops_data[crop_name] = {
                        'ph_values': [],
                        'rainfalls': []
                    }
                crops_data[crop_name]['ph_values'].append(ph)
                crops_data[crop_name]['rainfalls'].append(rainfall)
        
        for crop_name, data in crops_data.items():
            min_ph = min(data['ph_values'])
            max_ph = max(data['ph_values'])
            avg_rainfall = sum(data['rainfalls']) / len(data['rainfalls'])
            
            if avg_rainfall > 120:
                season = 'kharif'
            elif avg_rainfall < 70:
                season = 'zaid'
            else:
                season = 'rabi'
                
            if crop_name in ['rice', 'sugarcane']:
                soil_type = 'clay'
            elif crop_name in ['chickpea', 'lentil']:
                soil_type = 'sandy'
            else:
                soil_type = 'loamy'
                
            crop_record = Crop(
                name=crop_name,
                season=season,
                min_ph=round(min_ph, 2),
                max_ph=round(max_ph, 2),
                soil_type=soil_type
            )
            db.session.add(crop_record)
        db.session.commit()
        print(f"Successfully bootstrapped {len(crops_data)} crops from CSV dataset.")
    except Exception as e:
        print(f"Error bootstrapping crops from CSV: {e}")

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost')
    CORS(app, origins=[frontend_url])
    db.init_app(app)
    jwt = JWTManager(app)
    limiter.init_app(app)
    migrate = Migrate(app, db)

    with app.app_context():
        # db.create_all() replaced by migrations
        bootstrap_crops(db, Crop)

    # Register Blueprints
    from routes.auth_routes import auth_bp
    from routes.predict_routes import predict_bp
    from routes.crops_routes import crops_bp
    from routes.weather_routes import weather_bp
    from routes.analytics_routes import analytics_bp
    from routes.health_routes import health_bp
    from routes.alerts_routes import alerts_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(crops_bp, url_prefix='/api/crops')
    app.register_blueprint(weather_bp, url_prefix='/api/weather')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(health_bp, url_prefix='/api/health')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')

    return app

