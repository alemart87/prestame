from app import create_app
from app.models.lead import Lead
from app.models.loan import LoanRequest
from app.models.lender import LenderProfile
import json

app = create_app()
with app.app_context():
    # Verificar todos los leads
    leads = Lead.query.all()
    print(f"Total de leads en la base de datos: {len(leads)}")
    
    for lead in leads:
        print(f"\n--- Lead ID: {lead.id} ---")
        print(f"Lender ID: {lead.lender_id}")
        print(f"Status: {lead.status}")
        print(f"Created at: {lead.created_at}")
        
        # Obtener información del loan request
        loan_request = LoanRequest.query.get(lead.loan_request_id)
        if loan_request:
            print(f"Loan Request ID: {loan_request.id}")
            print(f"Purpose: {loan_request.purpose}")
            print(f"Description: {loan_request.description}")
            
            # Si tiene description, intentar parsear como JSON
            if loan_request.description:
                try:
                    contact_info = json.loads(loan_request.description)
                    if contact_info.get('ai_generated'):
                        print("*** LEAD GENERADO POR IA ***")
                        print(f"Nombre: {contact_info.get('full_name')}")
                        print(f"Email: {contact_info.get('email')}")
                        print(f"Teléfono: {contact_info.get('phone_number')}")
                        print(f"Ciudad: {contact_info.get('city')}")
                        print(f"País: {contact_info.get('country')}")
                except json.JSONDecodeError:
                    print("Description no es JSON válido")
    
    # Verificar lender profiles
    print(f"\n--- LENDER PROFILES ---")
    lenders = LenderProfile.query.all()
    for lender in lenders:
        print(f"Lender ID: {lender.id}, User ID: {lender.user_id}")
        leads_count = Lead.query.filter_by(lender_id=lender.id).count()
        print(f"Leads asociados: {leads_count}") 