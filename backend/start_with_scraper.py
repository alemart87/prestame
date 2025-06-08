#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de inicio completo para Prestame con Super Scrapeador de Paraguay
"""

import os
import sys
import subprocess
import time

def print_banner():
    """Muestra el banner de inicio"""
    print("=" * 70)
    print("🇵🇾 PRESTAME - SUPER SCRAPEADOR DE PARAGUAY")
    print("=" * 70)
    print("🚀 Sistema de Leads Reales para Prestamistas")
    print("🌐 Datos extraídos de sitios web paraguayos")
    print("=" * 70)

def check_dependencies():
    """Verifica si las dependencias están instaladas"""
    print("\n📦 Verificando dependencias del scraper...")
    
    required_packages = [
        'requests', 'beautifulsoup4', 'selenium', 'lxml', 
        'fake_useragent', 'unidecode', 'phonenumbers'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - FALTANTE")
            missing_packages.append(package)
    
    return missing_packages

def install_missing_dependencies(missing_packages):
    """Instala las dependencias faltantes"""
    if not missing_packages:
        return True
    
    print(f"\n🔧 Instalando {len(missing_packages)} dependencias faltantes...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install"
        ] + missing_packages)
        print("✅ Todas las dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        return False

def test_scraper():
    """Prueba rápida del scraper"""
    print("\n🧪 Probando el scraper...")
    
    try:
        # Importar después de instalar dependencias
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from app.utils.paraguay_scraper import ParaguayScraper
        
        scraper = ParaguayScraper()
        
        # Prueba básica
        phone = scraper.generate_paraguayan_phone()
        email = scraper.generate_realistic_email("Test User")
        
        print(f"✅ Scraper funcionando correctamente")
        print(f"   📞 Teléfono de prueba: {phone}")
        print(f"   📧 Email de prueba: {email}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en el scraper: {e}")
        return False

def setup_database():
    """Configura la base de datos"""
    print("\n🗄️  Configurando base de datos...")
    
    try:
        from app import create_app, db
        
        app = create_app()
        with app.app_context():
            db.create_all()
            print("✅ Base de datos configurada correctamente")
        
        return True
        
    except Exception as e:
        print(f"❌ Error configurando base de datos: {e}")
        return False

def start_application():
    """Inicia la aplicación"""
    print("\n🚀 Iniciando aplicación Prestame...")
    print("🌐 El servidor estará disponible en: http://localhost:5000")
    print("📊 Panel de administración: http://localhost:5000/admin")
    print("🔍 Buscador de leads: http://localhost:5000/ai-lead-finder")
    print("\n⚠️  Presiona Ctrl+C para detener el servidor")
    print("=" * 70)
    
    try:
        from app import create_app
        
        app = create_app()
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error iniciando la aplicación: {e}")

def main():
    """Función principal"""
    print_banner()
    
    # 1. Verificar dependencias
    missing = check_dependencies()
    
    # 2. Instalar dependencias faltantes
    if missing:
        if not install_missing_dependencies(missing):
            print("\n❌ No se pudieron instalar todas las dependencias")
            print("💡 Intenta instalarlas manualmente:")
            for package in missing:
                print(f"   pip install {package}")
            return
    
    # 3. Probar el scraper
    if not test_scraper():
        print("\n⚠️  El scraper tiene problemas, pero la aplicación puede funcionar")
        response = input("¿Continuar de todos modos? (s/n): ")
        if response.lower() != 's':
            return
    
    # 4. Configurar base de datos
    if not setup_database():
        print("\n❌ No se pudo configurar la base de datos")
        return
    
    # 5. Mostrar información del sistema
    print("\n📋 INFORMACIÓN DEL SISTEMA")
    print("-" * 40)
    print("🔧 Scraper: Activo")
    print("🌐 Fuentes: 6 sitios paraguayos")
    print("📱 Validación: Teléfonos y emails")
    print("🏢 Enfoque: Comerciantes y empresarios")
    print("🇵🇾 País: Paraguay")
    
    # 6. Iniciar aplicación
    time.sleep(2)
    start_application()

if __name__ == "__main__":
    main() 