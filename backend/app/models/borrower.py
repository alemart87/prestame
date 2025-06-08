from app import db
from datetime import datetime

class BorrowerProfile(db.Model):
    __tablename__ = 'borrower_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Información financiera
    monthly_income = db.Column(db.Float)
    monthly_expenses = db.Column(db.Float)
    debt_to_income_ratio = db.Column(db.Float)
    dependents = db.Column(db.Integer, default=0)
    
    # Información laboral
    employment_status = db.Column(db.String(50))  # Empleado, Independiente, etc.
    job_title = db.Column(db.String(100))
    employer = db.Column(db.String(100))
    employment_duration = db.Column(db.Integer)  # meses
    
    # Información personal adicional
    hobbies = db.Column(db.String(200))
    
    # Score Katupyry
    score = db.Column(db.Float, default=0.0)
    score_updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Historial de préstamos
    total_loans = db.Column(db.Integer, default=0)
    successful_payments = db.Column(db.Integer, default=0)
    late_payments = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    loan_requests = db.relationship('LoanRequest', backref='borrower_profile', lazy=True)
    
    def calculate_score(self):
        """Calcula el Score Katupyry basado en múltiples factores"""
        score = 0.0
        
        # Factor 1: Ratio de deuda a ingresos (30%)
        if self.debt_to_income_ratio is not None:
            if self.debt_to_income_ratio <= 0.3:
                score += 30
            elif self.debt_to_income_ratio <= 0.5:
                score += 20
            elif self.debt_to_income_ratio <= 0.7:
                score += 10
        
        # Factor 2: Estabilidad laboral (25%)
        if self.employment_status == 'Empleado':
            score += 25
        elif self.employment_status == 'Independiente':
            score += 15
        
        # Factor 3: Historial de pagos (25%)
        if self.total_loans > 0:
            payment_ratio = self.successful_payments / self.total_loans
            score += payment_ratio * 25
        else:
            score += 10  # Bonus por ser nuevo usuario
        
        # Factor 4: Información completa del perfil (20%)
        completeness = 0
        fields = [self.monthly_income, self.monthly_expenses, self.employment_status, 
                 self.job_title, self.employer]
        completeness = sum(1 for field in fields if field is not None) / len(fields)
        score += completeness * 20
        
        self.score = min(score, 100.0)  # Máximo 100
        self.score_updated_at = datetime.utcnow()
        return self.score
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'monthly_income': self.monthly_income,
            'monthly_expenses': self.monthly_expenses,
            'debt_to_income_ratio': self.debt_to_income_ratio,
            'dependents': self.dependents,
            'employment_status': self.employment_status,
            'job_title': self.job_title,
            'employer': self.employer,
            'employment_duration': self.employment_duration,
            'hobbies': self.hobbies,
            'score': self.score,
            'score_updated_at': self.score_updated_at.isoformat() if self.score_updated_at else None,
            'total_loans': self.total_loans,
            'successful_payments': self.successful_payments,
            'late_payments': self.late_payments,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }