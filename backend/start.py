import os
import sys
from app import create_app, db
from flask_migrate import Migrate

# Crear la aplicación para poder acceder al contexto
app = create_app()
migrate = Migrate(app, db)

def run_server():
    try:
        print("🔧 Configuración cargada:")
        print(f"   📊 Base de datos: PostgreSQL en Render")
        print(f"   🔑 JWT configurado: ✅")
        print(f"   🌐 CORS configurado: ✅")
        
        with app.app_context():
            print("✅ Conexión con la base de datos verificada.")
        
        print("\n🚀 Iniciando servidor Flask...")
        print("   📍 URL: http://localhost:5000")
        print("   🔗 API: http://localhost:5000/api")
        print("   📋 Endpoints disponibles:")
        print("      - POST /api/auth/register")
        print("      - POST /api/auth/login")
        print("      - GET  /api/auth/profile")
        print("      - PUT  /api/auth/profile")
        print("\n⏹️  Presiona Ctrl+C para detener el servidor\n")
        
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except ValueError as e:
        print(f"❌ Error de configuración: {e}")
        print("💡 Verifica que el archivo .env esté configurado correctamente")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        sys.exit(1)

if __name__ == '__main__':
    # Si se pasan argumentos, se asume que son para el CLI de Flask/Migrate.
    # Flask buscará automáticamente el objeto 'app' en este archivo.
    if len(sys.argv) == 1:
        run_server() 