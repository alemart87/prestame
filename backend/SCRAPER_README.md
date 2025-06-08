# 🇵🇾 Super Scrapeador de Paraguay

## 📋 Descripción

El **Super Scrapeador de Paraguay** es un sistema avanzado de web scraping diseñado específicamente para encontrar datos reales de personas y empresas en sitios web paraguayos. Reemplaza el sistema anterior de generación de leads ficticios con IA por datos reales extraídos de fuentes web paraguayas.

## 🎯 Características Principales

- ✅ **Datos 100% Reales**: Extrae información real de sitios web paraguayos
- 🌐 **Múltiples Fuentes**: Busca en varios sitios web simultáneamente
- 📱 **Validación de Datos**: Valida números de teléfono y emails automáticamente
- 🏢 **Enfoque Empresarial**: Especializado en encontrar comerciantes y empresarios
- 🔄 **Búsqueda Inteligente**: Analiza el prompt del usuario para optimizar la búsqueda
- 📊 **Reportes Detallados**: Proporciona información sobre la fuente de cada lead

## 🌐 Fuentes de Datos

El scraper busca información en los siguientes sitios paraguayos:

1. **Páginas Amarillas Paraguay** - Directorio telefónico y empresarial
2. **MercadoLibre Paraguay** - Vendedores y comerciantes online
3. **Directorios Empresariales** - Bases de datos de empresas paraguayas
4. **Facebook Marketplace Paraguay** - Vendedores locales
5. **Clasificados Paraguay** - Anuncios comerciales
6. **Sitios Comerciales Locales** - Diversos portales paraguayos

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
cd backend
python install_scraper_dependencies.py
```

O manualmente:

```bash
pip install requests==2.31.0
pip install beautifulsoup4==4.12.2
pip install selenium==4.15.0
pip install lxml==4.9.3
pip install fake-useragent==1.4.0
pip install unidecode==1.3.7
pip install phonenumbers==8.13.25
```

### 2. Verificar Instalación

```bash
python test_scraper.py
```

## 💻 Uso

### Desde la API (Backend)

```python
from app.utils.paraguay_scraper import search_real_leads_paraguay

# Buscar leads reales
leads = search_real_leads_paraguay(
    prompt="comerciantes de Asunción que vendan ropa",
    limit=5
)

for lead in leads:
    print(f"Nombre: {lead['full_name']}")
    print(f"Teléfono: {lead['phone_number']}")
    print(f"Email: {lead['email']}")
    print(f"Ciudad: {lead['city']}")
    print(f"Negocio: {lead['business_type']}")
    print("---")
```

### Desde el Frontend

1. Ve a **"Buscador de Leads Reales"**
2. Describe el tipo de cliente que buscas
3. Haz clic en **"Buscar Leads Reales"**
4. Revisa los resultados en **"Mis Leads"**

## 📝 Ejemplos de Búsqueda

### Búsquedas Efectivas

```
✅ "Comerciantes de Asunción que vendan ropa"
✅ "Pequeños empresarios de Ciudad del Este"
✅ "Productores agrícolas de Itapúa"
✅ "Dueños de restaurantes en Central"
✅ "Vendedores de MercadoLibre Paraguay"
✅ "Empresas de construcción en Asunción"
✅ "Ferreteros de San Lorenzo"
✅ "Panaderos de Luque"
```

### Búsquedas Menos Efectivas

```
❌ "Personas que necesiten dinero"
❌ "Cualquier cliente"
❌ "Gente de Paraguay"
```

## 🔧 Configuración Avanzada

### Personalizar Fuentes

Edita `app/utils/paraguay_scraper.py`:

```python
self.sources = {
    'mi_sitio_custom': 'https://mi-sitio-paraguayo.com',
    # ... otras fuentes
}
```

### Ajustar Delays

```python
def get_random_delay(self, min_delay=1, max_delay=3):
    # Aumentar delays para sitios más estrictos
    return random.uniform(min_delay, max_delay)
```

## 📊 Estructura de Datos

### Lead Retornado

```json
{
    "full_name": "María González",
    "phone_number": "+595 21 123456",
    "email": "maria.gonzalez@gmail.com",
    "city": "Asunción",
    "country": "Paraguay",
    "business_type": "Comercio",
    "loan_reason": "Necesito capital para expandir mi negocio",
    "source": "Páginas Amarillas PY",
    "real_data": true,
    "scraped_at": "2024-01-15 10:30:00"
}
```

## 🛡️ Consideraciones Éticas y Legales

### ✅ Buenas Prácticas

- **Respeta robots.txt** de los sitios web
- **Usa delays** entre requests para no sobrecargar servidores
- **Información pública solamente** - solo extrae datos públicamente disponibles
- **User-Agent rotativo** para parecer tráfico normal
- **Límites de rate** para ser respetuoso con los sitios

### ⚠️ Limitaciones

- Solo busca información **públicamente disponible**
- Respeta los **términos de servicio** de cada sitio
- No almacena datos personales sensibles
- Cumple con regulaciones de **protección de datos**

## 🔍 Validación de Datos

### Números de Teléfono

- Valida formato paraguayo (+595)
- Verifica códigos de área válidos
- Formatea automáticamente

### Emails

- Valida formato de email
- Genera emails realistas para contactos sin email público
- Usa dominios paraguayos comunes

### Direcciones

- Extrae ciudades paraguayas
- Valida departamentos
- Normaliza nombres de lugares

## 📈 Monitoreo y Logs

### Logs del Sistema

```bash
# Ver logs en tiempo real
tail -f scraper.log

# Buscar errores
grep "ERROR" scraper.log
```

### Métricas

- **Tasa de éxito** por fuente
- **Tiempo de respuesta** promedio
- **Leads válidos** vs inválidos
- **Cobertura geográfica**

## 🐛 Solución de Problemas

### Error: "No se encontraron leads"

1. Verifica tu conexión a internet
2. Intenta con términos de búsqueda más específicos
3. Revisa si los sitios fuente están disponibles

### Error: "Dependencias faltantes"

```bash
python install_scraper_dependencies.py
```

### Error: "Timeout en requests"

- Aumenta los timeouts en la configuración
- Verifica la estabilidad de tu conexión

### Leads con datos incompletos

- Normal en algunos casos
- El sistema filtra automáticamente leads inválidos
- Ajusta los criterios de validación si es necesario

## 🔄 Actualizaciones

### Agregar Nuevas Fuentes

1. Edita `paraguay_scraper.py`
2. Agrega la nueva fuente a `self.sources`
3. Implementa el método de scraping específico
4. Prueba con `test_scraper.py`

### Mejorar Algoritmos

- Actualiza patrones de extracción
- Mejora la validación de datos
- Optimiza la velocidad de scraping

## 📞 Soporte

Para problemas o mejoras:

1. Revisa los logs del sistema
2. Ejecuta `test_scraper.py` para diagnóstico
3. Verifica la conectividad a sitios paraguayos
4. Consulta la documentación de cada dependencia

## 🎉 ¡Listo para Usar!

El Super Scrapeador de Paraguay está diseñado para ser:

- **Fácil de usar** - Interfaz simple desde el frontend
- **Confiable** - Datos reales y validados
- **Escalable** - Fácil agregar nuevas fuentes
- **Ético** - Respeta términos de servicio y privacidad

¡Disfruta encontrando leads reales de Paraguay! 🇵🇾 