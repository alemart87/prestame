from app import ma
from app.models.lead import Lead
from .loan_schema import LoanRequestSchema

class LeadSchema(ma.SQLAlchemyAutoSchema):
    loan_request = ma.Nested(LoanRequestSchema)
    
    class Meta:
        model = Lead
        load_instance = True
        include_fk = True

