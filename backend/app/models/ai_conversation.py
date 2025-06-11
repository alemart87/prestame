from app import db
from datetime import datetime
import json

class AIConversation(db.Model):
    __tablename__ = 'ai_conversations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    thread_id = db.Column(db.String(255), nullable=False, unique=True)
    
    # Campos para el scoring
    linguistic_score = db.Column(db.Integer, nullable=True)
    linguistic_analysis = db.Column(db.Text, nullable=True)
    key_indicators = db.Column(db.Text, nullable=True)  # Nuevo campo para indicadores clave
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación
    user = db.relationship('User', backref=db.backref('ai_conversation', uselist=False, cascade='all, delete-orphan'))

    def __init__(self, user_id, thread_id):
        self.user_id = user_id
        self.thread_id = thread_id

    def set_key_indicators(self, indicators_list):
        """Convierte la lista de indicadores a JSON para guardar en BD"""
        if indicators_list and isinstance(indicators_list, list):
            self.key_indicators = json.dumps(indicators_list, ensure_ascii=False)
        else:
            self.key_indicators = json.dumps([], ensure_ascii=False)

    def get_key_indicators(self):
        """Obtiene la lista de indicadores desde JSON"""
        if self.key_indicators:
            try:
                return json.loads(self.key_indicators)
            except json.JSONDecodeError:
                return []
        return []

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'thread_id': self.thread_id,
            'linguistic_score': self.linguistic_score,
            'linguistic_analysis': self.linguistic_analysis,
            'key_indicators': self.get_key_indicators(),  # Devolver como lista
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 