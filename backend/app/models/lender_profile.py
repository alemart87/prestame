from app import db
from datetime import datetime

class LenderProfile(db.Model):
    __tablename__ = 'lender_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Campos para créditos y suscripciones
    lead_credits = db.Column(db.Integer, default=0, nullable=False)
    ai_search_credits = db.Column(db.Integer, default=0, nullable=False)
    stripe_subscription_id = db.Column(db.String(255), nullable=True)
    subscription_status = db.Column(db.String(50), nullable=True)
    current_package = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación con el usuario principal
    user = db.relationship('User', backref=db.backref('lender_profile', uselist=False))
    
    # Relación con los leads comprados
    purchased_leads = db.relationship('LenderLead', backref='lender', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'lead_credits': self.lead_credits,
            'ai_search_credits': self.ai_search_credits,
            'subscription_status': self.subscription_status,
            'current_package': self.current_package,
        } 