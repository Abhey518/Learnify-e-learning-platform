import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    
    # Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # JWT
    JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')
    JWT_ALGORITHM = 'HS256'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True

# Get environment
ENV = os.getenv('FLASK_ENV', 'development')

if ENV == 'production':
    config = ProductionConfig()
elif ENV == 'testing':
    config = TestingConfig()
else:
    config = DevelopmentConfig()
