from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import User, BorrowerProfile, LoanRequest
from app.schemas import BorrowerProfileSchema, LoanRequestSchema
from app import db
from marshmallow import ValidationError
from app.models.user import User  # ✅ Usar User en lugar de Borrower
import logging

logger = logging.getLogger(__name__)

borrowers_bp = Blueprint('borrowers', __name__, url_prefix='/api/borrowers')
borrower_schema = BorrowerProfileSchema()
loan_request_schema = LoanRequestSchema()
loan_requests_schema = LoanRequestSchema(many=True)

def is_borrower():
    """Verifica si el usuario autenticado es un prestatario"""
    claims = get_jwt()
    return claims.get('user_type') == 'borrower'

@borrowers_bp.route('/loan-requests', methods=['POST'])
@jwt_required()
def create_loan_request():
    """Crear nueva solicitud de préstamo"""
    try:
        # Obtener datos del request
        data = request.get_json()
        
        # Obtener borrower_profile del usuario autenticado
        current_user_id = get_jwt_identity()
        
        # Buscar el perfil de borrower correspondiente al usuario
        borrower_profile = BorrowerProfile.query.filter_by(user_id=current_user_id).first()
        if not borrower_profile:
            return jsonify({'error': 'Perfil de prestatario no encontrado. Complete su perfil primero.'}), 404
        
        # ✅ CORRECTO: Asignar borrower_profile_id
        data['borrower_profile_id'] = borrower_profile.id
        
        # Validar los datos con el schema
        loan_request_schema = LoanRequestSchema()
        
        try:
            validated_data = loan_request_schema.load(data)
        except ValidationError as err:
            logger.error(f"ERROR EN CREATE LOAN REQUEST: {err.messages}")
            return jsonify({'error': 'Datos inválidos', 'details': err.messages}), 400
        
        # ✅ ARREGLO: No usar ** con load_instance=True
        loan_request = validated_data  # El schema ya retorna la instancia
        
        db.session.add(loan_request)
        db.session.commit()
        
        logger.info(f"Solicitud de préstamo creada exitosamente: ID {loan_request.id}")
        
        # Serializar y retornar
        return jsonify({
            'message': 'Solicitud de préstamo creada exitosamente',
            'loan_request': loan_request_schema.dump(loan_request)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al crear solicitud de préstamo: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@borrowers_bp.route('/loan-requests', methods=['GET'])
@jwt_required()
def get_loan_requests():
    """Endpoint para obtener las solicitudes de préstamo del prestatario"""
    try:
        # Verificar que el usuario sea un prestatario
        if not is_borrower():
            return jsonify({'error': 'No autorizado. Debe ser un prestatario.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestatario
        borrower_profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
        if not borrower_profile:
            return jsonify({'error': 'Perfil de prestatario no encontrado'}), 404
        
        # Buscar solicitudes de préstamo
        loan_requests = LoanRequest.query.filter_by(borrower_profile_id=borrower_profile.id).all()
        
        return jsonify({
            'loan_requests': loan_requests_schema.dump(loan_requests)
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN GET LOAN REQUESTS: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@borrowers_bp.route('/loan-requests/<int:loan_request_id>', methods=['GET'])
@jwt_required()
def get_loan_request(loan_request_id):
    """Endpoint para obtener una solicitud de préstamo específica"""
    try:
        # Verificar que el usuario sea un prestatario
        if not is_borrower():
            return jsonify({'error': 'No autorizado. Debe ser un prestatario.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestatario
        borrower_profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
        if not borrower_profile:
            return jsonify({'error': 'Perfil de prestatario no encontrado'}), 404
        
        # Buscar solicitud de préstamo
        loan_request = LoanRequest.query.filter_by(
            id=loan_request_id, 
            borrower_profile_id=borrower_profile.id
        ).first()
        
        if not loan_request:
            return jsonify({'error': 'Solicitud de préstamo no encontrada'}), 404
        
        return jsonify({
            'loan_request': loan_request_schema.dump(loan_request)
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN GET LOAN REQUEST: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@borrowers_bp.route('/loan-requests/<int:loan_request_id>', methods=['PUT'])
@jwt_required()
def update_loan_request(loan_request_id):
    """Endpoint para actualizar una solicitud de préstamo"""
    try:
        # Verificar que el usuario sea un prestatario
        if not is_borrower():
            return jsonify({'error': 'No autorizado. Debe ser un prestatario.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        data = request.get_json()
        
        # Buscar perfil del prestatario
        borrower_profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
        if not borrower_profile:
            return jsonify({'error': 'Perfil de prestatario no encontrado'}), 404
        
        # Buscar solicitud de préstamo
        loan_request = LoanRequest.query.filter_by(
            id=loan_request_id, 
            borrower_profile_id=borrower_profile.id
        ).first()
        
        if not loan_request:
            return jsonify({'error': 'Solicitud de préstamo no encontrada'}), 404
        
        # Solo permitir actualizar solicitudes pendientes
        if loan_request.status != 'pending':
            return jsonify({'error': 'Solo se pueden actualizar solicitudes pendientes'}), 400
        
        # Actualizar solicitud de préstamo
        for key, value in data.items():
            if key != 'id' and key != 'borrower_profile_id' and key != 'status' and hasattr(loan_request, key):
                setattr(loan_request, key, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Solicitud de préstamo actualizada exitosamente',
            'loan_request': loan_request_schema.dump(loan_request)
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN UPDATE LOAN REQUEST: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@borrowers_bp.route('/loan-requests/<int:loan_request_id>', methods=['DELETE'])
@jwt_required()
def delete_loan_request(loan_request_id):
    """Endpoint para eliminar una solicitud de préstamo"""
    try:
        # Verificar que el usuario sea un prestatario
        if not is_borrower():
            return jsonify({'error': 'No autorizado. Debe ser un prestatario.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestatario
        borrower_profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
        if not borrower_profile:
            return jsonify({'error': 'Perfil de prestatario no encontrado'}), 404
        
        # Buscar solicitud de préstamo
        loan_request = LoanRequest.query.filter_by(
            id=loan_request_id, 
            borrower_profile_id=borrower_profile.id
        ).first()
        
        if not loan_request:
            return jsonify({'error': 'Solicitud de préstamo no encontrada'}), 404
        
        # Solo permitir eliminar solicitudes pendientes
        if loan_request.status != 'pending':
            return jsonify({'error': 'Solo se pueden eliminar solicitudes pendientes'}), 400
        
        # Eliminar solicitud de préstamo
        db.session.delete(loan_request)
        db.session.commit()
        
        return jsonify({
            'message': 'Solicitud de préstamo eliminada exitosamente'
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN DELETE LOAN REQUEST: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@borrowers_bp.route('/loan-requests/<int:loan_request_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_loan_request(loan_request_id):
    """Endpoint para cancelar una solicitud de préstamo"""
    try:
        # Verificar que el usuario sea un prestatario
        if not is_borrower():
            return jsonify({'error': 'No autorizado. Debe ser un prestatario.'}), 403
        
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar perfil del prestatario
        borrower_profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
        if not borrower_profile:
            return jsonify({'error': 'Perfil de prestatario no encontrado'}), 404
        
        # Buscar solicitud de préstamo
        loan_request = LoanRequest.query.filter_by(
            id=loan_request_id, 
            borrower_profile_id=borrower_profile.id
        ).first()
        
        if not loan_request:
            return jsonify({'error': 'Solicitud de préstamo no encontrada'}), 404
        
        # Solo permitir cancelar solicitudes activas
        if loan_request.status not in ['active', 'pending']:
            return jsonify({'error': 'Solo se pueden cancelar solicitudes activas'}), 400
        
        # Cancelar solicitud de préstamo
        loan_request.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Solicitud de préstamo cancelada exitosamente',
            'loan_request': loan_request_schema.dump(loan_request)
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN CANCEL LOAN REQUEST: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500 