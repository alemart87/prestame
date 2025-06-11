from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from app.models.user import User
from app.models.borrower import BorrowerProfile
from app.models.lender import LenderProfile
from app.models.loan import LoanRequest
from app.models.lead import Lead
from app.models.ai_conversation import AIConversation

__all__ = ['db', 'User', 'BorrowerProfile', 'LenderProfile', 'LoanRequest', 'Lead', 'AIConversation'] 