from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, LenderProfile
from app import db
import stripe

stripe_bp = Blueprint('stripe', __name__)

def get_or_create_stripe_customer(user):
    """
    Obtiene o crea un cliente de Stripe para el usuario.
    """
    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
    
    if user.stripe_customer_id:
        try:
            # Verificar que el cliente existe en Stripe
            customer = stripe.Customer.retrieve(user.stripe_customer_id)
            return customer
        except stripe.error.InvalidRequestError:
            # El cliente no existe, crear uno nuevo
            user.stripe_customer_id = None
    
    # Crear nuevo cliente en Stripe
    try:
        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}",
            metadata={
                'user_id': str(user.id),
                'user_type': 'lender' if user.lender_profile else 'borrower'
            }
        )
        
        # Guardar el ID del cliente en la base de datos
        user.stripe_customer_id = customer.id
        db.session.commit()
        
        return customer
    except Exception as e:
        current_app.logger.error(f"Error al crear cliente de Stripe: {str(e)}")
        raise e

# Diccionario para mapear Price ID a la cantidad de leads
LEAD_PACKAGES = {
    'price_1RXmUmGMLNY8JgDp5sCOotR9': 1,   # Paquete de 1 lead
    'price_1RXmNNGMLNY8JgDpZnx29GPN': 10,  # Paquete de 10 leads
    'price_1RXv0UGMLNY8JgDphalXJuz2': 10,  # LEADS CON IA - 10 leads
}

# Nuevo sistema simplificado de leads
LEAD_PRICING = {
    'price_id': 'price_1RYzjhGMLNY8JgDpKSIvYAak',  # 1 EUR por lead
    'unit_amount': 100,  # 1 EUR en centavos
    'price_per_lead': 1.0,  # 1 EUR por lead (para el frontend)
    'currency': 'eur',
    'min_quantity': 15,
    'max_quantity': 900
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
                # Obtener el price_id y cantidad de la sesión de pago
                line_items = stripe.checkout.Session.list_line_items(session.id, limit=1)
                price_id = line_items.data[0].price.id
                quantity = line_items.data[0].quantity
                
                # Verificar si es el nuevo sistema de leads
                if price_id == LEAD_PRICING['price_id']:
                    # Nuevo sistema: cantidad variable de leads
                    lender_profile.lead_credits += quantity
                    message = f'¡Compra exitosa! Se han añadido {quantity} leads a tu cuenta.'
                else:
                    # Sistema anterior: paquetes fijos
                    credits_to_add = LEAD_PACKAGES.get(price_id, 0)
                    
                    # Si es el producto LEADS CON IA, añadir a ai_search_credits
                    if price_id == 'price_1RXv0UGMLNY8JgDphalXJuz2':
                        lender_profile.ai_search_credits += credits_to_add
                        message = f'¡Compra exitosa! Se han añadido {credits_to_add} créditos de búsqueda con IA a tu cuenta.'
                    else:
                        lender_profile.lead_credits += credits_to_add
                        message = f'¡Compra exitosa! Se han añadido {credits_to_add} leads a tu cuenta.'
                
                db.session.commit()
                return jsonify(status='success', message=message), 200

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

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
    return_url = f"{current_app.config['CORS_ORIGINS']}/subscriptions"

    try:
        # Obtener o crear cliente de Stripe
        customer = get_or_create_stripe_customer(user)
        
        portal_session = stripe.billing_portal.Session.create(
            customer=customer.id,
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

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

    try:
        # Obtener o crear cliente de Stripe
        customer = get_or_create_stripe_customer(user)
        
        # Definir las URLs de éxito y cancelación
        success_url = f"{current_app.config['CORS_ORIGINS']}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{current_app.config['CORS_ORIGINS']}/subscriptions"

        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
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

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

    try:
        # Obtener o crear cliente de Stripe
        customer = get_or_create_stripe_customer(user)
        
        success_url = f"{current_app.config['CORS_ORIGINS']}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&purchase=leads"
        cancel_url = f"{current_app.config['CORS_ORIGINS']}/subscriptions"

        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
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

@stripe_bp.route('/get-lead-pricing', methods=['GET'])
def get_lead_pricing():
    """
    Obtiene la información de precios para el sistema de leads.
    """
    return jsonify(LEAD_PRICING), 200

@stripe_bp.route('/create-leads-checkout', methods=['POST'])
@jwt_required()
def create_leads_checkout():
    """
    Crea una sesión de Checkout de Stripe para comprar leads con cantidad variable.
    """
    data = request.get_json()
    quantity = data.get('quantity')
    
    if not quantity or quantity < LEAD_PRICING['min_quantity'] or quantity > LEAD_PRICING['max_quantity']:
        return jsonify({
            'error': f'La cantidad debe estar entre {LEAD_PRICING["min_quantity"]} y {LEAD_PRICING["max_quantity"]} leads'
        }), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

    try:
        # Obtener o crear cliente de Stripe
        customer = get_or_create_stripe_customer(user)
        current_app.logger.info(f"Cliente Stripe obtenido: {customer.id}")
        
        # Obtener CORS_ORIGINS con valor por defecto
        cors_origins = current_app.config.get('CORS_ORIGINS', 'http://localhost:3000')
        success_url = f"{cors_origins}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&purchase=leads"
        cancel_url = f"{cors_origins}/subscriptions"
        
        current_app.logger.info(f"URLs configuradas - Success: {success_url}, Cancel: {cancel_url}")
        current_app.logger.info(f"Creando sesión con price_id: {LEAD_PRICING['price_id']}, quantity: {quantity}")

        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': LEAD_PRICING['price_id'],
                    'quantity': quantity,
                },
            ],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
        )
        current_app.logger.info(f"Sesión creada exitosamente: {checkout_session.id}")
        return jsonify({'url': checkout_session.url, 'sessionId': checkout_session.id}), 200
    except Exception as e:
        current_app.logger.error(f"Error al crear sesión de checkout para leads: {str(e)}")
        current_app.logger.error(f"Tipo de error: {type(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify(error=str(e)), 500

@stripe_bp.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    """
    Webhook de Stripe para procesar eventos de pago y suscripción automáticamente.
    Asigna créditos o activa suscripciones cuando el pago es exitoso.
    """
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = current_app.config.get('STRIPE_WEBHOOK_SECRET')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'error': 'Payload inválido'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'error': 'Firma de Stripe inválida'}), 400

    # Procesar solo eventos relevantes
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_id = session.get('customer')
        mode = session.get('mode')
        # Buscar usuario por stripe_customer_id
        user = User.query.filter_by(stripe_customer_id=customer_id).first()
        if not user or not user.lender_profile:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        lender_profile = user.lender_profile

        if mode == 'subscription':
            subscription_id = session.get('subscription')
            subscription = stripe.Subscription.retrieve(subscription_id)
            price_id = subscription['items']['data'][0]['price']['id']
            lender_profile.stripe_subscription_id = subscription_id
            lender_profile.subscription_status = subscription['status']
            lender_profile.lead_credits += SUBSCRIPTION_PLANS.get(price_id, 0)
            db.session.commit()
            return jsonify({'status': 'success', 'message': f'Suscripción activada. {SUBSCRIPTION_PLANS.get(price_id, 0)} leads añadidos.'}), 200
        elif mode == 'payment':
            # Compra única de leads
            line_items = stripe.checkout.Session.list_line_items(session['id'], limit=1)
            price_id = line_items.data[0].price.id
            quantity = line_items.data[0].quantity
            if price_id == LEAD_PRICING['price_id']:
                lender_profile.lead_credits += quantity
                message = f'¡Compra exitosa! Se han añadido {quantity} leads a tu cuenta.'
            else:
                credits_to_add = LEAD_PACKAGES.get(price_id, 0)
                if price_id == 'price_1RXv0UGMLNY8JgDphalXJuz2':
                    lender_profile.ai_search_credits += credits_to_add
                    message = f'¡Compra exitosa! Se han añadido {credits_to_add} créditos de búsqueda con IA a tu cuenta.'
                else:
                    lender_profile.lead_credits += credits_to_add
                    message = f'¡Compra exitosa! Se han añadido {credits_to_add} leads a tu cuenta.'
            db.session.commit()
            return jsonify({'status': 'success', 'message': message}), 200
    # Otros eventos pueden ser procesados aquí si es necesario
    return jsonify({'status': 'ignored', 'message': 'Evento no relevante'}), 200 