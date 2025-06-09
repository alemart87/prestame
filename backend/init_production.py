#!/usr/bin/env python3
"""
Script para inicializar la base de datos en producción
"""
import os
import sys
from flask import Flask
from flask_migrate import upgrade
from app import create_app, db
from app.models.user import User
from app.models.lender import LenderProfile
from werkzeug.security import generate_password_hash

def init_database():
    """Inicializar la base de datos en producción"""
    app = create_app()
    
    with app.app_context():
        try:
            # Ejecutar migraciones
            print("🔄 Ejecutando migraciones de base de datos...")
            upgrade()
            print("✅ Migraciones ejecutadas correctamente")
            
            # Verificar si ya existe un superadmin
            existing_admin = User.query.filter_by(email='superadmin@prestame.com').first()
            
            if not existing_admin:
                print("👤 Creando usuario SuperAdmin...")
                
                # Crear usuario SuperAdmin
                admin_user = User(
                    email='superadmin@prestame.com',
                    password_hash=generate_password_hash('SuperAdmin123!'),
                    user_type='admin',
                    is_active=True,
                    is_verified=True
                )
                
                db.session.add(admin_user)
                db.session.commit()
                
                print("✅ Usuario SuperAdmin creado:")
                print(f"   📧 Email: superadmin@prestame.com")
                print(f"   🔑 Password: SuperAdmin123!")
            else:
                print("ℹ️  Usuario SuperAdmin ya existe")
            
            print("🎉 Inicialización de base de datos completada")
            
        except Exception as e:
            print(f"❌ Error durante la inicialización: {str(e)}")
            sys.exit(1)

if __name__ == '__main__':
    init_database() 