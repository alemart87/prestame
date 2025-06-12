from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import LenderProfile, LoanRequest, LenderLead, User, BorrowerProfile
from app import db
from sqlalchemy.orm import joinedload
from sqlalchemy import text

lender_bp = Blueprint('lender', __name__)

@lender_bp.route('/leads', methods=['GET'])
@jwt_required()
def get_leads_for_lender():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.lender_profile:
        return jsonify({'error': 'Perfil de prestamista no válido'}), 404

    lender_profile = user.lender_profile

    # Obtener los IDs de los leads ya comprados por este prestamista
    purchased_lead_ids = set()
    purchased_leads = db.session.query(LenderLead.loan_request_id).filter_by(lender_id=lender_profile.id).all()
    purchased_lead_ids = {lead[0] for lead in purchased_leads}

    leads_data = []

    try:
        # 1. OBTENER SOLICITUDES DE PRÉSTAMO REALES (loan_requests)
        print("🔍 Buscando loan_requests...")
        loan_requests = db.session.query(LoanRequest).filter_by(status='active').all()
        print(f"📊 Encontrados {len(loan_requests)} loan_requests")

        for loan_request in loan_requests:
            is_purchased = loan_request.id in purchased_lead_ids
            
            lead_dict = {
                'id': loan_request.id,
                'type': 'loan_request',
                'amount': float(loan_request.amount) if loan_request.amount else 0,
                'term_months': loan_request.term_months or 12,
                'purpose': loan_request.purpose or 'No especificado',
                'payment_frequency': loan_request.payment_frequency or 'monthly',
                'status': loan_request.status,
                'created_at': loan_request.created_at.isoformat() if loan_request.created_at else None,
                'is_purchased': is_purchased,
                'source': 'real_user'
            }
            
            # Agregar información del perfil del prestatario si existe
            if loan_request.borrower_profile:
                borrower_profile = loan_request.borrower_profile
                lead_dict['borrower_profile'] = {
                    'score': borrower_profile.score or 0,
                    'employment_status': borrower_profile.employment_status or 'No especificado',
                    'dependents': borrower_profile.dependents or 0,
                    'debt_to_income_ratio': borrower_profile.debt_to_income_ratio or 0
                }
                
                # Agregar información de ubicación general
                if borrower_profile.user:
                    lead_dict['location'] = {
                        'city': borrower_profile.user.city or 'No especificado',
                        'department': borrower_profile.user.department or 'No especificado'
                    }
                    
                    # Solo agregar datos de contacto si está comprado
                    if is_purchased:
                        lead_dict['contact'] = {
                            'email': borrower_profile.user.email,
                            'phone': borrower_profile.user.phone,
                            'full_name': f"{borrower_profile.user.first_name} {borrower_profile.user.last_name}",
                            'address': borrower_profile.user.address
                        }
            else:
                # Valores por defecto si no hay perfil
                lead_dict['borrower_profile'] = {
                    'score': 50,
                    'employment_status': 'No especificado',
                    'dependents': 0,
                    'debt_to_income_ratio': 0
                }
                lead_dict['location'] = {
                    'city': 'No especificado',
                    'department': 'No especificado'
                }
            
            leads_data.append(lead_dict)

        # 2. OBTENER LEADS SCRAPEADOS (tabla leads)
        print("🔍 Buscando leads scrapeados...")
        leads_query = text("""
            SELECT id, loan_request_id, status, created_at, notes
            FROM leads 
            WHERE status = 'new'
            ORDER BY created_at DESC
            LIMIT 50
        """)
        
        leads_result = db.session.execute(leads_query)
        scraped_leads = leads_result.fetchall()
        print(f"📊 Encontrados {len(scraped_leads)} leads scrapeados")
        
        for lead_row in scraped_leads:
            # Para leads scrapeados, usamos un ID único que no conflicte
            unique_id = f"scraped_{lead_row[0]}"
            is_purchased = False  # Los leads scrapeados no se pueden comprar aún
            
            lead_dict = {
                'id': unique_id,
                'type': 'scraped_lead',
                'status': lead_row[2],
                'created_at': lead_row[3].isoformat() if lead_row[3] else None,
                'is_purchased': is_purchased,
                'source': 'scraped_data',
                'original_lead_id': lead_row[0]
            }
            
            # Intentar parsear datos del campo notes
            try:
                if lead_row[4]:  # notes field
                    import json
                    notes_data = json.loads(lead_row[4])
                    lead_dict.update({
                        'amount': float(notes_data.get('amount', 1000000)),
                        'term_months': int(notes_data.get('term_months', 12)),
                        'purpose': notes_data.get('purpose', 'Lead scrapeado'),
                        'payment_frequency': notes_data.get('payment_frequency', 'monthly')
                    })
                    
                    # Información del contacto si está en notes
                    if 'contact' in notes_data:
                        contact_data = notes_data['contact']
                        lead_dict['location'] = {
                            'city': contact_data.get('city', 'No especificado'),
                            'department': contact_data.get('department', 'No especificado')
                        }
                        
                        # Score simulado para leads scrapeados
                        lead_dict['borrower_profile'] = {
                            'score': 65,  # Score promedio
                            'employment_status': 'Empleado',
                            'dependents': 1,
                            'debt_to_income_ratio': 0.4
                        }
                        
                        # Solo mostrar contacto si está comprado (nunca para scrapeados por ahora)
                        if is_purchased:
                            lead_dict['contact'] = contact_data
                else:
                    # Valores por defecto si no hay notes
                    lead_dict.update({
                        'amount': 2000000,
                        'term_months': 18,
                        'purpose': 'Lead importado',
                        'payment_frequency': 'monthly'
                    })
                    lead_dict['location'] = {
                        'city': 'Asunción',
                        'department': 'Central'
                    }
                    lead_dict['borrower_profile'] = {
                        'score': 60,
                        'employment_status': 'Empleado',
                        'dependents': 0,
                        'debt_to_income_ratio': 0.3
                    }
                    
            except (json.JSONDecodeError, TypeError, ValueError) as e:
                print(f"Error parseando notes del lead {lead_row[0]}: {str(e)}")
                # Usar valores por defecto
                lead_dict.update({
                    'amount': 1500000,
                    'term_months': 12,
                    'purpose': 'Lead importado',
                    'payment_frequency': 'monthly'
                })
                lead_dict['location'] = {
                    'city': 'No especificado',
                    'department': 'No especificado'
                }
                lead_dict['borrower_profile'] = {
                    'score': 55,
                    'employment_status': 'No especificado',
                    'dependents': 0,
                    'debt_to_income_ratio': 0.35
                }
            
            leads_data.append(lead_dict)

        print(f"✅ Total de leads preparados: {len(leads_data)}")

    except Exception as e:
        print(f"❌ Error al obtener leads: {str(e)}")
        return jsonify({
            'error': 'Error al cargar leads',
            'details': str(e)
        }), 500

    return jsonify({
        'leads': leads_data,
        'lender_credits': lender_profile.lead_credits,
        'ai_search_credits': lender_profile.ai_search_credits,
        'total_leads': len(leads_data),
        'purchased_count': len(purchased_lead_ids)
    }), 200

@lender_bp.route('/purchase-lead', methods=['POST'])
@jwt_required()
def purchase_lead():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    lender_profile = user.lender_profile

    if not lender_profile:
        return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404

    data = request.get_json()
    lead_id = data.get('lead_id')

    # Verificar si es un lead scrapeado (no se puede comprar aún)
    if isinstance(lead_id, str) and lead_id.startswith('scraped_'):
        return jsonify({'error': 'Los leads scrapeados no están disponibles para compra aún'}), 400

    if not lead_id:
        return jsonify({'error': 'ID del lead es requerido'}), 400

    if lender_profile.lead_credits <= 0:
        return jsonify({'error': 'Créditos de leads insuficientes'}), 402

    # Verificar si ya compró este lead
    existing_purchase = LenderLead.query.filter_by(
        lender_id=lender_profile.id,
        loan_request_id=lead_id
    ).first()
    if existing_purchase:
        return jsonify({'error': 'Ya has adquirido este lead'}), 409

    try:
        # Realizar la transacción
        lender_profile.lead_credits -= 1
        
        new_purchase = LenderLead(
            lender_id=lender_profile.id,
            loan_request_id=lead_id
        )
        
        db.session.add(new_purchase)
        db.session.commit()

        # Obtener el lead comprado con información de contacto
        loan_request = LoanRequest.query.get(lead_id)
        
        return jsonify({
            'success': True,
            'message': 'Lead adquirido con éxito',
            'remaining_credits': lender_profile.lead_credits,
            'purchased_lead': {
                'id': loan_request.id,
                'amount': loan_request.amount,
                'contact': {
                    'email': loan_request.borrower_profile.user.email if loan_request.borrower_profile and loan_request.borrower_profile.user else None,
                    'phone': loan_request.borrower_profile.user.phone if loan_request.borrower_profile and loan_request.borrower_profile.user else None,
                    'full_name': f"{loan_request.borrower_profile.user.first_name} {loan_request.borrower_profile.user.last_name}" if loan_request.borrower_profile and loan_request.borrower_profile.user else None
                }
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error en purchase_lead: {str(e)}")
        return jsonify({'error': 'Error procesando la compra', 'details': str(e)}), 500

@lender_bp.route('/purchased-leads', methods=['GET'])
@jwt_required()
def get_purchased_leads():
    try:
        current_user_id = get_jwt_identity()
        
        # Obtener el perfil del prestamista
        lender_profile = LenderProfile.query.filter_by(user_id=current_user_id).first()
        if not lender_profile:
            return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
        
        # Obtener todos los leads comprados por este prestamista
        purchased_leads = db.session.query(
            LenderLead,
            LoanRequest,
            BorrowerProfile,
            User
        ).join(
            LoanRequest, LenderLead.loan_request_id == LoanRequest.id
        ).join(
            BorrowerProfile, LoanRequest.borrower_id == BorrowerProfile.id
        ).join(
            User, BorrowerProfile.user_id == User.id
        ).filter(
            LenderLead.lender_id == lender_profile.id
        ).order_by(
            LenderLead.purchased_at.desc()
        ).all()
        
        # Formatear los datos
        leads_data = []
        for lender_lead, loan_request, borrower_profile, user in purchased_leads:
            lead_data = {
                'id': loan_request.id,
                'purchase_id': lender_lead.id,
                'amount': loan_request.amount,
                'purpose': loan_request.purpose,
                'term_months': loan_request.term_months,
                'payment_frequency': loan_request.payment_frequency,
                'status': loan_request.status,
                'created_at': loan_request.created_at.isoformat(),
                'purchased_at': lender_lead.purchased_at.isoformat(),
                'contact_unlocked': lender_lead.contact_unlocked,
                
                # Información del prestatario (siempre visible porque ya se compró)
                'borrower': {
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'phone': user.phone,
                    'city': borrower_profile.city,
                    'monthly_income': borrower_profile.monthly_income,
                    'employment_status': borrower_profile.employment_status,
                    'katupyry_score': borrower_profile.katupyry_score
                }
            }
            leads_data.append(lead_data)
        
        return jsonify({
            'success': True,
            'leads': leads_data,
            'total': len(leads_data)
        })
        
    except Exception as e:
        print(f"Error getting purchased leads: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500 