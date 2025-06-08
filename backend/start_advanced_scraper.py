#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de inicio para el Super Scrapeador Avanzado de Paraguay
Instala dependencias automáticamente y ejecuta la aplicación
"""

import subprocess
import sys
import os
import time

def run_command(command, description, check=True):
    """Ejecuta un comando y maneja errores"""
    print(f"\n🔧 {description}...")
    try:
        if isinstance(command, list):
            result = subprocess.run(command, check=check, capture_output=True, text=True)
        else:
            result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ {description} completado exitosamente")
            return True
        else:
            print(f"⚠️  {description} completado con advertencias")
            if result.stderr:
                print(f"Advertencia: {result.stderr}")
            return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def check_dependencies():
    """Verifica si las dependencias están instaladas"""
    print("\n🔍 Verificando dependencias...")
    
    required_packages = [
        'flask', 'requests', 'beautifulsoup4', 'selenium', 
        'fake_useragent', 'phonenumbers', 'unidecode'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} instalado")
        except ImportError:
            print(f"❌ {package} no encontrado")
            missing_packages.append(package)
    
    return len(missing_packages) == 0, missing_packages

def install_dependencies():
    """Instala las dependencias necesarias"""
    print("\n📦 Instalando dependencias del scraper avanzado...")
    
    commands = [
        ("pip install --upgrade pip", "Actualizando pip"),
        ("pip install -r requirements.txt", "Instalando dependencias de Python"),
    ]
    
    for command, description in commands:
        if not run_command(command, description, check=False):
            print(f"⚠️  Continuando a pesar del error en {description}")
    
    # Instalar ChromeDriver automáticamente
    try:
        print("\n🚗 Configurando ChromeDriver...")
        import chromedriver_autoinstaller
        chromedriver_autoinstaller.install()
        print("✅ ChromeDriver configurado correctamente")
    except Exception as e:
        print(f"⚠️  ChromeDriver no pudo configurarse: {e}")
        print("💡 El scraper funcionará en modo simulado")

def test_scraper():
    """Prueba rápida del scraper"""
    print("\n🧪 Probando el scraper avanzado...")
    
    try:
        from app.utils.paraguay_scraper import search_real_leads_paraguay
        
        # Prueba rápida
        results = search_real_leads_paraguay("comerciantes de Asunción", limit=3)
        
        if results:
            print(f"✅ Scraper funcionando: {len(results)} leads encontrados")
            print(f"   Ejemplo: {results[0]['full_name']} - {results[0]['source']}")
            return True
        else:
            print("⚠️  Scraper funcionando pero sin resultados")
            return True
            
    except Exception as e:
        print(f"❌ Error probando scraper: {e}")
        return False

def start_flask_app():
    """Inicia la aplicación Flask"""
    print("\n🚀 Iniciando aplicación Flask...")
    print("=" * 60)
    print("🌐 SUPER SCRAPEADOR AVANZADO DE PARAGUAY ACTIVO")
    print("=" * 60)
    print("📊 Fuentes disponibles:")
    print("   • LinkedIn Paraguay")
    print("   • Facebook Business Pages") 
    print("   • MercadoLibre Avanzado")
    print("   • Directorios Empresariales")
    print("   • Clasificados ABC/Última Hora")
    print("   • Base de Datos Paraguay")
    print("=" * 60)
    print("🔗 Aplicación disponible en: http://localhost:5000")
    print("⏹️  Presiona Ctrl+C para detener el servidor")
    print("=" * 60)
    
    try:
        # Configurar variables de entorno
        os.environ['FLASK_APP'] = 'run.py'
        os.environ['FLASK_ENV'] = 'development'
        
        # Ejecutar Flask
        subprocess.run([sys.executable, 'run.py'], check=True)
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error ejecutando Flask: {e}")

def main():
    print("🚀 SUPER SCRAPEADOR AVANZADO DE PARAGUAY")
    print("=" * 60)
    print("Iniciando sistema con LinkedIn, Facebook, MercadoLibre y más...")
    print("=" * 60)
    
    # 1. Verificar directorio
    if not os.path.exists('run.py'):
        print("❌ Error: Debes ejecutar este script desde el directorio backend/")
        print("💡 Usa: cd backend && python start_advanced_scraper.py")
        sys.exit(1)
    
    # 2. Verificar Python
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Se requiere Python 3.8 o superior")
        sys.exit(1)
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detectado")
    
    # 3. Verificar dependencias
    deps_ok, missing = check_dependencies()
    
    if not deps_ok:
        print(f"\n📦 Faltan dependencias: {', '.join(missing)}")
        install_dependencies()
        
        # Verificar nuevamente
        deps_ok, missing = check_dependencies()
        if not deps_ok:
            print(f"⚠️  Algunas dependencias aún faltan: {', '.join(missing)}")
            print("💡 El scraper funcionará en modo limitado")
    
    # 4. Probar scraper
    scraper_ok = test_scraper()
    
    if not scraper_ok:
        print("⚠️  Scraper con problemas, pero continuando...")
    
    # 5. Iniciar aplicación
    print("\n🎉 Todo listo para iniciar!")
    time.sleep(2)
    
    start_flask_app()

if __name__ == "__main__":
    main() 