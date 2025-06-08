import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import User, LenderProfile, Lead, LoanRequest, BorrowerProfile
from app.schemas import LenderProfileSchema, LeadSchema, LoanRequestSchema
from app import db
from app.models.lead import Lead

lenders_bp = Blueprint('lenders', __name__)
lender_schema = LenderProfileSchema()
lead_schema = LeadSchema()
leads_schema = LeadSchema(many=True)
loan_request_schema = LoanRequestSchema()

def is_lender():
    """Verifica si el usuario autenticado es un prestamista"""
    claims = get_jwt()
    return claims.get('user_type') == 'lender'

@lenders_bp.route('/leads', methods=['GET'])
@jwt_required()
def get_leads():
    """Endpoint para obtener los leads disponibles para el prestamista"""
    try:
        # Verificar que el usuario sea un prestamista
        if not is_lender():
            return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestamista (para verificar que existe)
        lender_profile = LenderProfile.query.filter_by(user_id=user_id).first()
        if not lender_profile:
            return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
        
        # Filtros
        status = request.args.get('status', 'all')
        min_score = request.args.get('min_score', 0, type=int)
        max_amount = request.args.get('max_amount', 0, type=float)
        
        # Buscar leads por lender_id (que es lender_profile.id)
        query = Lead.query.filter_by(lender_id=lender_profile.id)
        
        if status != 'all':
            query = query.filter_by(status=status)
        
        leads = query.all()
        
        # Procesar leads y agregar información del scraper
        processed_leads = []
        for lead in leads:
            loan_request = LoanRequest.query.get(lead.loan_request_id)
            if loan_request:
                borrower_profile = BorrowerProfile.query.get(loan_request.borrower_profile_id)
                if borrower_profile:
                    score = borrower_profile.calculate_score()
                    if score >= min_score and (max_amount == 0 or loan_request.amount <= max_amount):
                        
                        # Parsear información del scraper desde notes
                        contact_info = {}
                        if lead.notes:
                            try:
                                contact_info = json.loads(lead.notes)
                            except:
                                contact_info = {}
                        
                        # Crear objeto lead con información completa
                        lead_data = lead_schema.dump(lead)
                        lead_data['contact'] = contact_info
                        lead_data['loan_request'] = loan_request_schema.dump(loan_request)
                        
                        processed_leads.append(lead_data)
        
        return jsonify({
            'leads': processed_leads
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN GET LEADS: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@lenders_bp.route('/leads/<int:lead_id>', methods=['GET'])
@jwt_required()
def get_lead(lead_id):
    """Endpoint para obtener un lead específico"""
    try:
        # Verificar que el usuario sea un prestamista
        if not is_lender():
            return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestamista
        lender_profile = LenderProfile.query.filter_by(user_id=user_id).first()
        if not lender_profile:
            return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
        
        # Buscar lead por lender_id
        lead = Lead.query.filter_by(id=lead_id, lender_id=lender_profile.id).first()
        if not lead:
            return jsonify({'error': 'Lead no encontrado'}), 404
        
        # Marcar lead como visto si no lo estaba
        if not lead.viewed:
            lead.mark_as_viewed()
            db.session.commit()
        
        # Buscar detalles del préstamo
        loan_request = LoanRequest.query.get(lead.loan_request_id)
        if not loan_request:
            return jsonify({'error': 'Solicitud de préstamo no encontrada'}), 404
        
        # Buscar detalles del prestatario
        borrower_profile = BorrowerProfile.query.get(loan_request.borrower_profile_id)
        if not borrower_profile:
            return jsonify({'error': 'Perfil de prestatario no encontrado'}), 404
        
        # Buscar detalles del usuario
        borrower_user = User.query.get(borrower_profile.user_id)
        if not borrower_user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Incluir score del prestatario
        score = borrower_profile.calculate_score()
        
        return jsonify({
            'lead': lead_schema.dump(lead),
            'loan_request': loan_request_schema.dump(loan_request),
            'borrower': {
                'name': f'{borrower_user.first_name} {borrower_user.last_name}',
                'score': score,
                'city': borrower_user.city,
                'department': borrower_user.department,
                'employment_status': borrower_profile.employment_status,
                'monthly_income': borrower_profile.monthly_income,
                'debt_to_income_ratio': borrower_profile.debt_to_income_ratio
            }
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN GET LEAD: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@lenders_bp.route('/leads/<int:lead_id>/contact', methods=['POST'])
@jwt_required()
def contact_lead(lead_id):
    """Endpoint para marcar un lead como contactado"""
    # Verificar que el usuario sea un prestamista
    if not is_lender():
        return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
    
    user_id = get_jwt_identity()
    
    # Buscar perfil del prestamista
    lender_profile = LenderProfile.query.filter_by(user_id=user_id).first()
    if not lender_profile:
        return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
    
    # CORREGIDO: Buscar lead por lender_id (user_id) en lugar de lender_profile_id
    lead = Lead.query.filter_by(id=lead_id, lender_id=user_id).first()
    if not lead:
        return jsonify({'error': 'Lead no encontrado'}), 404
    
    # Marcar lead como contactado
    lead.mark_as_contacted()
    db.session.commit()
    
    # Buscar detalles del prestatario para obtener la información de contacto
    loan_request = LoanRequest.query.get(lead.loan_request_id)
    if not loan_request:
        return jsonify({'error': 'Solicitud de préstamo no encontrada'}), 404
    
    borrower_profile = BorrowerProfile.query.get(loan_request.borrower_profile_id)
    if not borrower_profile:
        return jsonify({'error': 'Perfil de prestatario no encontrado'}), 404
    
    borrower_user = User.query.get(borrower_profile.user_id)
    if not borrower_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify({
        'message': 'Lead marcado como contactado exitosamente',
        'contact_info': {
            'email': borrower_user.email,
            'phone': borrower_user.phone
        }
    }), 200

@lenders_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_lender_profile():
    """Endpoint para obtener el perfil del prestamista con créditos"""
    try:
        # Verificar que el usuario sea un prestamista
        if not is_lender():
            return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestamista
        lender_profile = LenderProfile.query.filter_by(user_id=user_id).first()
        if not lender_profile:
            return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
        
        return jsonify({
            'profile': {
                'ai_search_credits': lender_profile.ai_search_credits,
                'current_package': lender_profile.current_package,
                'leads_remaining': lender_profile.leads_remaining,
                'total_loans_funded': lender_profile.total_loans_funded
            }
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN GET LENDER PROFILE: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@lenders_bp.route('/packages', methods=['GET'])
@jwt_required()
def get_packages():
    """Endpoint para obtener los paquetes de leads disponibles"""
    try:
        # Verificar que el usuario sea un prestamista
        if not is_lender():
            return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
        
        # Definir paquetes disponibles
        packages = [
            {
                'id': 'basic',
                'name': 'Básico',
                'leads': 10,
                'price': 100000,
                'description': 'Acceso a 10 leads con score mínimo de 500'
            },
            {
                'id': 'premium',
                'name': 'Premium',
                'leads': 30,
                'price': 250000,
                'description': 'Acceso a 30 leads con score mínimo de 650'
            },
            {
                'id': 'gold',
                'name': 'Gold',
                'leads': 100,
                'price': 600000,
                'description': 'Acceso a 100 leads con score mínimo de 750'
            }
        ]
        
        return jsonify({
            'packages': packages
        }), 200
        
    except Exception as e:
        print(f"ERROR EN GET PACKAGES: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500
        print(f"ERROR EN GET PACKAGES: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@lenders_bp.route('/leads/purchase', methods=['POST'])
@jwt_required()
def purchase_lead():
    """Endpoint para comprar un lead individual"""
    # Verificar que el usuario sea un prestamista
    if not is_lender():
        return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
    
    user_id = get_jwt_identity()
    data = request.get_json()
    loan_request_id = data.get('loan_request_id')
    
    if not loan_request_id:
        return jsonify({'error': 'ID de solicitud de préstamo requerido'}), 400
    
    # Buscar perfil del prestamista
    lender_profile = LenderProfile.query.filter_by(user_id=user_id).first()
    if not lender_profile:
        return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
    
    # Verificar que tenga leads disponibles
    if lender_profile.leads_remaining <= 0:
        return jsonify({'error': 'No tienes leads disponibles. Compra un paquete primero.'}), 400
    
    # Buscar la solicitud de préstamo
    loan_request = LoanRequest.query.get(loan_request_id)
    if not loan_request:
        return jsonify({'error': 'Solicitud de préstamo no encontrada'}), 404
    
    # Verificar que la solicitud esté activa
    if loan_request.status != 'active':
        return jsonify({'error': 'Esta solicitud de préstamo ya no está disponible'}), 400
    
    # CORREGIDO: Verificar si ya compró este lead usando lender_id
    existing_lead = Lead.query.filter_by(
        lender_id=user_id,
        loan_request_id=loan_request_id
    ).first()
    
    if existing_lead:
        return jsonify({'error': 'Ya has comprado este lead'}), 400
    
    # CORREGIDO: Crear el lead usando lender_id
    lead = Lead(
        lender_id=user_id,
        loan_request_id=loan_request_id,
        status='purchased'
    )
    
    # Reducir leads disponibles
    lender_profile.leads_remaining -= 1
    
    db.session.add(lead)
    db.session.commit()
    
    return jsonify({
        'message': 'Lead comprado exitosamente',
        'lead': lead_schema.dump(lead)
    }), 201

@lenders_bp.route('/packages/purchase', methods=['POST'])
@jwt_required()
def purchase_package():
    """Endpoint para comprar un paquete de leads"""
    # Verificar que el usuario sea un prestamista
    if not is_lender():
        return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
    
    user_id = get_jwt_identity()
    data = request.get_json()
    package_id = data.get('package_id')
    
    if not package_id:
        return jsonify({'error': 'ID de paquete requerido'}), 400
    
    # Buscar perfil del prestamista
    lender_profile = LenderProfile.query.filter_by(user_id=user_id).first()
    if not lender_profile:
        return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
    
    # Definir paquetes
    packages = {
        'basic': {'leads': 10, 'price': 100000},
        'premium': {'leads': 30, 'price': 250000},
        'gold': {'leads': 100, 'price': 600000}
    }
    
    if package_id not in packages:
        return jsonify({'error': 'Paquete no válido'}), 400
    
    package = packages[package_id]
    
    # Aquí iría la lógica de pago (integración con pasarela de pagos)
    # Por ahora, simulamos que el pago fue exitoso
    
    # Actualizar perfil del prestamista
    lender_profile.current_package = package_id
    lender_profile.leads_remaining += package['leads']
    lender_profile.leads_purchased += package['leads']
    
    db.session.commit()
    
    return jsonify({
        'message': f'Paquete {package_id} comprado exitosamente',
        'leads_added': package['leads'],
        'leads_remaining': lender_profile.leads_remaining
    }), 200

def assign_leads_to_lender(lender_profile):
    """Función para asignar leads automáticamente a un prestamista"""
    # Buscar solicitudes de préstamo activas sin leads asignados
    available_requests = LoanRequest.query.filter_by(status='active').all()
    
    leads_assigned = 0
    for loan_request in available_requests:
        # Verificar si ya existe un lead para este prestamista y esta solicitud
        existing_lead = Lead.query.filter_by(
            lender_id=lender_profile.user_id,  # CORREGIDO: usar lender_id
            loan_request_id=loan_request.id
        ).first()
        
        if not existing_lead and lender_profile.leads_remaining > 0:
            # CORREGIDO: Crear lead usando lender_id
            lead = Lead(lender_id=lender_profile.user_id, loan_request_id=loan_request.id)
            db.session.add(lead)
            lender_profile.leads_remaining -= 1
            leads_assigned += 1
            
            if leads_assigned >= 10:  # Límite por asignación
                break
    
    db.session.commit()
    return leads_assigned

@lenders_bp.route('/<int:lender_id>/leads', methods=['GET'])
@jwt_required()
def get_lender_leads(lender_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Asegurarse que el usuario que consulta es el dueño del perfil o un admin
    if not user.lender_profile or user.lender_profile.id != lender_id:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    leads = Lead.query.filter_by(lender_id=lender_id).order_by(Lead.created_at.desc()).all()
    
    if not leads:
        return jsonify(leads_schema.dump(leads)), 200 # Devuelve lista vacía

    return jsonify(leads_schema.dump(leads)), 200

@lenders_bp.route('/my-leads', methods=['GET'])
@jwt_required()
def get_my_leads():
    """Endpoint para obtener los leads del prestamista actual"""
    try:
        # Verificar que el usuario sea un prestamista
        if not is_lender():
            return jsonify({'error': 'No autorizado. Debe ser un prestamista.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestamista
        lender_profile = LenderProfile.query.filter_by(user_id=user_id).first()
        if not lender_profile:
            return jsonify({'error': 'Perfil de prestamista no encontrado'}), 404
        
        # Buscar leads del prestamista
        leads = Lead.query.filter_by(lender_id=lender_profile.id).order_by(Lead.created_at.desc()).all()
        
        # Procesar leads para incluir información de contacto
        leads_data = []
        for lead in leads:
            loan_request = LoanRequest.query.get(lead.loan_request_id)
            if not loan_request:
                continue
                
            lead_info = {
                'id': lead.id,
                'status': lead.status,
                'created_at': lead.created_at.isoformat() if lead.created_at else None,
                'loan_request': {
                    'id': loan_request.id,
                    'amount': loan_request.amount,
                    'purpose': loan_request.purpose,
                    'payment_frequency': loan_request.payment_frequency,
                    'term_months': loan_request.term_months
                }
            }
            
            # Verificar si es un lead generado por IA/scraper
            try:
                if loan_request.description:
                    contact_info = json.loads(loan_request.description)
                    if contact_info.get('real_data') or contact_info.get('ai_generated'):
                        # Es un lead de scraper o IA, usar la información del JSON
                        lead_info['contact'] = {
                            'full_name': contact_info.get('full_name'),
                            'phone_number': contact_info.get('phone_number'),
                            'email': contact_info.get('email'),
                            'city': contact_info.get('city'),
                            'country': contact_info.get('country'),
                            'business_type': contact_info.get('business_type'),
                            'source': contact_info.get('source'),
                            'real_data': contact_info.get('real_data', False),
                            'ai_generated': contact_info.get('ai_generated', False)
                        }
                    else:
                        # Lead normal, buscar información del usuario
                        borrower_profile = BorrowerProfile.query.get(loan_request.borrower_profile_id)
                        if borrower_profile:
                            borrower_user = User.query.get(borrower_profile.user_id)
                            if borrower_user:
                                lead_info['contact'] = {
                                    'full_name': f"{borrower_user.first_name} {borrower_user.last_name}",
                                    'phone_number': borrower_user.phone,
                                    'email': borrower_user.email,
                                    'city': borrower_user.city,
                                    'country': 'Paraguay',  # Asumido
                                    'real_data': False,
                                    'ai_generated': False
                                }
                else:
                    # Lead normal sin description, buscar información del usuario
                    borrower_profile = BorrowerProfile.query.get(loan_request.borrower_profile_id)
                    if borrower_profile:
                        borrower_user = User.query.get(borrower_profile.user_id)
                        if borrower_user:
                            lead_info['contact'] = {
                                'full_name': f"{borrower_user.first_name} {borrower_user.last_name}",
                                'phone_number': borrower_user.phone,
                                'email': borrower_user.email,
                                'city': borrower_user.city,
                                'country': 'Paraguay',  # Asumido
                                'real_data': False,
                                'ai_generated': False
                            }
            except json.JSONDecodeError:
                # Si hay error al parsear JSON, tratar como lead normal
                borrower_profile = BorrowerProfile.query.get(loan_request.borrower_profile_id)
                if borrower_profile:
                    borrower_user = User.query.get(borrower_profile.user_id)
                    if borrower_user:
                        lead_info['contact'] = {
                            'full_name': f"{borrower_user.first_name} {borrower_user.last_name}",
                            'phone_number': borrower_user.phone,
                            'email': borrower_user.email,
                            'city': borrower_user.city,
                            'country': 'Paraguay',  # Asumido
                            'real_data': False,
                            'ai_generated': False
                        }
            
            leads_data.append(lead_info)
        
        return jsonify({
            'leads': leads_data,
            'total': len(leads_data)
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN GET MY LEADS: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500 