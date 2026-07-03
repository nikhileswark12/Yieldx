CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    state VARCHAR(100),
    district VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    season VARCHAR(50),
    min_ph FLOAT,
    max_ph FLOAT,
    soil_type VARCHAR(100)
);

CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    crop_type VARCHAR(50),
    nitrogen FLOAT,
    phosphorus FLOAT,
    potassium FLOAT,
    soil_ph FLOAT,
    soil_type VARCHAR(50),
    temperature FLOAT,
    humidity FLOAT,
    rainfall FLOAT,
    irrigation_type VARCHAR(50),
    season VARCHAR(50),
    fertilizer_used FLOAT,
    area_hectares FLOAT,
    predicted_yield FLOAT,
    total_production FLOAT,
    confidence FLOAT,
    risk_level ENUM('low', 'medium', 'high'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE weather_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255),
    temperature FLOAT,
    humidity FLOAT,
    rainfall FLOAT,
    description VARCHAR(255),
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_name VARCHAR(255),
    state VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE soil_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_name VARCHAR(255),
    nitrogen FLOAT,
    phosphorus FLOAT,
    potassium FLOAT,
    soil_ph FLOAT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(500),
    severity VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE crop_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    crop_name VARCHAR(100),
    suitability_score FLOAT,
    reason VARCHAR(500),
    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE
);

-- Views
CREATE VIEW avg_yield_by_crop_state AS
SELECT crop_type, state, AVG(predicted_yield) as avg_yield, MIN(predicted_yield) as min_yield, MAX(predicted_yield) as max_yield
FROM predictions p
JOIN users u ON p.user_id = u.id
GROUP BY crop_type, state;

CREATE VIEW recent_predictions_view AS
SELECT p.*, u.name as user_name
FROM predictions p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 100;
