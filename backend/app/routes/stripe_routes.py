from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, LenderProfile
from app import db
import stripe

stripe_bp = Blueprint('stripe', __name__)

# Diccionario para mapear Price ID a la cantidad de leads
LEAD_PACKAGES = {
    'price_1RXmUmGMLNY8JgDp5sCOotR9': 1,   # Paquete de 1 lead
    'price_1RXmNNGMLNY8JgDpZnx29GPN': 10,  # Paquete de 10 leads
}

SUBSCRIPTION_PLANS = {
    'price_1RXmTOGMLNY8JgDpxAl1QfGx': 10,  # Starter
    'price_1RXmTdGMLNY8JgDptfVeN5bD': 50,  # Pro
    'price_1RXmTnGMLNY8JgDp8yDvflG4': 80,  # Pro Superior
}

@stripe_bp.route('/verify-checkout-session', methods=['POST'])
@jwt_required()
def verify_checkout_session():
    """
    Verifica una sesión de Checkout de Stripe, y si es exitosa,
    actualiza el perfil del prestamista con los créditos o la suscripción.
    """
    data = request.get_json()
    session_id = data.get('session_id')
    if not session_id:
        return jsonify(error='Session ID es requerido'), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.lender_profile:
        return jsonify(error='Perfil de prestamista no válido'), 404

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
    
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.status == 'complete':
            lender_profile = user.lender_profile

            if session.mode == 'subscription':
                subscription = stripe.Subscription.retrieve(session.subscription)
                
                # Actualizar perfil con datos de la suscripción
                lender_profile.stripe_subscription_id = subscription.id
                lender_profile.subscription_status = subscription.status # 'active'
                # Asignar los leads correspondientes al plan
                price_id = subscription.items.data[0].price.id
                lender_profile.lead_credits += SUBSCRIPTION_PLANS.get(price_id, 0)
                
                db.session.commit()
                return jsonify(status='success', message=f'Suscripción activada. ¡{SUBSCRIPTION_PLANS.get(price_id, 0)} leads añadidos!'), 200

            elif session.mode == 'payment':
                # Obtener el price_id de la sesión de pago
                line_items = stripe.checkout.Session.list_line_items(session.id, limit=1)
                price_id = line_items.data[0].price.id
                
                # Añadir créditos del paquete de leads
                credits_to_add = LEAD_PACKAGES.get(price_id, 0)
                lender_profile.lead_credits += credits_to_add
                
                db.session.commit()
                return jsonify(status='success', message=f'¡Compra exitosa! Se han añadido {credits_to_add} leads a tu cuenta.'), 200

        else:
            return jsonify(status='pending', message=f'El pago aún está en estado: {session.status}'), 400

    except stripe.error.StripeError as e:
        return jsonify(error=f'Error de Stripe: {str(e)}'), 500
    except Exception as e:
        return jsonify(error=f'Error inesperado: {str(e)}'), 500

@stripe_bp.route('/create-portal-session', methods=['POST'])
@jwt_required()
def create_portal_session():
    """
    Crea una sesión del Portal de Cliente de Stripe para que el usuario gestione su suscripción.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.stripe_customer_id:
        return jsonify({'error': 'Usuario de Stripe no válido'}), 400

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
    return_url = f"{current_app.config['CORS_ORIGINS']}/subscriptions"

    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url,
        )
        return jsonify({'url': portal_session.url}), 200
    except Exception as e:
        current_app.logger.error(f"Error al crear sesión del portal de cliente: {str(e)}")
        return jsonify(error=str(e)), 500

@stripe_bp.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    """
    Crea una sesión de Checkout de Stripe (Payment Link) para una suscripción.
    """
    data = request.get_json()
    price_id = data.get('priceId')
    
    if not price_id:
        return jsonify({'error': 'El ID del precio es requerido'}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    if not user.stripe_customer_id:
        return jsonify({'error': 'El usuario no tiene un ID de cliente de Stripe asociado'}), 400

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

    try:
        # Definir las URLs de éxito y cancelación
        # Usamos la URL del frontend que deberemos crear
        success_url = f"{current_app.config['CORS_ORIGINS']}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{current_app.config['CORS_ORIGINS']}/subscriptions"

        checkout_session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return jsonify({'sessionId': checkout_session.id, 'url': checkout_session.url}), 200
    except Exception as e:
        current_app.logger.error(f"Error al crear sesión de checkout de Stripe: {str(e)}")
        return jsonify(error=str(e)), 500

@stripe_bp.route('/create-one-time-checkout', methods=['POST'])
@jwt_required()
def create_one_time_checkout():
    """
    Crea una sesión de Checkout de Stripe para una compra única.
    """
    data = request.get_json()
    price_id = data.get('priceId')
    
    if not price_id:
        return jsonify({'error': 'El ID del precio es requerido'}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.stripe_customer_id:
        return jsonify({'error': 'Usuario de Stripe no válido'}), 400

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

    try:
        success_url = f"{current_app.config['CORS_ORIGINS']}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&purchase=leads"
        cancel_url = f"{current_app.config['CORS_ORIGINS']}/subscriptions"

        checkout_session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return jsonify({'url': checkout_session.url}), 200
    except Exception as e:
        current_app.logger.error(f"Error al crear sesión de pago único en Stripe: {str(e)}")
        return jsonify(error=str(e)), 500 