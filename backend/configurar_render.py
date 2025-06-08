#!/usr/bin/env python3
"""
Script para configurar la URL de PostgreSQL de Render
"""

def configurar_render():
    print("🔧 CONFIGURACIÓN DE POSTGRESQL RENDER")
    print("=" * 50)
    print()
    
    print("📋 Necesito tu URL de PostgreSQL de Render.")
    print("   Normalmente tiene este formato:")
    print("   postgresql://usuario:password@dpg-xxxxxxxxx-a.oregon-postgres.render.com/database")
    print()
    
    url = input("🔗 Pega aquí tu URL de PostgreSQL de Render: ").strip()
    
    if not url.startswith('postgresql://'):
        print("❌ Error: La URL debe comenzar con 'postgresql://'")
        return False
    
    # Actualizar config.py
    try:
        with open('app/config.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Reemplazar la URL de ejemplo
        content = content.replace(
            "postgresql://prestame_user:CAMBIAR_PASSWORD@dpg-xxxxxxxxx-a.oregon-postgres.render.com/prestame_db",
            url
        )
        
        with open('app/config.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Configuración actualizada correctamente!")
        print("🚀 Ahora puedes ejecutar: python start.py")
        return True
        
    except Exception as e:
        print(f"❌ Error al actualizar configuración: {e}")
        return False

if __name__ == "__main__":
    configurar_render() 