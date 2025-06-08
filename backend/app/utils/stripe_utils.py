import stripe
from flask import current_app

def get_or_create_product(name, description):
    """
    Busca un producto por nombre. Si no existe, lo crea.
    Retorna el objeto del producto de Stripe.
    """
    products = stripe.Product.list(limit=100)
    existing_product = next((p for p in products.data if p.name == name), None)
    
    if existing_product:
        print(f"Producto '{name}' ya existe con ID: {existing_product.id}")
        return existing_product
    
    print(f"Creando producto '{name}'...")
    product = stripe.Product.create(
        name=name,
        description=description,
        type='service'
    )
    print(f"Producto '{name}' creado con ID: {product.id}")
    return product

def get_or_create_price(product_id, amount_in_cents, currency, recurring_interval=None, lookup_key=None):
    """
    Busca un precio por su lookup_key. Si no existe, lo crea.
    Retorna el objeto de precio de Stripe.
    """
    try:
        if lookup_key:
            prices = stripe.Price.list(lookup_keys=[lookup_key], limit=1)
            if prices.data:
                price = prices.data[0]
                print(f"Precio con lookup_key '{lookup_key}' ya existe con ID: {price.id}")
                return price
    except stripe.error.InvalidRequestError:
         # Lookup key no encontrado, proceder a crear
         pass

    print(f"Creando precio para producto {product_id} por {amount_in_cents/100} {currency.upper()}...")
    price_data = {
        "product": product_id,
        "unit_amount": amount_in_cents,
        "currency": currency,
        "lookup_key": lookup_key,
    }
    if recurring_interval:
        price_data["recurring"] = {"interval": recurring_interval}

    price = stripe.Price.create(**price_data)
    print(f"Precio creado con ID: {price.id}")
    return price

def sync_stripe_products_and_prices():
    """
    Función principal para sincronizar todos los productos y precios definidos para Prestame.
    """
    stripe.api_key = current_app.config.get('STRIPE_SECRET_KEY')
    if not stripe.api_key:
        raise ValueError("STRIPE_SECRET_KEY no está configurada en el backend.")

    results = {}

    # 1. Producto de Suscripción
    subscription_product = get_or_create_product(
        name="Plan de Leads Prestame",
        description="Suscripción mensual para acceso a leads en la plataforma Prestame."
    )
    results['subscription_product_id'] = subscription_product.id
    
    # Precios de Suscripción
    starter_price = get_or_create_price(
        product_id=subscription_product.id,
        amount_in_cents=900,
        currency='usd',
        recurring_interval='month',
        lookup_key='prestame_starter_monthly'
    )
    results['starter_price_id'] = starter_price.id

    pro_price = get_or_create_price(
        product_id=subscription_product.id,
        amount_in_cents=2900,
        currency='usd',
        recurring_interval='month',
        lookup_key='prestame_pro_monthly'
    )
    results['pro_price_id'] = pro_price.id

    pro_superior_price = get_or_create_price(
        product_id=subscription_product.id,
        amount_in_cents=4900,
        currency='usd',
        recurring_interval='month',
        lookup_key='prestame_pro_superior_monthly'
    )
    results['pro_superior_price_id'] = pro_superior_price.id
    
    # 2. Producto de Compra Única
    one_time_product = get_or_create_product(
        name="Paquete de Leads Adicionales",
        description="Compra única de un paquete de 10 leads para prestamistas suscritos."
    )
    results['one_time_product_id'] = one_time_product.id

    # Precio de Compra Única
    one_time_price = get_or_create_price(
        product_id=one_time_product.id,
        amount_in_cents=1000, # 10 leads a $1 cada uno
        currency='usd',
        lookup_key='prestame_10_leads_pack'
    )
    results['one_time_price_id'] = one_time_price.id

    print("\n--- Sincronización con Stripe completada ---")
    return results

def create_stripe_customer(user):
    """
    Crea un cliente en Stripe para un usuario dado.
    """
    stripe.api_key = current_app.config['STRIPE_SECRET_KEY']
    
    try:
        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}",
            metadata={
                'user_id': user.id,
                'user_type': user.user_type
            }
        )
        return customer
    except Exception as e:
        # Manejar el error, por ejemplo, logueándolo
        print(f"Error al crear cliente en Stripe: {str(e)}")
        return None 