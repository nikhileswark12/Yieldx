import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not SECRET_KEY or not JWT_SECRET_KEY:
        raise RuntimeError("SECRET_KEY and JWT_SECRET_KEY must be set in the environment")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    DB_USER = os.environ.get('DB_USER', '')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_HOST = os.environ.get('DB_HOST', '')
    DB_NAME = os.environ.get('DB_NAME', 'yieldx')
    
    # Use PyMySQL driver, fallback to SQLite if DB_HOST or DB_USER is not provided
    from urllib.parse import quote_plus
    if DB_HOST and DB_USER:
        encoded_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ''
        SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
    else:
        base_dir = os.path.abspath(os.path.dirname(__file__))
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(base_dir, 'yieldx.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

config_by_name = dict(
    development=DevelopmentConfig,
    production=ProductionConfig,
    testing=TestingConfig
)
