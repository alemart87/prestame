from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from .config import Config
import os

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
ma = Marshmallow()

def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    
    # Cargar configuración desde config.py
    app.config.from_object(config_class)
    
    # Verificar que las variables críticas estén configuradas
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        raise ValueError("DATABASE_URL no está configurada en las variables de entorno")
    
    if not app.config.get('JWT_SECRET_KEY'):
        raise ValueError("JWT_SECRET_KEY no está configurada en las variables de entorno")
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS")}})
    ma.init_app(app)
    
    # Importar modelos para que SQLAlchemy los reconozca
    from app.models.user import User
    from app.models.loan import LoanRequest
    from app.models.lead import Lead
    from app.models.borrower import BorrowerProfile
    from app.models.lender import LenderProfile
    
    # Importar y registrar blueprints
    from app.routes.auth import auth_bp
    from app.routes.lenders import lenders_bp
    from app.routes.borrowers import borrowers_bp
    from app.routes.loans import loans_bp
    from app.routes.stripe_routes import stripe_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(lenders_bp, url_prefix='/api/lenders')
    app.register_blueprint(borrowers_bp, url_prefix='/api/borrowers')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(stripe_bp, url_prefix='/api/stripe')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Registrar comandos CLI
    from . import commands
    commands.register_commands(app)

    return app

# Exportar db para que pueda ser importado
__all__ = ['create_app', 'db']
