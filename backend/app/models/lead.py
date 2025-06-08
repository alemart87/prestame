from app import db
from datetime import datetime

class Lead(db.Model):
    __tablename__ = 'leads'
    
    id = db.Column(db.Integer, primary_key=True)
    loan_request_id = db.Column(db.Integer, db.ForeignKey('loan_requests.id'), nullable=False)
    
    # CORRECCIÓN: Apuntar a lender_profiles.id, no a users.id
    lender_id = db.Column(db.Integer, db.ForeignKey('lender_profiles.id'), nullable=True)
    
    # Campos que el código existente espera
    status = db.Column(db.String(20), default='new')  # new, viewed, contacted, closed
    price = db.Column(db.Float, default=0.0)  # Precio pagado por este lead
    
    # Información de contacto
    contact_made = db.Column(db.Boolean, default=False)
    contact_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación para acceder a la solicitud de préstamo asociada
    loan_request = db.relationship('LoanRequest', backref='lead_info', uselist=False)

    @property
    def viewed(self):
        """Indica si el lead fue visto (status != 'new')"""
        return self.status != 'new'

    def mark_as_viewed(self):
        """Marca el lead como visto"""
        if self.status == 'new':
            self.status = 'viewed'
            self.updated_at = datetime.utcnow()
    
    def mark_as_contacted(self):
        """Marca el lead como contactado"""
        self.contact_made = True
        self.contact_date = datetime.utcnow()
        self.status = 'contacted'
        self.updated_at = datetime.utcnow()
    
    @property
    def purchased(self):
        """Indica si el lead fue comprado (tiene precio > 0 o status != 'new')"""
        return self.price > 0 or self.status in ['viewed', 'contacted', 'closed']

    def to_dict(self):
        return {
            'id': self.id,
            'lender_id': self.lender_id,
            'loan_request_id': self.loan_request_id,
            'status': self.status,
            'price': self.price,
            'contact_made': self.contact_made,
            'contact_date': self.contact_date.isoformat() if self.contact_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'purchased': self.purchased,
            'loan_request': self.loan_request.to_dict() if self.loan_request else None
        } 