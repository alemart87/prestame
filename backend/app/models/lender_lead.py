from app import db
from datetime import datetime

class LenderLead(db.Model):
    __tablename__ = 'lender_leads'
    
    id = db.Column(db.Integer, primary_key=True)
    lender_id = db.Column(db.Integer, db.ForeignKey('lender_profiles.id'), nullable=False)
    loan_request_id = db.Column(db.Integer, db.ForeignKey('loan_requests.id'), nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('lender_id', 'loan_request_id', name='_lender_lead_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'lender_id': self.lender_id,
            'loan_request_id': self.loan_request_id,
            'purchase_date': self.purchase_date.isoformat()
        } 