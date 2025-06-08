"""
Utilidades para validación de datos
"""

def validate_password(password):
    """
    Valida que la contraseña cumpla con los requisitos mínimos
    - Al menos 8 caracteres
    - Al menos una letra mayúscula
    - Al menos una letra minúscula
    - Al menos un número
    """
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
        
    if not any(c.isupper() for c in password):
        return False, "La contraseña debe tener al menos una letra mayúscula"
        
    if not any(c.islower() for c in password):
        return False, "La contraseña debe tener al menos una letra minúscula"
        
    if not any(c.isdigit() for c in password):
        return False, "La contraseña debe tener al menos un número"
        
    return True, "Contraseña válida"

def validate_email(email):
    """
    Valida que el correo electrónico tenga un formato válido
    """
    if '@' not in email or '.' not in email:
        return False, "El correo electrónico debe tener un formato válido"
        
    return True, "Correo electrónico válido"

def validate_phone_number(phone):
    """
    Valida que el número de teléfono tenga un formato válido
    - Solo dígitos
    - Al menos 8 dígitos
    """
    # Eliminar espacios y guiones
    clean_phone = ''.join(c for c in phone if c.isdigit())
    
    if len(clean_phone) < 8:
        return False, "El número de teléfono debe tener al menos 8 dígitos"
        
    return True, "Número de teléfono válido" 