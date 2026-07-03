import base64
import os
from werkzeug.security import generate_password_hash
from backend_app import create_app
from models import db, User, Prediction

app = create_app('development')

with app.app_context():
    email = "yieldx@test.com"
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print("Creating new user yieldx@test.com...")
        user = User(
            name="yieldx",
            email=email,
            password_hash=generate_password_hash("yieldx@123", method='pbkdf2:sha256'),
            phone="9876543210",
            state="Maharashtra",
            district="Pune",
            farm_size=12.5,
            farming_experience=8,
            preferred_crops="Rice, Sugarcane, Wheat"
        )
        db.session.add(user)
        db.session.commit()
    else:
        print("User yieldx@test.com already exists. Updating details...")
        user.password_hash = generate_password_hash("yieldx@123", method='pbkdf2:sha256')
        user.phone = "9876543210"
        user.state = "Maharashtra"
        user.district = "Pune"
        user.farm_size = 12.5
        user.farming_experience = 8
        user.preferred_crops = "Rice, Sugarcane, Wheat"
        db.session.commit()

    # 2. Add profile_pic from image.jpg
    image_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'image.jpg')
    if os.path.exists(image_path):
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            # Provide data URL format
            user.profile_pic = f"data:image/jpeg;base64,{encoded_string}"
        db.session.commit()
        print(f"Profile picture updated from {image_path}.")
    else:
        print(f"WARN: Image not found at {image_path}")

    # 3. Add fake predictions
    fake_preds = [
        {
            "crop_type": "Wheat",
            "nitrogen": 45.0,
            "phosphorus": 25.0,
            "potassium": 35.0,
            "soil_ph": 6.8,
            "soil_type": "loamy",
            "temperature": 24.5,
            "humidity": 55.0,
            "rainfall": 120.0,
            "irrigation_type": "drip",
            "season": "rabi",
            "fertilizer_used": 60.0,
            "area_hectares": 4.5,
            "predicted_yield": 4.2,
            "total_production": 18.9,
            "confidence": 0.88,
            "risk_level": "low"
        },
        {
            "crop_type": "Sugarcane",
            "nitrogen": 70.0,
            "phosphorus": 45.0,
            "potassium": 50.0,
            "soil_ph": 7.2,
            "soil_type": "clay",
            "temperature": 32.0,
            "humidity": 80.0,
            "rainfall": 250.0,
            "irrigation_type": "flood",
            "season": "kharif",
            "fertilizer_used": 120.0,
            "area_hectares": 8.0,
            "predicted_yield": 85.0,
            "total_production": 680.0,
            "confidence": 0.92,
            "risk_level": "medium"
        },
        {
            "crop_type": "Rice",
            "nitrogen": 65.0,
            "phosphorus": 30.0,
            "potassium": 40.0,
            "soil_ph": 6.0,
            "soil_type": "clay",
            "temperature": 28.0,
            "humidity": 85.0,
            "rainfall": 300.0,
            "irrigation_type": "flood",
            "season": "kharif",
            "fertilizer_used": 90.0,
            "area_hectares": 6.0,
            "predicted_yield": 5.5,
            "total_production": 33.0,
            "confidence": 0.85,
            "risk_level": "low"
        }
    ]
    
    # Check if user already has predictions to avoid duplicates
    existing_preds = Prediction.query.filter_by(user_id=user.id).count()
    if existing_preds < 3:
        for pred_data in fake_preds:
            pred = Prediction(user_id=user.id, **pred_data)
            db.session.add(pred)
        db.session.commit()
        print(f"Added {len(fake_preds)} fake predictions for user yieldx.")
    else:
        print("User yieldx already has predictions, skipping prediction seeding.")

    print("Database seeding completed.")
