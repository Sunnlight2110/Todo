"""Fix chat_sessions unique constraint to be per-user

Revision ID: 49
Revises: 48c26dc22775
Create Date: 2026-02-25 02:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '49'
down_revision = '48c26dc22775'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the global unique constraint on session_uuid
    with op.batch_alter_table('chat_sessions', schema=None) as batch_op:
        # Remove old global unique constraint
        batch_op.drop_constraint('ix_chat_sessions_session_uuid', type_='unique')
        
        # Add composite unique constraint (user_id, session_uuid)
        batch_op.create_unique_constraint(
            'uq_user_session',
            ['user_id', 'session_uuid']
        )


def downgrade() -> None:
    # Revert to global unique constraint
    with op.batch_alter_table('chat_sessions', schema=None) as batch_op:
        # Remove composite constraint
        batch_op.drop_constraint('uq_user_session', type_='unique')
        
        # Restore global unique constraint
        batch_op.create_unique_constraint(
            'ix_chat_sessions_session_uuid',
            ['session_uuid']
        )
