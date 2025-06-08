#!/usr/bin/env python3
"""
Script para instalar las dependencias necesarias para el scraper de Paraguay
"""

import subprocess
import sys
import os

def install_package(package):
    """Instala un paquete usando pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} instalado correctamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando {package}: {e}")
        return False

def main():
    print("🚀 Instalando dependencias para el Super Scrapeador de Paraguay...")
    print("=" * 60)
    
    # Lista de paquetes necesarios
    packages = [
        "requests==2.31.0",
        "beautifulsoup4==4.12.2", 
        "selenium==4.15.0",
        "lxml==4.9.3",
        "fake-useragent==1.4.0",
        "unidecode==1.3.7",
        "phonenumbers==8.13.25"
    ]
    
    success_count = 0
    total_packages = len(packages)
    
    for package in packages:
        print(f"\n📦 Instalando {package}...")
        if install_package(package):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Resumen de instalación:")
    print(f"   ✅ Exitosos: {success_count}/{total_packages}")
    print(f"   ❌ Fallidos: {total_packages - success_count}/{total_packages}")
    
    if success_count == total_packages:
        print("\n🎉 ¡Todas las dependencias se instalaron correctamente!")
        print("🔧 El Super Scrapeador de Paraguay está listo para usar.")
        print("\n📝 Próximos pasos:")
        print("   1. Ejecuta: cd backend")
        print("   2. Ejecuta: python run.py")
        print("   3. Prueba el scraper desde el frontend")
    else:
        print("\n⚠️  Algunas dependencias no se pudieron instalar.")
        print("   Intenta instalarlas manualmente con:")
        for package in packages:
            print(f"   pip install {package}")
    
    print("\n🌐 Fuentes de datos que el scraper utilizará:")
    print("   • Páginas Amarillas Paraguay")
    print("   • MercadoLibre Paraguay")
    print("   • Directorios Empresariales")
    print("   • Facebook Marketplace Paraguay")
    print("   • Clasificados Paraguay")

if __name__ == "__main__":
    main() 