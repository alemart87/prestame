#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para instalar dependencias del Super Scrapeador Avanzado de Paraguay
Incluye configuración de Selenium y ChromeDriver
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Ejecuta un comando y maneja errores"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado exitosamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"Salida del error: {e.stderr}")
        return False

def install_chrome_driver():
    """Instala ChromeDriver automáticamente"""
    print("\n🚗 Configurando ChromeDriver...")
    
    try:
        import chromedriver_autoinstaller
        chromedriver_autoinstaller.install()
        print("✅ ChromeDriver instalado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error instalando ChromeDriver: {e}")
        print("💡 Intenta instalar Chrome manualmente desde: https://www.google.com/chrome/")
        return False

def check_chrome_installation():
    """Verifica si Chrome está instalado"""
    print("\n🔍 Verificando instalación de Chrome...")
    
    system = platform.system().lower()
    
    if system == "windows":
        chrome_paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe")
        ]
    elif system == "darwin":  # macOS
        chrome_paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        ]
    else:  # Linux
        chrome_paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium-browser"
        ]
    
    for path in chrome_paths:
        if os.path.exists(path):
            print(f"✅ Chrome encontrado en: {path}")
            return True
    
    print("❌ Chrome no encontrado")
    print("💡 Por favor instala Google Chrome desde: https://www.google.com/chrome/")
    return False

def main():
    print("🚀 INSTALADOR DEL SUPER SCRAPEADOR AVANZADO DE PARAGUAY")
    print("=" * 60)
    print("Este script instalará todas las dependencias necesarias para")
    print("el scraper avanzado con LinkedIn, Facebook, y más fuentes.")
    print("=" * 60)
    
    # 1. Verificar Python
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Se requiere Python 3.8 o superior")
        sys.exit(1)
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detectado")
    
    # 2. Instalar dependencias básicas
    commands = [
        ("pip install --upgrade pip", "Actualizando pip"),
        ("pip install -r requirements.txt", "Instalando dependencias de Python"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            print(f"\n❌ Falló la instalación. Verifica tu conexión a internet.")
            sys.exit(1)
    
    # 3. Verificar Chrome
    chrome_ok = check_chrome_installation()
    
    # 4. Instalar ChromeDriver
    if chrome_ok:
        driver_ok = install_chrome_driver()
    else:
        print("\n⚠️  Sin Chrome, el scraper funcionará en modo simulado")
        driver_ok = False
    
    # 5. Probar importaciones
    print("\n🧪 Probando importaciones...")
    
    test_imports = [
        ("requests", "Requests"),
        ("bs4", "BeautifulSoup"),
        ("selenium", "Selenium"),
        ("fake_useragent", "Fake UserAgent"),
        ("phonenumbers", "Phone Numbers"),
        ("unidecode", "Unidecode")
    ]
    
    all_imports_ok = True
    for module, name in test_imports:
        try:
            __import__(module)
            print(f"✅ {name} importado correctamente")
        except ImportError as e:
            print(f"❌ Error importando {name}: {e}")
            all_imports_ok = False
    
    # 6. Probar Selenium
    if chrome_ok and driver_ok:
        print("\n🔧 Probando Selenium...")
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            
            options = Options()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            
            driver = webdriver.Chrome(options=options)
            driver.get("https://www.google.com")
            driver.quit()
            print("✅ Selenium funcionando correctamente")
        except Exception as e:
            print(f"❌ Error probando Selenium: {e}")
            print("💡 El scraper funcionará en modo simulado")
    
    # 7. Resumen final
    print("\n" + "=" * 60)
    print("📋 RESUMEN DE INSTALACIÓN")
    print("=" * 60)
    
    if all_imports_ok:
        print("✅ Todas las dependencias de Python instaladas")
    else:
        print("⚠️  Algunas dependencias fallaron")
    
    if chrome_ok and driver_ok:
        print("✅ Chrome y ChromeDriver configurados")
        print("🌐 Scraper funcionará con datos reales de:")
        print("   • LinkedIn Paraguay")
        print("   • Facebook Business Pages")
        print("   • MercadoLibre Paraguay")
        print("   • Directorios empresariales")
    else:
        print("⚠️  Chrome/ChromeDriver no disponible")
        print("🎭 Scraper funcionará en modo simulado con datos realistas")
    
    print("\n🚀 FUENTES DE DATOS DISPONIBLES:")
    print("   • LinkedIn Profesionales")
    print("   • Facebook Páginas de Negocio")
    print("   • MercadoLibre Vendedores")
    print("   • Directorios Empresariales")
    print("   • Clasificados ABC/Última Hora")
    print("   • Base de Datos Paraguay")
    
    print("\n💡 EJEMPLOS DE BÚSQUEDA:")
    print('   • "Comerciantes de Asunción que vendan ropa"')
    print('   • "Pequeños empresarios de Ciudad del Este"')
    print('   • "Productores agrícolas de Itapúa"')
    print('   • "Profesionales independientes de Central"')
    
    print("\n🎉 ¡Instalación completada!")
    print("Ahora puedes usar el Super Scrapeador Avanzado de Paraguay")
    print("=" * 60)

if __name__ == "__main__":
    main() 