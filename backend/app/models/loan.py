from app import db
from datetime import datetime

class LoanRequest(db.Model):
    __tablename__ = 'loan_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    borrower_profile_id = db.Column(db.Integer, db.ForeignKey('borrower_profiles.id'), nullable=False)
    
    # Detalles del préstamo
    amount = db.Column(db.Float, nullable=False)
    purpose = db.Column(db.String(200), nullable=False)
    payment_frequency = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly
    term_months = db.Column(db.Integer, nullable=False)
    
    # Estado
    status = db.Column(db.String(20), default='active')  # active, funded, cancelled
    is_public = db.Column(db.Boolean, default=True)
    
    # Información adicional
    description = db.Column(db.Text)
    collateral = db.Column(db.String(200))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # La relación ahora es un backref desde Lead ('lead_info') y desde Loan ('loan_offer')
    
    def to_dict(self):
        return {
            'id': self.id,
            'borrower_profile_id': self.borrower_profile_id,
            'amount': self.amount,
            'purpose': self.purpose,
            'payment_frequency': self.payment_frequency,
            'term_months': self.term_months,
            'status': self.status,
            'is_public': self.is_public,
            'description': self.description,
            'collateral': self.collateral,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'borrower_score': self.borrower_profile.score if self.borrower_profile else 0
        }

# NOTA: La clase Lead fue movida permanentemente a app/models/lead.py