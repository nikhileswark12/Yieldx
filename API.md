# YieldX API Documentation

Base URL: `/api`

## Authentication (`/api/auth`)
- `POST /register`: Register a new farmer account
- `POST /login`: Login and receive JWT access token
- `GET /profile`: Get authenticated user’s profile (Requires JWT)
- `PUT /profile`: Update user profile (Requires JWT)
- `POST /change-password`: Change password (Requires JWT)

## Prediction (`/api/predict`)
- `POST /yield`: Submit inputs; returns yield, confidence, risk, recommendations (Requires JWT)
- `POST /crop`: Get top-3 crop recommendations for given soil/season (Requires JWT)
- `GET /history`: Paginated prediction history with filters (Requires JWT)
- `GET /{id}`: Full details of a specific prediction (Requires JWT)
- `DELETE /{id}`: Delete a prediction record (Requires JWT)

## Crops (`/api/crops`)
- `GET /`: List all supported crops
- `GET /{id}`: Crop by numeric ID
- `GET /name/{name}`: Crop by name

## Weather (`/api/weather`)
- `GET /{location}`: Fetch & cache current weather (Requires JWT)
- `GET /forecast/{location}`: 5-day weather forecast (Requires JWT)

## Analytics (`/api/analytics`)
- `GET /region`: Regional yield stats by state/crop (Requires JWT)
- `GET /seasonal`: Seasonal analytics Kharif/Rabi/Zaid (Requires JWT)
- `GET /crop-ranking`: Top crops by avg yield for a region (Requires JWT)
- `GET /summary`: User summary — totals, top crop, avg yield (Requires JWT)

## Health (`/api/health`)
- `GET /`: API health — status, DB, ML model load
