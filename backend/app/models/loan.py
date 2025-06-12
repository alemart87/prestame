from app import db
from datetime import datetime
from app.models.user import User

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
    
    # Relationships
    loan = db.relationship('Loan', backref='loan_request_ref', uselist=False, cascade='all, delete-orphan')
    purchasing_lenders = db.relationship('LenderLead', backref='loan_request', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_contact=False):
        data = {
            'id': self.id,
            'borrower_id': self.borrower_id,
            'amount': self.amount,
            'term_months': self.term_months,
            'purpose': self.purpose,
            'status': self.status,
            'payment_frequency': self.payment_frequency,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'borrower_profile': self.borrower_profile.to_dict() if self.borrower_profile else None
        }
        if include_contact and self.borrower_profile and self.borrower_profile.user:
            data['contact'] = {
                'email': self.borrower_profile.user.email,
                'phone': self.borrower_profile.user.phone,
                'full_name': f"{self.borrower_profile.user.first_name} {self.borrower_profile.user.last_name}"
            }
        return data

# NOTA: La clase Lead fue movida permanentemente a app/models/lead.py

class Loan(db.Model):
    __tablename__ = 'loans'
    
    id = db.Column(db.Integer, primary_key=True)
    loan_request_id = db.Column(db.Integer, db.ForeignKey('loan_requests.id'), nullable=False, unique=True)
    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    borrower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, nullable=False)
    term_months = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='active', nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = db.relationship('Payment', backref='loan', lazy='dynamic', cascade='all, delete-orphan')
    
class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    payment_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), default='pending', nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)