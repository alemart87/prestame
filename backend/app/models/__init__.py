from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .borrower import BorrowerProfile
from .loan import LoanRequest, Loan, Payment
from .ai_conversation import AIConversation
from .lender import LenderProfile
from .lender_lead import LenderLead

__all__ = ['db', 'User', 'BorrowerProfile', 'LenderProfile', 'LoanRequest', 'Loan', 'Payment', 'AIConversation'] 