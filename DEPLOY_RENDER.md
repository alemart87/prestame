# 🚀 Guía de Despliegue en Render.com

Esta guía te ayudará a desplegar tu aplicación Prestame en Render.com usando Docker.

## 📋 Prerrequisitos

1. **Cuenta en Render.com** - [Registrarse gratis](https://render.com)
2. **Repositorio en GitHub** - Tu código debe estar en GitHub
3. **Claves de Stripe** - Para pagos (modo test o producción)

## 🗄️ Paso 1: Crear Base de Datos PostgreSQL

1. Ve a tu dashboard de Render
2. Haz clic en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name**: `prestame-db`
   - **Database**: `prestame`
   - **User**: `prestame_user`
   - **Region**: Elige la más cercana
   - **Plan**: Free (para desarrollo)
4. Haz clic en **"Create Database"**
5. **¡IMPORTANTE!** Guarda la **External Database URL** que aparecerá

## 🔧 Paso 2: Desplegar Backend (API Flask)

1. En tu dashboard, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - **Name**: `prestame-backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Plan**: Free

### Variables de Entorno para Backend:

```env
# Base de datos
DATABASE_URL=<URL_DE_TU_BASE_DE_DATOS_POSTGRESQL>

# Flask
FLASK_ENV=production
FLASK_APP=run.py
PYTHONPATH=/app

# JWT (Render puede generar esto automáticamente)
JWT_SECRET_KEY=<CLAVE_SECRETA_MUY_SEGURA>

# Stripe
STRIPE_SECRET_KEY=sk_test_... # o sk_live_ para producción
STRIPE_PUBLISHABLE_KEY=pk_test_... # o pk_live_ para producción

# Puerto
PORT=5000
```

4. En **"Advanced"** → **"Health Check Path"**: `/api/health`
5. Haz clic en **"Create Web Service"**

## 🌐 Paso 3: Desplegar Frontend (Next.js)

1. Haz clic en **"New +"** → **"Web Service"**
2. Conecta el mismo repositorio
3. Configura:
   - **Name**: `prestame-frontend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Docker Context**: `./frontend`
   - **Plan**: Free

### Variables de Entorno para Frontend:

```env
# Next.js
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# API Backend
NEXT_PUBLIC_API_URL=https://prestame-backend.onrender.com

# Stripe (clave pública)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # o pk_live_
```

4. Haz clic en **"Create Web Service"**

## 🔄 Paso 4: Inicializar Base de Datos

Una vez que el backend esté desplegado:

1. Ve al dashboard del backend en Render
2. Abre la **"Shell"** (terminal)
3. Ejecuta:
```bash
python init_production.py
```

Esto creará:
- ✅ Todas las tablas de la base de datos
- ✅ Usuario SuperAdmin con credenciales:
  - **Email**: `superadmin@prestame.com`
  - **Password**: `SuperAdmin123!`

## 🌍 Paso 5: Configurar Dominios Personalizados (Opcional)

### Para el Backend:
1. Ve a tu servicio backend → **"Settings"** → **"Custom Domains"**
2. Agrega: `api.tudominio.com`

### Para el Frontend:
1. Ve a tu servicio frontend → **"Settings"** → **"Custom Domains"**
2. Agrega: `tudominio.com` y `www.tudominio.com`

### Actualizar Variables de Entorno:
Si usas dominio personalizado, actualiza en el frontend:
```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com
```

## 🔐 Paso 6: Configurar Variables de Entorno Sensibles

### En Render Dashboard:

1. **Backend** → **"Environment"**:
   ```env
   JWT_SECRET_KEY=clave_super_segura_de_64_caracteres_minimo_para_produccion
   STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_de_stripe_real
   DATABASE_URL=postgresql://usuario:password@host:puerto/database
   ```

2. **Frontend** → **"Environment"**:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_de_stripe
   NEXT_PUBLIC_API_URL=https://prestame-backend.onrender.com
   ```

## 📊 Paso 7: Verificar Despliegue

### URLs de tu aplicación:
- **Frontend**: `https://prestame-frontend.onrender.com`
- **Backend**: `https://prestame-backend.onrender.com`
- **Health Check**: `https://prestame-backend.onrender.com/api/health`

### Probar funcionalidades:
1. **Registro de usuario**: `/register`
2. **Login SuperAdmin**: `/admin/dashboard`
   - Email: `superadmin@prestame.com`
   - Password: `SuperAdmin123!`
3. **API Health**: Debe devolver `{"status": "healthy"}`

## 🔧 Comandos Útiles

### Ver logs en tiempo real:
```bash
# En la Shell de Render
tail -f /var/log/app.log
```

### Reiniciar servicios:
- Ve al dashboard → **"Manual Deploy"** → **"Deploy Latest Commit"**

### Ejecutar migraciones:
```bash
# En la Shell del backend
flask db upgrade
```

### Crear nuevo SuperAdmin:
```bash
# En la Shell del backend
python init_production.py
```

## 🚨 Solución de Problemas

### Backend no inicia:
1. Verifica que `DATABASE_URL` esté configurada
2. Revisa los logs en Render dashboard
3. Asegúrate de que `JWT_SECRET_KEY` esté configurada

### Frontend no conecta con Backend:
1. Verifica `NEXT_PUBLIC_API_URL` en variables de entorno
2. Asegúrate de que el backend esté funcionando
3. Revisa CORS en el backend

### Base de datos no conecta:
1. Verifica que la URL de PostgreSQL sea correcta
2. Asegúrate de que la base de datos esté activa
3. Ejecuta `python init_production.py` para inicializar

### Selenium no funciona:
- Los Dockerfiles ya incluyen Chrome y ChromeDriver
- Si hay problemas, verifica los logs del scraper

## 📈 Monitoreo

### Métricas disponibles en Render:
- **CPU Usage**
- **Memory Usage**
- **Response Time**
- **Error Rate**

### Logs importantes:
- **Backend**: Flask logs, errores de base de datos
- **Frontend**: Next.js build logs, errores de runtime

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz push a tu repositorio de GitHub
2. Render detectará automáticamente los cambios
3. Se ejecutará un nuevo build y deploy automáticamente

### Deploy manual:
- Ve al dashboard → **"Manual Deploy"** → **"Deploy Latest Commit"**

## 💰 Costos

### Plan Free (Recomendado para desarrollo):
- **Backend**: Free (750 horas/mes)
- **Frontend**: Free (750 horas/mes)  
- **PostgreSQL**: Free (1GB storage)

### Plan Paid (Para producción):
- **Backend**: $7/mes (siempre activo)
- **Frontend**: $7/mes (siempre activo)
- **PostgreSQL**: $7/mes (10GB storage)

## 🎉 ¡Listo!

Tu aplicación Prestame ahora está desplegada en Render.com con:

- ✅ **Backend Flask** con PostgreSQL
- ✅ **Frontend Next.js** optimizado
- ✅ **Base de datos** inicializada
- ✅ **SuperAdmin** creado
- ✅ **SSL/HTTPS** automático
- ✅ **Monitoreo** incluido
- ✅ **Backups** automáticos (PostgreSQL)

### URLs finales:
- **App**: `https://prestame-frontend.onrender.com`
- **API**: `https://prestame-backend.onrender.com`
- **Admin**: `https://prestame-frontend.onrender.com/admin/dashboard`

¡Tu plataforma de préstamos P2P está lista para recibir usuarios! 🚀 