from flask import Blueprint, jsonify, request
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import User, LoanRequest, LenderProfile, BorrowerProfile
from app.schemas import UserSchema, LoanRequestSchema, LenderProfileSchema, BorrowerProfileSchema
from app import db
import random
from app.utils.stripe_utils import sync_stripe_products_and_prices
import logging

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)

# Decorador personalizado para verificar si el usuario es SuperAdmin
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get('user_type') != 'superadmin':
                return jsonify({'error': 'Acceso denegado. Se requiere rol de administrador.'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def is_superadmin():
    """Verifica si el usuario autenticado es un superadmin"""
    claims = get_jwt()
    return claims.get('user_type') == 'superadmin'

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_stats():
    """Endpoint para obtener estadísticas generales para el dashboard del admin."""
    try:
        total_users = db.session.query(User).count()
        total_loans = db.session.query(LoanRequest).count()
        approved_loans = db.session.query(LoanRequest).filter_by(status='approved').count()
        pending_loans = db.session.query(LoanRequest).filter_by(status='pending').count()
        unassigned_leads = db.session.query(Lead).filter(Lead.lender_id == None).count()
        
        return jsonify({
            'totalUsers': total_users,
            'totalLoans': total_loans,
            'approvedLoans': approved_loans,
            'pendingLoans': pending_loans,
            'unassignedLeads': unassigned_leads
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Obtener todos los usuarios (solo superadmin)"""
    try:
        if not is_superadmin():
            return jsonify({'error': 'No autorizado. Debe ser superadmin.'}), 403
        
        # CAMBIO: Usar joinedload para cargar los perfiles automáticamente
        users = db.session.query(User).options(
            db.joinedload(User.lender_profile),
            db.joinedload(User.borrower_profile)
        ).all()
        
        users_data = []
        
        for user in users:
            user_data = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
            
            # MEJORADO: Agregar información de perfiles con valores por defecto
            if user.user_type == 'lender':
                if user.lender_profile:
                    user_data['lender_profile'] = {
                        'id': user.lender_profile.id,
                        'lead_credits': user.lender_profile.lead_credits or 0,
                        'ai_search_credits': user.lender_profile.ai_search_credits or 0,
                        'subscription_status': user.lender_profile.subscription_status,
                        'current_package': user.lender_profile.current_package
                    }
                else:
                    # Crear perfil si no existe
                    user_data['lender_profile'] = {
                        'id': None,
                        'lead_credits': 0,
                        'ai_search_credits': 0,
                        'subscription_status': None,
                        'current_package': None
                    }
            elif user.user_type == 'borrower' and user.borrower_profile:
                user_data['borrower_profile'] = {
                    'id': user.borrower_profile.id,
                    'monthly_income': user.borrower_profile.monthly_income,
                    'employment_status': user.borrower_profile.employment_status,
                    'score': user.borrower_profile.score or 0
                }
            
            users_data.append(user_data)
        
        logger.info(f"Devolviendo {len(users_data)} usuarios con perfiles")
        return jsonify({
            'users': users_data,
            'total': len(users_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo usuarios: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PATCH'])
@admin_required()
def toggle_user_status(user_id):
    """Endpoint para activar/desactivar un usuario."""
    try:
        # Obtener el ID del administrador actual
        current_admin_id = int(get_jwt_identity())
        
        # Evitar que el admin se desactive a sí mismo
        if user_id == current_admin_id:
            return jsonify({'error': 'No puedes desactivar tu propia cuenta'}), 400
        
        user = User.query.get_or_404(user_id)
        
        # Evitar desactivar a otros superadmins
        if user.user_type == 'superadmin':
            return jsonify({'error': 'No se pueden desactivar otros administradores'}), 400
        
        # Cambiar el estado
        user.is_active = not user.is_active
        db.session.commit()
        
        action = 'activado' if user.is_active else 'desactivado'
        return jsonify({
            'message': f'Usuario {action} exitosamente',
            'user': {
                'id': user.id,
                'is_active': user.is_active
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    """Endpoint para eliminar un usuario (soft delete o hard delete)."""
    try:
        # Obtener el ID del administrador actual
        current_admin_id = int(get_jwt_identity())
        
        # Evitar que el admin se elimine a sí mismo
        if user_id == current_admin_id:
            return jsonify({'error': 'No puedes eliminar tu propia cuenta'}), 400
        
        user = User.query.get_or_404(user_id)
        
        # Evitar eliminar a otros superadmins
        if user.user_type == 'superadmin':
            return jsonify({'error': 'No se pueden eliminar otros administradores'}), 400
        
        # Eliminar el usuario (hard delete)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Usuario eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/leads/assign', methods=['POST'])
@admin_required()
def assign_leads():
    """
    Asigna todos los leads pendientes de forma aleatoria entre los prestamistas activos.
    """
    try:
        # 1. Obtener todos los leads sin asignar
        unassigned_leads = Lead.query.filter_by(lender_id=None).all()

        if not unassigned_leads:
            return jsonify({'message': 'No hay leads pendientes para asignar.'}), 200

        # 2. Obtener todos los prestamistas (usuarios) que están activos
        active_lenders = User.query.filter_by(user_type='lender', is_active=True).all()
        
        if not active_lenders:
            return jsonify({'error': 'No hay prestamistas activos disponibles para asignar leads.'}), 400

        # 3. Asignar cada lead a un prestamista aleatorio
        assignments = 0
        for lead in unassigned_leads:
            random_lender = random.choice(active_lenders)
            lead.lender_id = random_lender.id
            assignments += 1

        db.session.commit()

        return jsonify({
            'message': f'{assignments} leads han sido asignados exitosamente de forma aleatoria.'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stripe/sync-products', methods=['POST'])
@admin_required()
def sync_stripe():
    """
    Sincroniza los productos y precios definidos en el código con Stripe.
    Crea los productos y precios si no existen.
    Es una operación segura de ejecutar múltiples veces.
    """
    try:
        results = sync_stripe_products_and_prices()
        return jsonify({
            "message": "Sincronización con Stripe completada exitosamente.",
            "details": results
        }), 200
    except Exception as e:
        # Log del error real en el servidor para debugging
        current_app.logger.error(f"Error sincronizando con Stripe: {e}")
        return jsonify({"error": "Ocurrió un error al sincronizar con Stripe. Revisa las claves de API."}), 500

@admin_bp.route('/users/<int:user_id>/credits', methods=['POST'])
@jwt_required()
def assign_credits(user_id):
    """Asignar créditos de leads a un prestamista (solo superadmin)"""
    try:
        if not is_superadmin():
            return jsonify({'error': 'No autorizado. Debe ser superadmin.'}), 403
        
        data = request.get_json()
        credits_to_add = data.get('credits', 0)
        credit_type = data.get('credit_type', 'lead_credits')  # CAMBIO: por defecto lead_credits
        
        if not isinstance(credits_to_add, int) or credits_to_add <= 0:
            return jsonify({'error': 'Los créditos deben ser un número entero positivo'}), 400
        
        if credit_type not in ['ai_search_credits', 'lead_credits']:
            return jsonify({'error': 'Tipo de crédito no válido'}), 400
        
        # Buscar usuario
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        if user.user_type != 'lender':
            return jsonify({'error': 'Solo se pueden asignar créditos a prestamistas'}), 400
        
        # Buscar o crear perfil de prestamista
        lender_profile = LenderProfile.query.filter_by(user_id=user.id).first()
        if not lender_profile:
            # CREAR perfil de prestamista si no existe
            lender_profile = LenderProfile(
                user_id=user.id,
                lead_credits=0,
                ai_search_credits=0
            )
            db.session.add(lender_profile)
            db.session.flush()  # Para obtener el ID
        
        # Agregar créditos según el tipo
        if credit_type == 'ai_search_credits':
            old_credits = lender_profile.ai_search_credits
            lender_profile.ai_search_credits += credits_to_add
            new_credits = lender_profile.ai_search_credits
        else:  # lead_credits - ESTE ES EL IMPORTANTE PARA COMPRAR LEADS
            old_credits = lender_profile.lead_credits
            lender_profile.lead_credits += credits_to_add
            new_credits = lender_profile.lead_credits
        
        db.session.commit()
        
        credit_name = "créditos de búsqueda IA" if credit_type == 'ai_search_credits' else "créditos para comprar leads"
        logger.info(f"SuperAdmin asignó {credits_to_add} {credit_name} a usuario {user.email}")
        
        return jsonify({
            'message': f'Se asignaron {credits_to_add} {credit_name} exitosamente',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': f'{user.first_name} {user.last_name}'
            },
            'credits': {
                'type': credit_type,
                'previous': old_credits,
                'added': credits_to_add,
                'total': new_credits
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error asignando créditos: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """Obtener estadísticas generales del sistema (solo superadmin)"""
    try:
        if not is_superadmin():
            return jsonify({'error': 'No autorizado. Debe ser superadmin.'}), 403
        
        logger.info("Iniciando cálculo de estadísticas...")
        
        # 1. Estadísticas básicas de usuarios (más seguro)
        try:
            total_users = db.session.query(User).count()
            lenders_count = db.session.query(User).filter(User.user_type == 'lender').count()
            borrowers_count = db.session.query(User).filter(User.user_type == 'borrower').count()
            active_users = db.session.query(User).filter(User.is_active == True).count()
            logger.info(f"Usuarios: total={total_users}, lenders={lenders_count}, borrowers={borrowers_count}")
        except Exception as user_error:
            logger.error(f"Error calculando usuarios: {str(user_error)}")
            total_users = lenders_count = borrowers_count = active_users = 0
        
        # 2. Estadísticas de créditos (simplificado)
        try:
            # Obtener todos los perfiles de prestamistas
            lender_profiles = db.session.query(LenderProfile).all()
            total_lead_credits = sum(profile.lead_credits for profile in lender_profiles)
            total_ai_credits = sum(profile.ai_search_credits for profile in lender_profiles)
            lenders_with_credits = len([p for p in lender_profiles if p.lead_credits > 0])
            lenders_with_ai_credits = len([p for p in lender_profiles if p.ai_search_credits > 0])
            logger.info(f"Créditos: lead={total_lead_credits}, ai={total_ai_credits}")
        except Exception as credit_error:
            logger.error(f"Error calculando créditos: {str(credit_error)}")
            total_lead_credits = total_ai_credits = lenders_with_credits = lenders_with_ai_credits = 0
        
        # 3. Estadísticas de préstamos (simplificado)
        try:
            total_loan_requests = db.session.query(LoanRequest).count()
            active_loans = db.session.query(LoanRequest).filter(LoanRequest.status == 'active').count()
            pending_loans = db.session.query(LoanRequest).filter(LoanRequest.status == 'pending').count()
            logger.info(f"Préstamos: total={total_loan_requests}, active={active_loans}")
        except Exception as loan_error:
            logger.error(f"Error calculando préstamos: {str(loan_error)}")
            total_loan_requests = active_loans = pending_loans = 0
        
        # 4. Estadísticas financieras (opcional)
        try:
            amounts = db.session.query(LoanRequest.amount).filter(LoanRequest.amount != None).all()
            total_amount_requested = sum(amount[0] for amount in amounts) if amounts else 0
            avg_loan_amount = total_amount_requested / len(amounts) if amounts else 0
        except Exception as financial_error:
            logger.warning(f"Error calculando estadísticas financieras: {str(financial_error)}")
            total_amount_requested = avg_loan_amount = 0
        
        # 5. Estadísticas de leads (opcional - puede fallar sin problema)
        try:
            from app.models.lead import Lead
            total_leads = db.session.query(Lead).count()
            new_leads = db.session.query(Lead).filter(Lead.status == 'new').count()
        except:
            total_leads = new_leads = 0
        
        # Construir respuesta
        response_data = {
            'users': {
                'total': total_users,
                'lenders': lenders_count,
                'borrowers': borrowers_count,
                'active': active_users
            },
            'credits': {
                'total_lead_credits': total_lead_credits,
                'total_ai_credits': total_ai_credits,
                'lenders_with_credits': lenders_with_credits,
                'lenders_with_ai_credits': lenders_with_ai_credits
            },
            'loans': {
                'total_requests': total_loan_requests,
                'active': active_loans,
                'pending': pending_loans
            },
            'leads': {
                'total': total_leads,
                'new': new_leads
            },
            'financial': {
                'total_amount_requested': total_amount_requested,
                'avg_loan_amount': avg_loan_amount
            }
        }
        
        logger.info(f"Estadísticas calculadas exitosamente: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error general obteniendo estadísticas: {str(e)}")
        import traceback
        logger.error(f"Traceback completo: {traceback.format_exc()}")
        
        # Devolver estadísticas vacías pero funcionales
        return jsonify({
            'users': {'total': 0, 'lenders': 0, 'borrowers': 0, 'active': 0},
            'credits': {'total_lead_credits': 0, 'total_ai_credits': 0, 'lenders_with_credits': 0, 'lenders_with_ai_credits': 0},
            'loans': {'total_requests': 0, 'active': 0, 'pending': 0},
            'leads': {'total': 0, 'new': 0},
            'financial': {'total_amount_requested': 0, 'avg_loan_amount': 0}
        }), 200 