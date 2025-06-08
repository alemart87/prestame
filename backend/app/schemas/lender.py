from marshmallow import fields
from app import ma
from app.models import LenderProfile

class LenderProfileSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LenderProfile
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    min_amount = fields.Float()
    max_amount = fields.Float()
    interest_rate = fields.Float()
    payment_frequency_preference = fields.Str()
    risk_tolerance = fields.Str()
    leads_package = fields.Str()
    leads_available = fields.Int(dump_only=True)
    leads_viewed = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class LenderProfileUpdateSchema(ma.SQLAlchemyAutoSchema):
    """Schema para validar la actualización del perfil de prestamista."""
    class Meta:
        model = LenderProfile
        load_instance = True
        exclude = ('user_id', 'id')

    # No se definen campos aquí para permitir actualizaciones parciales (PATCH) 