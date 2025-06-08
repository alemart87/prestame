from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    department = db.Column(db.String(100))
    user_type = db.Column(db.String(20), nullable=False)  # 'borrower' o 'lender'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Campo para el ID de cliente de Stripe
    stripe_customer_id = db.Column(db.String(255), nullable=True)
    
    # Relaciones
    borrower_profile = db.relationship('BorrowerProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    lender_profile = db.relationship('LenderProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def __init__(self, email, password, first_name, last_name, user_type, phone=None, address=None, city=None, department=None):
        self.email = email
        self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.address = address
        self.city = city
        self.department = department
        self.user_type = user_type
        
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'department': self.department,
            'user_type': self.user_type,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }