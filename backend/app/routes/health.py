from flask import Blueprint, jsonify
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Endpoint de health check para Render"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'prestame-backend',
        'version': '1.0.0'
    }), 200

@health_bp.route('/api/health', methods=['GET'])
def api_health_check():
    """Endpoint de health check para la API"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'prestame-api',
        'version': '1.0.0'
    }), 200 