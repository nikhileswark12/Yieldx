import random
from datetime import datetime, timedelta
from backend_app import create_app
from models import db, User, Prediction

app = create_app('development')

CROPS = ['Wheat', 'Sugarcane', 'Rice', 'Cotton', 'Maize', 'Soybean', 'Tomato', 'Potato']
SEASONS = ['rabi', 'kharif', 'zaid']
SOIL_TYPES = ['loamy', 'clay', 'sandy', 'black', 'red']
IRRIGATION_TYPES = ['drip', 'sprinkler', 'flood', 'rainfed']
RISK_LEVELS = ['low', 'medium', 'high']

with app.app_context():
    email = "yieldx@test.com"
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print("User yieldx@test.com not found. Please run seed_db.py first.")
        exit(1)
        
    print(f"Adding 25 fake predictions for {user.name} ({user.email})...")
    
    now = datetime.utcnow()
    
    for i in range(25):
        crop = random.choice(CROPS)
        # Random date in the last 180 days
        days_ago = random.randint(1, 180)
        pred_date = now - timedelta(days=days_ago)
        
        # Base realistic stats
        area = round(random.uniform(1.0, 20.0), 1)
        yield_per_ha = round(random.uniform(2.5, 8.5) if crop != 'Sugarcane' else random.uniform(50.0, 90.0), 1)
        total_prod = round(area * yield_per_ha, 1)
        
        pred = Prediction(
            user_id=user.id,
            crop_type=crop,
            nitrogen=round(random.uniform(20.0, 120.0), 1),
            phosphorus=round(random.uniform(10.0, 60.0), 1),
            potassium=round(random.uniform(15.0, 70.0), 1),
            soil_ph=round(random.uniform(5.0, 8.5), 1),
            soil_type=random.choice(SOIL_TYPES),
            temperature=round(random.uniform(15.0, 40.0), 1),
            humidity=round(random.uniform(40.0, 95.0), 1),
            rainfall=round(random.uniform(50.0, 300.0), 1),
            irrigation_type=random.choice(IRRIGATION_TYPES),
            season=random.choice(SEASONS),
            fertilizer_used=round(random.uniform(30.0, 150.0), 1),
            area_hectares=area,
            predicted_yield=yield_per_ha,
            total_production=total_prod,
            confidence=round(random.uniform(0.70, 0.98), 2),
            risk_level=random.choice(RISK_LEVELS),
            created_at=pred_date
        )
        db.session.add(pred)
        
    db.session.commit()
    print("Successfully added 25 fake predictions!")
