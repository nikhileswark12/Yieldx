# Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8.0+ or Docker Desktop
- OpenWeatherMap API Key (Free tier)

## Docker Setup (Recommended)

1. Clone the repository and navigate to the project root.
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
3. Run the following command to start all services (MySQL, Flask Backend, React Frontend via Nginx):
   ```bash
   docker-compose up --build
   ```
4. Access the application at `http://localhost:80` (or `http://localhost:5173` depending on port mappings).

## Manual Setup

### 1. Database

1. Start your local MySQL server.
2. Create the database and load the schema:
   ```bash
   mysql -u root -p -e 'CREATE DATABASE yieldx;'
   mysql -u root -p yieldx < backend/schema.sql
   ```

### 2. Backend (Flask)

1. Navigate to the `backend` directory.
2. Create a virtual environment and activate it:
   ```bash
   .\venv\Scripts\Activate.ps1

   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python run.py
   ```

### 3. Machine Learning Pipeline

1. Navigate to the `ml` directory.
2. Create a virtual environment and activate it.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the training script to generate the models:
   ```bash
   python train.py
   ```

### 4. Frontend (React)

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
