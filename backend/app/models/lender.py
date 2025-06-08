from app import db
from datetime import datetime

class LenderProfile(db.Model):
    __tablename__ = 'lender_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Preferencias de préstamo
    min_amount = db.Column(db.Float)
    max_amount = db.Column(db.Float)
    interest_rate = db.Column(db.Float)
    payment_frequency_preference = db.Column(db.String(20))  # daily, weekly, monthly
    risk_tolerance = db.Column(db.String(20))  # low, medium, high
    
    # Información de paquetes
    current_package = db.Column(db.String(20), default='basic')  # basic, premium, gold
    leads_purchased = db.Column(db.Integer, default=0)
    leads_remaining = db.Column(db.Integer, default=0)
    package_expires_at = db.Column(db.DateTime)
    
    # Estadísticas
    total_loans_funded = db.Column(db.Integer, default=0)
    total_amount_lent = db.Column(db.Float, default=0.0)
    successful_loans = db.Column(db.Integer, default=0)
    
    # Nuevos campos para Stripe y Leads
    lead_credits = db.Column(db.Integer, default=0, nullable=False)
    stripe_subscription_id = db.Column(db.String(255), nullable=True, unique=True)
    subscription_status = db.Column(db.String(50), default='inactive', nullable=False) # ej: inactive, active, canceled
    ai_search_credits = db.Column(db.Integer, default=3, nullable=False) # Nuevos créditos de búsqueda
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    leads = db.relationship('Lead', backref='lender', lazy=True)
    
    def __repr__(self):
        return f'<LenderProfile {self.user_id}>'
    
    def get_package_info(self):
        """Retorna información del paquete actual"""
        packages = {
            'basic': {
                'name': 'Básico',
                'leads_per_month': 10,
                'price': 50000,  # Gs
                'features': ['10 leads por mes', 'Soporte básico']
            },
            'premium': {
                'name': 'Premium',
                'leads_per_month': 25,
                'price': 100000,  # Gs
                'features': ['25 leads por mes', 'Filtros avanzados', 'Soporte prioritario']
            },
            'gold': {
                'name': 'Gold',
                'leads_per_month': 50,
                'price': 180000,  # Gs
                'features': ['50 leads por mes', 'Filtros avanzados', 'Soporte 24/7', 'Análisis de riesgo']
            }
        }
        return packages.get(self.current_package, packages['basic'])
    
    def can_access_lead(self):
        """Verifica si el prestamista puede acceder a un nuevo lead"""
        return self.leads_remaining > 0
    
    def consume_lead(self):
        """Consume un lead del paquete actual"""
        if self.leads_remaining > 0:
            self.leads_remaining -= 1
            return True
        return False
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'min_amount': self.min_amount,
            'max_amount': self.max_amount,
            'interest_rate': self.interest_rate,
            'payment_frequency_preference': self.payment_frequency_preference,
            'risk_tolerance': self.risk_tolerance,
            'current_package': self.current_package,
            'package_info': self.get_package_info(),
            'leads_purchased': self.leads_purchased,
            'leads_remaining': self.leads_remaining,
            'package_expires_at': self.package_expires_at.isoformat() if self.package_expires_at else None,
            'total_loans_funded': self.total_loans_funded,
            'total_amount_lent': self.total_amount_lent,
            'successful_loans': self.successful_loans,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }