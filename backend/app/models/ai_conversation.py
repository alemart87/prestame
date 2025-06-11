from app import db
from datetime import datetime

class AIConversation(db.Model):
    __tablename__ = 'ai_conversations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    thread_id = db.Column(db.String(255), nullable=False, unique=True)
    
    # Campos para el scoring
    linguistic_score = db.Column(db.Integer, nullable=True)
    linguistic_analysis = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación
    user = db.relationship('User', backref=db.backref('ai_conversation', uselist=False, cascade='all, delete-orphan'))

    def __init__(self, user_id, thread_id):
        self.user_id = user_id
        self.thread_id = thread_id

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'thread_id': self.thread_id,
            'linguistic_score': self.linguistic_score,
            'linguistic_analysis': self.linguistic_analysis,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 