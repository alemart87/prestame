from marshmallow import fields
from app import ma
from app.models import LoanRequest, Lead

class LoanRequestSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LoanRequest
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    borrower_profile_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    purpose = fields.Str()
    payment_frequency = fields.Str(required=True)
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class LeadSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Lead
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    lender_id = fields.Int(required=True)
    loan_request_id = fields.Int(required=True)
    status = fields.Str(dump_only=True)
    price = fields.Float(dump_only=True)
    contact_made = fields.Bool(dump_only=True)
    contact_date = fields.DateTime(dump_only=True)
    notes = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Campos para incluir detalles adicionales en la respuesta
    loan_request = fields.Nested(LoanRequestSchema, dump_only=True) 