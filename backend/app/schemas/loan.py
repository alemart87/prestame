from marshmallow import fields
from app import ma
from app.models import LoanRequest

class LoanRequestSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LoanRequest
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    borrower_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    term_months = fields.Int(required=True)
    purpose = fields.Str(required=True)
    status = fields.Str(dump_only=True)
    payment_frequency = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class LeadSchema(ma.Schema):
    """Schema para representar un lead (solicitud de préstamo vista por prestamistas)"""
    id = fields.Int()
    amount = fields.Float()
    term_months = fields.Int()
    purpose = fields.Str()
    status = fields.Str()
    payment_frequency = fields.Str()
    is_purchased = fields.Bool()
    contact = fields.Dict()
    borrower_profile = fields.Dict()
    created_at = fields.DateTime() 