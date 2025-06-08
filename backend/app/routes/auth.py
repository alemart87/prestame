from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, BorrowerProfile, LenderProfile
from app.schemas import UserSchema, BorrowerProfileSchema, LenderProfileSchema
from app.schemas.user import UserUpdateSchema
from app.schemas.borrower import BorrowerProfileUpdateSchema
from app.schemas.lender import LenderProfileUpdateSchema
from marshmallow import ValidationError
from app import db
import datetime
from app.utils.stripe_utils import create_stripe_customer

auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()
borrower_schema = BorrowerProfileSchema()
lender_schema = LenderProfileSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint para registrar un nuevo usuario"""
    data = request.get_json()
    
    # Verificar si el correo ya existe
    existing_user = User.query.filter_by(email=data.get('email')).first()
    if existing_user:
        return jsonify({'error': 'El correo electrónico ya está registrado'}), 400
    
    # Validar los datos
    try:
        # Validar con el esquema
        validated_data = user_schema.load(data)
        
        # Remover confirmPassword
        if 'confirmPassword' in data:
            del data['confirmPassword']
        
        # Crear el usuario
        user = User(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            user_type=validated_data['user_type'],
            phone=validated_data.get('phone'),
            address=validated_data.get('address'),
            city=validated_data.get('city'),
            department=validated_data.get('department')
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Crear perfil según el tipo de usuario
        if user.user_type == 'borrower':
            profile = BorrowerProfile(user_id=user.id)
            db.session.add(profile)
        elif user.user_type == 'lender':
            profile = LenderProfile(user_id=user.id)
            db.session.add(profile)
        
        # --- Integración con Stripe ---
        try:
            stripe_customer = create_stripe_customer(user)
            if stripe_customer:
                user.stripe_customer_id = stripe_customer.id
            else:
                print(f"ADVERTENCIA: No se pudo crear el cliente en Stripe para el usuario {user.email}")
        except Exception as stripe_error:
            print(f"ERROR STRIPE: {stripe_error}")
            # Continuar sin Stripe si hay error
            
        db.session.commit()
        # -----------------------------
        
        # Generar token JWT
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'user_type': user.user_type},
            expires_delta=datetime.timedelta(days=1)
        )
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': user_schema.dump(user),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        print(f"ERROR EN REGISTRO: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para iniciar sesión"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Correo y contraseña son requeridos'}), 400
    
    # Buscar usuario por correo
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Generar token JWT
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'user_type': user.user_type},
        expires_delta=datetime.timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Inicio de sesión exitoso',
        'user': user_schema.dump(user),
        'access_token': access_token
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Endpoint para obtener el perfil del usuario autenticado"""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        # Buscar usuario
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Inicializar profile_data para evitar el UnboundLocalError
        profile_data = {}
        
        # Buscar perfil según el tipo de usuario
        if user.user_type == 'borrower':
            profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
            if profile:
                profile_data = borrower_schema.dump(profile)
                # Agregar score calculado
                profile_data['score'] = profile.calculate_score()
        elif user.user_type == 'lender':
            profile = LenderProfile.query.filter_by(user_id=user_id).first()
            if profile:
                profile_data = lender_schema.dump(profile)
        
        # Para 'superadmin', profile_data se mantendrá como un diccionario vacío.
        
        return jsonify({
            'user': user_schema.dump(user),
            'profile': profile_data
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        print(f"ERROR EN GET PROFILE: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Endpoint para actualizar el perfil del usuario autenticado (ahora seguro y validado)."""
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        
        json_data = request.get_json()
        if not json_data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Validar y actualizar datos del usuario
        if 'user' in json_data:
            user_schema_update = UserUpdateSchema()
            user = user_schema_update.load(json_data['user'], instance=user, partial=True)

        # Validar y actualizar datos del perfil
        if 'profile' in json_data:
            if user.user_type == 'borrower':
                profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
                if not profile:
                    profile = BorrowerProfile(user_id=user_id)
                    db.session.add(profile)
                borrower_schema_update = BorrowerProfileUpdateSchema()
                profile = borrower_schema_update.load(json_data['profile'], instance=profile, partial=True)
            elif user.user_type == 'lender':
                profile = LenderProfile.query.filter_by(user_id=user_id).first()
                if not profile:
                    profile = LenderProfile(user_id=user_id)
                    db.session.add(profile)
                lender_schema_update = LenderProfileUpdateSchema()
                profile = lender_schema_update.load(json_data['profile'], instance=profile, partial=True)

        db.session.commit()
        
        # Devolver el perfil actualizado
        updated_profile_data = {}
        if user.user_type == 'borrower':
            updated_profile = BorrowerProfile.query.filter_by(user_id=user_id).first()
            if updated_profile:
                updated_profile_data = borrower_schema.dump(updated_profile)
                updated_profile_data['score'] = updated_profile.calculate_score()
        elif user.user_type == 'lender':
            updated_profile = LenderProfile.query.filter_by(user_id=user_id).first()
            if updated_profile:
                updated_profile_data = lender_schema.dump(updated_profile)
        
        return jsonify({
            'message': 'Perfil actualizado exitosamente',
            'user': user_schema.dump(user),
            'profile': updated_profile_data
        }), 200

    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except ValidationError as err:
        return jsonify(err.messages), 400
    except Exception as e:
        print(f"ERROR EN UPDATE PROFILE: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500 