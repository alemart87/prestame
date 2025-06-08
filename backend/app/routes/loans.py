from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import LoanRequest, BorrowerProfile, User
from app.schemas import LoanRequestSchema
from app import db

loans_bp = Blueprint('loans', __name__)
loan_request_schema = LoanRequestSchema()
loan_requests_schema = LoanRequestSchema(many=True)

@loans_bp.route('/public', methods=['GET'])
def get_public_loans():
    """Endpoint público para obtener préstamos disponibles (landing page)"""
    # Obtener parámetros de consulta
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Limitar a 20 por página como máximo
    per_page = min(per_page, 20)
    
    # Buscar solicitudes de préstamo pendientes
    query = LoanRequest.query.filter_by(status='pending')
    
    # Ordenar por fecha de creación (más recientes primero)
    query = query.order_by(LoanRequest.created_at.desc())
    
    # Paginación
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    loan_requests = pagination.items
    
    # Preparar respuesta
    response = {
        'loan_requests': loan_requests_schema.dump(loan_requests),
        'pagination': {
            'total_items': pagination.total,
            'total_pages': pagination.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }
    
    return jsonify(response), 200

@loans_bp.route('/stats', methods=['GET'])
def get_loan_stats():
    """Endpoint para obtener estadísticas de préstamos (landing page)"""
    # Contar total de préstamos
    total_loans = LoanRequest.query.count()
    
    # Contar préstamos por estado
    pending_loans = LoanRequest.query.filter_by(status='pending').count()
    approved_loans = LoanRequest.query.filter_by(status='approved').count()
    funded_loans = LoanRequest.query.filter_by(status='funded').count()
    
    # Calcular monto total de préstamos solicitados
    result = db.session.query(db.func.sum(LoanRequest.amount)).first()
    total_amount = result[0] if result[0] else 0
    
    # Calcular monto promedio de préstamos
    result = db.session.query(db.func.avg(LoanRequest.amount)).first()
    avg_amount = result[0] if result[0] else 0
    
    # Contar prestatarios únicos
    unique_borrowers = db.session.query(BorrowerProfile.id).distinct().count()
    
    return jsonify({
        'total_loans': total_loans,
        'pending_loans': pending_loans,
        'approved_loans': approved_loans,
        'funded_loans': funded_loans,
        'total_amount': total_amount,
        'avg_amount': avg_amount,
        'unique_borrowers': unique_borrowers
    }), 200

@loans_bp.route('/search', methods=['GET'])
def search_loans():
    """Endpoint para buscar préstamos por criterios"""
    # Obtener parámetros de consulta
    min_amount = request.args.get('min_amount', 0, type=float)
    max_amount = request.args.get('max_amount', 0, type=float)
    payment_frequency = request.args.get('payment_frequency')
    purpose = request.args.get('purpose')
    status = request.args.get('status', 'pending')
    
    # Construir consulta base
    query = LoanRequest.query
    
    # Aplicar filtros
    if status:
        query = query.filter_by(status=status)
    
    if min_amount > 0:
        query = query.filter(LoanRequest.amount >= min_amount)
    
    if max_amount > 0:
        query = query.filter(LoanRequest.amount <= max_amount)
    
    if payment_frequency:
        query = query.filter_by(payment_frequency=payment_frequency)
    
    if purpose:
        query = query.filter(LoanRequest.purpose.like(f'%{purpose}%'))
    
    # Ordenar por fecha de creación (más recientes primero)
    query = query.order_by(LoanRequest.created_at.desc())
    
    # Ejecutar consulta
    loan_requests = query.all()
    
    return jsonify({
        'loan_requests': loan_requests_schema.dump(loan_requests)
    }), 200 