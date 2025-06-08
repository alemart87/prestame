#!/usr/bin/env python3
"""
Script para agregar créditos de búsqueda a un usuario prestamista
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, LenderProfile

def add_credits_to_user(email, credits=10):
    """Agregar créditos de búsqueda a un usuario"""
    
    app = create_app()
    
    with app.app_context():
        print(f"🔍 AGREGANDO CRÉDITOS A USUARIO: {email}")
        print("=" * 50)
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"❌ Usuario {email} no encontrado")
            return False
        
        print(f"✅ Usuario encontrado: {user.first_name} {user.last_name}")
        
        # Buscar perfil de prestamista
        lender_profile = LenderProfile.query.filter_by(user_id=user.id).first()
        if not lender_profile:
            print("❌ Perfil de prestamista no encontrado")
            return False
        
        print(f"📊 Créditos actuales: {lender_profile.ai_search_credits}")
        
        # Agregar créditos
        lender_profile.ai_search_credits += credits
        
        try:
            db.session.commit()
            print(f"✅ {credits} créditos agregados exitosamente")
            print(f"📊 Créditos totales: {lender_profile.ai_search_credits}")
            return True
        except Exception as e:
            print(f"❌ Error guardando: {str(e)}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    # Agregar créditos al usuario principal
    add_credits_to_user('alemart8723@gmail.com', 20) 