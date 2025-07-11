"""Add category to products

Revision ID: 10cfb68093bc
Revises: 15d257328bf1
Create Date: 2025-05-18 15:38:13.879371

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '10cfb68093bc'
down_revision = '15d257328bf1'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('category', sa.String(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_column('category')

    # ### end Alembic commands ###
