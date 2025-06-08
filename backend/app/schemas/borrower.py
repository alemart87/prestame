from marshmallow import fields
from app import ma
from app.models import BorrowerProfile

class BorrowerProfileSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = BorrowerProfile
        load_instance = True
        include_fk = True
        
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    monthly_income = fields.Float()
    monthly_expenses = fields.Float()
    dependents = fields.Int()
    hobbies = fields.Str()
    employment_status = fields.Str()
    job_title = fields.Str()
    employer = fields.Str()
    debt_to_income_ratio = fields.Float()
    score = fields.Method("get_score", dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    def get_score(self, obj):
        return obj.calculate_score()

class BorrowerProfileUpdateSchema(ma.SQLAlchemyAutoSchema):
    """Schema para validar la actualización del perfil de prestatario."""
    class Meta:
        model = BorrowerProfile
        load_instance = True
        exclude = ('user_id', 'id', 'score')

    # No se definen campos aquí para permitir actualizaciones parciales (PATCH) 