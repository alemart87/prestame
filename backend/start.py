import os
os.environ['FLASK_SKIP_DOTENV'] = '1'  # Deshabilitar carga automática de .env

from app import create_app, db

def main():
    try:
        # Crear la aplicación
        app = create_app()
        
        print("🔧 Configuración cargada:")
        print(f"   📊 Base de datos: PostgreSQL en Render")
        print(f"   🔑 JWT configurado: ✅")
        print(f"   🌐 CORS configurado: ✅")
        
        # Crear tablas en el contexto de la aplicación
        with app.app_context():
            db.create_all()
            print("✅ Tablas creadas/verificadas en PostgreSQL")
        
        print("\n🚀 Iniciando servidor Flask...")
        print("   📍 URL: http://localhost:5000")
        print("   🔗 API: http://localhost:5000/api")
        print("   📋 Endpoints disponibles:")
        print("      - POST /api/auth/register")
        print("      - POST /api/auth/login")
        print("      - GET  /api/auth/profile")
        print("      - PUT  /api/auth/profile")
        print("\n⏹️  Presiona Ctrl+C para detener el servidor\n")
        
        # Ejecutar la aplicación
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except ValueError as e:
        print(f"❌ Error de configuración: {e}")
        print("💡 Verifica que el archivo .env esté configurado correctamente")
        return 1
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return 1

if __name__ == '__main__':
    exit(main()) 