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
    key_indicators = db.Column(db.Text, nullable=True)
    
    # Nuevo campo para Score Final
    final_score = db.Column(db.Float, nullable=True)
    final_score_updated_at = db.Column(db.DateTime, nullable=True)
    
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

    def calculate_final_score(self):
        """
        Calcula el Score Final combinando:
        - Score Katupyry (70%): Datos financieros objetivos
        - Score Lingüístico (30%): Análisis de comportamiento IA
        """
        from app.models.borrower import BorrowerProfile
        
        # Obtener el perfil del prestatario
        borrower_profile = BorrowerProfile.query.filter_by(user_id=self.user_id).first()
        
        # Inicializar scores
        katupyry_score = 0.0
        linguistic_weight = 0.0
        
        # 1. Score Katupyry (70% del peso)
        if borrower_profile:
            katupyry_score = borrower_profile.calculate_score()
        
        # 2. Score Lingüístico (30% del peso)
        if self.linguistic_score is not None:
            # Convertir el score lingüístico (0-100) a peso
            linguistic_weight = (self.linguistic_score / 100.0) * 30
        
        # 3. Bonificaciones por indicadores clave
        bonus = self._calculate_indicators_bonus()
        
        # Cálculo final
        final_score = (katupyry_score * 0.7) + linguistic_weight + bonus
        
        # Asegurar que esté entre 0-100
        self.final_score = max(0.0, min(100.0, final_score))
        self.final_score_updated_at = datetime.utcnow()
        
        return self.final_score

    def _calculate_indicators_bonus(self):
        """Calcula bonificaciones basadas en indicadores clave"""
        indicators = self.get_key_indicators()
        bonus = 0.0
        
        for indicator in indicators:
            if isinstance(indicator, dict):
                # Bonificaciones por indicadores positivos
                if indicator.get('type') == 'positive':
                    bonus += 2.0
                elif indicator.get('type') == 'negative':
                    bonus -= 1.0
                    
                # Bonificaciones específicas
                if 'responsable' in indicator.get('text', '').lower():
                    bonus += 1.5
                if 'puntual' in indicator.get('text', '').lower():
                    bonus += 1.5
                if 'estable' in indicator.get('text', '').lower():
                    bonus += 1.0
        
        return min(bonus, 10.0)  # Máximo 10 puntos de bonus

    def get_score_breakdown(self):
        """Devuelve el desglose detallado del score"""
        from app.models.borrower import BorrowerProfile
        
        borrower_profile = BorrowerProfile.query.filter_by(user_id=self.user_id).first()
        
        return {
            'final_score': self.final_score,
            'katupyry_score': borrower_profile.score if borrower_profile else 0,
            'linguistic_score': self.linguistic_score,
            'indicators_bonus': self._calculate_indicators_bonus(),
            'last_updated': self.final_score_updated_at.isoformat() if self.final_score_updated_at else None
        }

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'thread_id': self.thread_id,
            'linguistic_score': self.linguistic_score,
            'linguistic_analysis': self.linguistic_analysis,
            'key_indicators': self.get_key_indicators(),
            'final_score': self.final_score,
            'final_score_updated_at': self.final_score_updated_at.isoformat() if self.final_score_updated_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 