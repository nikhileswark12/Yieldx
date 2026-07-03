# YieldX

## AI-Based Crop Yield Prediction & Smart Farming Decision Support Platform

YieldX is an AI-powered crop yield prediction platform that leverages machine learning and modern web technologies to help farmers, researchers, and agricultural organizations make informed farming decisions. By combining agricultural data, weather information, and predictive analytics, the platform delivers accurate crop yield predictions, intelligent crop recommendations, and interactive analytical insights through a secure web application.

Agriculture is highly dependent on environmental factors such as rainfall, temperature, humidity, and soil conditions. Traditional farming methods often rely on assumptions and historical experience, resulting in inefficient resource utilization and financial losses. YieldX addresses these challenges by integrating Artificial Intelligence, Machine Learning, and real-time weather information into a centralized decision-support platform.

The system follows a modular full-stack architecture consisting of a React frontend, Flask REST APIs, SQL databases, and a hybrid machine learning engine powered by XGBoost and Random Forest models.

---

## Vision

To build a scalable and intelligent agricultural decision-support platform that enables data-driven farming through accurate yield prediction, weather-aware recommendations, and predictive analytics.

---

## Problem Statement

Modern agriculture faces several operational challenges that directly impact productivity and profitability:

- Unpredictable weather conditions affecting crop growth.
- Difficulty selecting suitable crops for varying soil and climate conditions.
- Lack of reliable crop yield prediction systems.
- Inefficient utilization of water, fertilizers, and farming resources.
- Limited access to intelligent decision-support tools.
- Insufficient analytical insights for long-term agricultural planning.

YieldX addresses these challenges through predictive analytics, weather intelligence, and machine learning.

---

## Key Features

- Secure JWT-based authentication
- AI-powered crop yield prediction
- Crop recommendation engine
- Weather forecast integration
- Historical prediction tracking
- Interactive analytics dashboard
- Confidence score generation
- Risk level analysis
- Regional and seasonal analytics
- RESTful API architecture
- Responsive web interface

---

## Technology Stack

| Category | Technologies |
|:---------|:-------------|
| **Frontend** | <img src="https://skillicons.dev/icons?i=react,vite,bootstrap" /> Chart.js (`react-chartjs-2`), Axios |
| **Backend** | <img src="https://skillicons.dev/icons?i=python,flask" /> Flask Blueprints, Flask-SQLAlchemy, Flask-JWT-Extended, RESTful APIs |
| **Machine Learning** | XGBoost, Random Forest, Scikit-learn, Pandas, NumPy, Joblib |
| **Database** | <img src="https://skillicons.dev/icons?i=mysql,sqlite" /> SQLAlchemy ORM |
| **External Services** | OpenWeatherMap API, Mock Weather Fallback |
| **DevOps** | <img src="https://skillicons.dev/icons?i=docker,git,github" /> |

---

## System Architecture

YieldX follows a modular three-tier architecture.

- React + Vite provides the client-side user interface.
- Flask REST APIs handle authentication, business logic, and communication with the machine learning engine.
- JWT authentication secures all protected endpoints.
- XGBoost and Random Forest models perform crop yield prediction and recommendation.
- SQLAlchemy manages persistent data using SQLite during development and MySQL for production.
- Weather information is retrieved through the OpenWeatherMap API with automatic fallback to mock weather data when required.

This architecture enables scalability, maintainability, and independent evolution of each system component.

---

## Machine Learning Pipeline

1. Agricultural Dataset Collection
2. Data Cleaning and Preprocessing
3. Feature Engineering
4. Model Training
5. Hybrid Model Inference
6. Yield Prediction
7. Confidence Score Generation
8. Risk Assessment
9. Prediction Storage

### Model Performance

#### XGBoost

| Metric | Value |
|---------|-------|
| MAE | 1363.45 kg/ha |
| RMSE | 2327.97 kg/ha |
| R² Score | 0.9253 |
| MAPE | 31.05% |

#### Random Forest

| Metric | Value |
|---------|-------|
| R² Score | 0.9354 |

The hybrid inference pipeline combines XGBoost and Random Forest models to improve prediction reliability and overall performance.

---

## Available Modules

### Authentication

- User Registration
- Login
- JWT Authentication
- Profile Management
- Password Management

### Prediction

- Crop Yield Prediction
- Crop Recommendation
- Confidence Score
- Risk Level Assessment

### Weather

- Current Weather
- Weather Forecast
- Mock Weather Support

### Analytics

- Summary Dashboard
- Regional Analytics
- Seasonal Analytics
- Crop Ranking

### Alerts

- Risk Notifications
- Alert Management

### History

- Historical Predictions
- User Prediction Records

---

## REST API Overview

### Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/profile`
- PUT `/api/auth/profile`
- POST `/api/auth/change-password`

### Prediction

- POST `/api/predict/yield`
- POST `/api/predict/crop`
- GET `/api/predict/history`
- GET `/api/predict/{id}`

### Crops

- GET `/api/crops`
- GET `/api/crops/{id}`
- GET `/api/crops/name/{name}`

### Weather

- GET `/api/weather/{location}`
- GET `/api/weather/forecast/{location}`

### Analytics

- GET `/api/analytics/summary`
- GET `/api/analytics/region`
- GET `/api/analytics/seasonal`
- GET `/api/analytics/crop-ranking`

### Alerts

- GET `/api/alerts`

### Health

- GET `/api/health`

---

## Design Principles

- Modular Architecture
- Secure Authentication
- RESTful API Design
- Scalable Machine Learning Pipeline
- Separation of Concerns
- Maintainable Codebase
- Production-Ready Deployment
- Extensible System Design

---

## Current Status

### Completed

- Authentication System
- Crop Yield Prediction
- Crop Recommendation
- Weather Integration
- Analytics Dashboard
- Prediction History
- JWT-Protected APIs
- Responsive React Frontend

### Planned Enhancements

- Prediction Deletion API
- Weather Response Caching
- Automated Test Suite
- Advanced Model Health Monitoring
- Performance Optimization

---

## Future Scope

- Deep Learning models for advanced forecasting
- Satellite imagery integration
- IoT-based soil monitoring
- Fertilizer recommendation engine
- Smart irrigation planning
- React Native mobile application
- Multi-language support
- Kubernetes-based cloud deployment
- AI-powered pest and disease prediction
- Precision agriculture analytics
