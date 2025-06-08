#!/usr/bin/env python3
"""
Script para verificar usuarios en la base de datos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, LenderProfile

def check_users():
    """Verificar usuarios en la base de datos"""
    
    app = create_app()
    
    with app.app_context():
        print("🔍 VERIFICANDO USUARIOS EN LA BASE DE DATOS")
        print("=" * 60)
        
        # Obtener todos los usuarios
        users = User.query.all()
        print(f"📊 Total de usuarios: {len(users)}")
        print()
        
        for i, user in enumerate(users, 1):
            print(f"{i}. Email: {user.email}")
            print(f"   Nombre: {user.first_name} {user.last_name}")
            print(f"   Tipo: {user.user_type}")
            print(f"   Activo: {user.is_active}")
            
            if user.user_type == 'lender':
                lender_profile = LenderProfile.query.filter_by(user_id=user.id).first()
                if lender_profile:
                    print(f"   Créditos: {lender_profile.ai_search_credits}")
                else:
                    print(f"   ❌ Sin perfil de prestamista")
            
            print()

if __name__ == "__main__":
    check_users() 