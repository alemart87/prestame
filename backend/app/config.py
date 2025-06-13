import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class Config:
    # PostgreSQL Database Configuration - RENDER.COM
    # URL real de PostgreSQL de Render
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://prestame_user:hL99QKuYFqX3HVn6bBRlsGCS4tl9VqbS@dpg-d12c36h5pdvs73cjjhv0-a.oregon-postgres.render.com/prestame'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'tu-clave-secreta-super-segura-para-jwt-cambiar-en-produccion'
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 horas
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.environ.get('JWT_SECRET_KEY')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')
    
    # Claves de Stripe
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
    STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')

    # Clave de OpenAI
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

    # Configuración de email
    SMTP_SERVER = os.environ.get('SMTP_SERVER')
    SMTP_PORT = int(os.environ.get('SMTP_PORT') or 587)
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
    MAIL_SENDER = os.environ.get('MAIL_SENDER')
    
    # Configuración de email (compatibilidad)
    MAIL_SERVER = os.environ.get('SMTP_SERVER')
    MAIL_PORT = int(os.environ.get('SMTP_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', '1', 't']
    MAIL_USERNAME = os.environ.get('SMTP_USERNAME')
    MAIL_PASSWORD = os.environ.get('SMTP_PASSWORD')

    # Configuración de Google OAuth2
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI') or 'http://localhost:3000/auth/google/callback'

class ProductionConfig(Config):
    FLASK_ENV = 'production'
    
    # PostgreSQL Database Configuration - RENDER.COM
    # URL real de PostgreSQL de Render
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://prestame_user:hL99QKuYFqX3HVn6bBRlsGCS4tl9VqbS@dpg-d12c36h5pdvs73cjjhv0-a.oregon-postgres.render.com/prestame'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'tu-clave-secreta-super-segura-para-jwt-cambiar-en-produccion'
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 horas
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.environ.get('JWT_SECRET_KEY')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Claves de Stripe
    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
    STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY') 
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

    # Configuración de Google OAuth2 (Producción)
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI') or 'https://prestame.onrender.com/auth/google/callback' 