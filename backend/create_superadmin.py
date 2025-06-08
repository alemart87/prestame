#!/usr/bin/env python3
"""
Script para crear un usuario SuperAdmin
"""

import sys
import os

# Agregar el directorio del proyecto al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from werkzeug.security import generate_password_hash

def create_superadmin():
    """Crear un usuario SuperAdmin"""
    app = create_app()
    
    with app.app_context():
        # Verificar si ya existe un superadmin
        existing_admin = User.query.filter_by(user_type='superadmin').first()
        if existing_admin:
            print(f"Ya existe un SuperAdmin: {existing_admin.email}")
            return
        
        # Datos del superadmin
        email = "admin@prestame.com.py"
        password = "admin123"  # Cambiar por una contraseña segura
        
        # Crear usuario superadmin
        superadmin = User(
            email=email,
            password=password,  # Se hashea automáticamente en el modelo
            first_name="Super",
            last_name="Admin",
            user_type="superadmin",
            phone="+595 21 123456",
            city="Asunción",
            department="Central",
            is_active=True
        )
        
        try:
            db.session.add(superadmin)
            db.session.commit()
            
            print("✅ SuperAdmin creado exitosamente!")
            print(f"📧 Email: {email}")
            print(f"🔑 Password: {password}")
            print("⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
            
        except Exception as e:
            print(f"❌ Error creando SuperAdmin: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    create_superadmin() 