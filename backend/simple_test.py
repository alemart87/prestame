#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, LenderProfile, BorrowerProfile, LoanRequest, Lead
import json

app = create_app()

with app.app_context():
    print("🔍 PROBANDO GUARDADO SIMPLE DE LEADS")
    print("=" * 50)
    
    # Buscar prestamista existente
    lender_user = User.query.filter_by(user_type='lender').first()
    if lender_user:
        lender_profile = LenderProfile.query.filter_by(user_id=lender_user.id).first()
        if lender_profile:
            print(f"✅ Prestamista encontrado: {lender_user.email}")
            
            # Contar leads existentes
            existing_leads = Lead.query.filter_by(lender_id=lender_profile.id).count()
            print(f"📊 Leads existentes: {existing_leads}")
            
            # Mostrar algunos leads
            recent_leads = Lead.query.filter_by(lender_id=lender_profile.id).limit(5).all()
            
            print("\n📋 LEADS RECIENTES:")
            for i, lead in enumerate(recent_leads):
                try:
                    contact_info = json.loads(lead.notes) if lead.notes else {}
                    name = contact_info.get('full_name', 'Sin nombre')
                    phone = contact_info.get('phone_number', 'Sin teléfono')
                    business = contact_info.get('business_type', 'Sin negocio')
                    print(f"   {i+1}. {name} - {phone} - {business}")
                except:
                    print(f"   {i+1}. Lead ID {lead.id} - Datos no parseables")
            
            print(f"\n🎉 TOTAL: {existing_leads} leads disponibles para el prestamista")
        else:
            print("❌ No se encontró perfil de prestamista")
    else:
        print("❌ No se encontró usuario prestamista") 