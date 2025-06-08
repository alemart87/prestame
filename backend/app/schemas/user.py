from marshmallow import fields, validates, ValidationError, validate, validates_schema
from app import ma
from app.models import User

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = False
        exclude = ('password_hash',)
        
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    password = fields.Str(
        load_only=True, 
        required=True, 
        validate=validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres")
    )
    confirmPassword = fields.Str(load_only=True, required=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=2, error="El nombre es muy corto"))
    last_name = fields.Str(required=True, validate=validate.Length(min=2, error="El apellido es muy corto"))
    phone = fields.Str()
    address = fields.Str()
    city = fields.Str()
    department = fields.Str()
    user_type = fields.Str(required=True)
    score = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    @validates('user_type')
    def validate_user_type(self, value):
        if value not in ['borrower', 'lender']:
            raise ValidationError('El tipo de usuario debe ser "borrower" o "lender"')
    
    @validates_schema
    def validate_passwords(self, data, **kwargs):
        """Valida que las contraseñas coincidan."""
        if data.get('password') != data.get('confirmPassword'):
            raise ValidationError('Las contraseñas no coinciden', 'confirmPassword')
        
        return data 

class UserUpdateSchema(ma.SQLAlchemyAutoSchema):
    """Schema para validar la actualización del perfil de usuario."""
    class Meta:
        model = User
        load_instance = True
        exclude = ('password_hash', 'user_type', 'email', 'id')

    # No se definen campos aquí para permitir actualizaciones parciales (PATCH) 