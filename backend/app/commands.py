import click
from flask.cli import with_appcontext
from app import db
from app.models import User

@click.command('create-superadmin')
@click.argument('email')
@click.argument('password')
@with_appcontext
def create_superadmin(email, password):
    """Crea un nuevo usuario SuperAdmin."""
    if User.query.filter_by(email=email).first():
        click.echo(f"Error: El usuario con email '{email}' ya existe.")
        return

    try:
        admin = User(
            email=email,
            password=password, # El modelo se encarga del hashing
            user_type='superadmin',
            first_name='Super',
            last_name='Admin',
            # Asignamos valores por defecto a campos requeridos
            phone='000000000',
            address='N/A',
            city='N/A',
            department='N/A'
        )
        db.session.add(admin)
        db.session.commit()
        click.echo(f"SuperAdmin '{email}' creado exitosamente.")
    except Exception as e:
        db.session.rollback()
        click.echo(f"Error al crear el SuperAdmin: {str(e)}")


def register_commands(app):
    """Registra los comandos CLI en la aplicación Flask."""
    app.cli.add_command(create_superadmin) 