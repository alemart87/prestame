"""Add key_indicators column to ai_conversations table

Revision ID: add_key_indicators
Revises: [previous_revision_id]
Create Date: 2024-11-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_key_indicators'
down_revision = None  # Reemplaza con el ID de la revisión anterior
branch_labels = None
depends_on = None

def upgrade():
    # Agregar la columna key_indicators
    op.add_column('ai_conversations', sa.Column('key_indicators', sa.Text(), nullable=True))

def downgrade():
    # Eliminar la columna key_indicators
    op.drop_column('ai_conversations', 'key_indicators') 