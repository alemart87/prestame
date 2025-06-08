# Prestame - Plataforma de Préstamos P2P 🏦

Una plataforma moderna de préstamos peer-to-peer que conecta prestamistas con solicitantes de préstamos en Paraguay, con un sistema avanzado de búsqueda de leads reales usando web scraping.

## 🚀 Características Principales

### Para Prestamistas:
- **Búsqueda de Leads Reales con IA** 🤖
  - Scraping avanzado de LinkedIn Paraguay, Facebook Business, MercadoLibre
  - Datos reales de empresas y comerciantes paraguayos
  - Sistema de créditos para búsquedas
- **Panel de Administración** 📊
  - Gestión de leads y solicitudes
  - Estadísticas detalladas
  - Sistema de paquetes y suscripciones

### Para Solicitantes:
- **Solicitudes de Préstamo** 💰
  - Formulario intuitivo y completo
  - Sistema de scoring automático (Score Katupyry)
  - Seguimiento en tiempo real

### Para SuperAdmin:
- **Panel de Control Completo** 🛡️
  - Gestión de usuarios y créditos
  - Estadísticas del sistema
  - Asignación de leads automática

## 🛠️ Tecnologías

### Backend:
- **Python 3.12** con **Flask**
- **SQLAlchemy** (ORM)
- **Flask-JWT-Extended** (Autenticación)
- **Flask-Migrate** (Migraciones)
- **Selenium** (Web Scraping)
- **PostgreSQL** (Base de datos)
- **Stripe** (Pagos)

### Frontend:
- **Next.js 14** con **React 18**
- **Tailwind CSS** (Estilos)
- **React Hot Toast** (Notificaciones)
- **Axios** (HTTP Client)
- **React Icons** (Iconografía)

## 📁 Estructura del Proyecto

```
prestame/
├── backend/                 # API Flask
│   ├── app/
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routes/         # Endpoints de la API
│   │   ├── schemas/        # Esquemas de validación
│   │   └── utils/          # Utilidades y helpers
│   ├── migrations/         # Migraciones de base de datos
│   └── run.py             # Punto de entrada del servidor
├── frontend/               # Aplicación Next.js
│   ├── src/
│   │   ├── app/           # Páginas y rutas
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Context providers
│   │   ├── services/      # Servicios de API
│   │   └── styles/        # Estilos globales
│   └── public/            # Archivos estáticos
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos:
- Python 3.12+
- Node.js 18+
- PostgreSQL 12+
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/prestame.git
cd prestame
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

**Variables de entorno requeridas (.env):**
```env
DATABASE_URL=postgresql://usuario:password@localhost/prestame
JWT_SECRET_KEY=tu_clave_secreta_muy_segura
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FLASK_ENV=development
```

```bash
# Inicializar base de datos
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Crear usuario SuperAdmin
python create_superadmin.py

# Iniciar servidor
python run.py
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

**Variables de entorno requeridas (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

```bash
# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Uso

### Acceso al Sistema:

1. **SuperAdmin:**
   - Email: `admin@prestame.com.py`
   - Password: `admin123`
   - Panel: `/admin/dashboard`

2. **Registro de Usuarios:**
   - Prestamistas: `/register` (seleccionar "Prestamista")
   - Solicitantes: `/register` (seleccionar "Solicitante")

### Funcionalidades Principales:

#### Para Prestamistas:
1. **Buscar Leads Reales:** `/ai-lead-finder`
   - Describe el tipo de cliente que buscas
   - El sistema busca en sitios paraguayos reales
   - Obtén contactos con teléfonos y emails

2. **Ver Leads:** `/leads`
   - Revisa todos tus leads obtenidos
   - Contacta directamente a los clientes

3. **Dashboard:** `/dashboard`
   - Estadísticas de tus búsquedas
   - Créditos disponibles

#### Para Solicitantes:
1. **Solicitar Préstamo:** `/loan-request`
   - Completa el formulario detallado
   - Obtén tu Score Katupyry automáticamente

2. **Mis Préstamos:** `/my-loans`
   - Seguimiento de tus solicitudes

#### Para SuperAdmin:
1. **Panel de Admin:** `/admin/dashboard`
   - Gestionar usuarios
   - Asignar créditos de búsqueda
   - Ver estadísticas del sistema

## 🤖 Sistema de Scraping Avanzado

El sistema incluye un scraper avanzado que busca datos reales en:

- **LinkedIn Paraguay** - Perfiles de empresarios
- **Facebook Business Pages** - Páginas de negocios
- **MercadoLibre Paraguay** - Vendedores activos
- **Directorios Empresariales** - Listados comerciales
- **Clasificados ABC/Última Hora** - Anuncios comerciales

### Características del Scraper:
- ✅ Datos reales y actualizados
- ✅ Validación automática de información
- ✅ Teléfonos paraguayos válidos (+595)
- ✅ Emails verificados
- ✅ Información de ubicación
- ✅ Hasta 15 leads por búsqueda

## 💳 Sistema de Créditos

- **1 crédito = 1 búsqueda** de leads reales
- Los SuperAdmin pueden asignar créditos a prestamistas
- Sistema de paquetes con Stripe (próximamente)

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Validación de datos con esquemas
- Protección CORS configurada
- Variables de entorno para datos sensibles
- Encriptación de contraseñas con bcrypt

## 📊 Base de Datos

### Modelos Principales:
- **User** - Usuarios del sistema
- **LenderProfile** - Perfiles de prestamistas
- **BorrowerProfile** - Perfiles de solicitantes
- **LoanRequest** - Solicitudes de préstamo
- **Lead** - Leads generados por IA

## 🚀 Despliegue

### Producción:
1. Configurar base de datos PostgreSQL
2. Configurar variables de entorno de producción
3. Ejecutar migraciones: `flask db upgrade`
4. Construir frontend: `npm run build`
5. Configurar servidor web (Nginx + Gunicorn)

### Variables de Entorno de Producción:
```env
FLASK_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=clave_super_segura_en_produccion
STRIPE_SECRET_KEY=sk_live_...
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador:** Rafael Martinez
- **Email:** alemart8723@gmail.com
- **Proyecto:** [https://github.com/tu-usuario/prestame](https://github.com/tu-usuario/prestame)

## 🙏 Agradecimientos

- Comunidad de desarrolladores de Paraguay
- Librerías y frameworks de código abierto utilizados
- Beta testers y usuarios iniciales

 **Email**: superadmin@prestame.com
- **Password**: SuperAdmin123!

**¡Prestame - Conectando oportunidades financieras en Paraguay! 🇵🇾**