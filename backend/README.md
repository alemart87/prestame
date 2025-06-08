# Backend de Prestame

Este es el backend de la aplicación "Prestame", una plataforma que conecta personas que necesitan préstamos con prestamistas.

## Tecnologías utilizadas

- **Python**: Lenguaje de programación principal
- **Flask**: Framework web para Python
- **SQLAlchemy**: ORM para interactuar con la base de datos
- **PostgreSQL**: Base de datos relacional
- **JWT**: Para autenticación y autorización
- **Marshmallow**: Para serialización/deserialización de datos

## Estructura del proyecto

```
backend/
├── app/                    # Paquete principal de la aplicación
│   ├── models/             # Modelos de datos (SQLAlchemy)
│   ├── routes/             # Rutas/endpoints de la API
│   ├── schemas/            # Esquemas para serialización (Marshmallow)
│   └── utils/              # Utilidades y funciones auxiliares
├── .env                    # Variables de entorno
├── requirements.txt        # Dependencias del proyecto
└── run.py                  # Punto de entrada para ejecutar la aplicación
```

## Instalación

1. Clona el repositorio
2. Crea un entorno virtual: `python -m venv venv`
3. Activa el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instala las dependencias: `pip install -r requirements.txt`
5. Crea un archivo `.env` con las variables de entorno necesarias (ver `.env.example`)

## Ejecución

Para ejecutar el servidor en modo desarrollo:

```bash
python run.py
```

## API Endpoints

### Autenticación

- `POST /api/auth/register`: Registrar un nuevo usuario
- `POST /api/auth/login`: Iniciar sesión
- `GET /api/auth/profile`: Obtener perfil del usuario autenticado
- `PUT /api/auth/profile`: Actualizar perfil del usuario autenticado

### Prestatarios

- `POST /api/borrowers/loan-requests`: Crear una solicitud de préstamo
- `GET /api/borrowers/loan-requests`: Obtener solicitudes de préstamo del prestatario
- `GET /api/borrowers/loan-requests/<id>`: Obtener una solicitud de préstamo específica
- `PUT /api/borrowers/loan-requests/<id>`: Actualizar una solicitud de préstamo
- `DELETE /api/borrowers/loan-requests/<id>`: Eliminar una solicitud de préstamo

### Prestamistas

- `GET /api/lenders/leads`: Obtener leads disponibles para el prestamista
- `GET /api/lenders/leads/<id>`: Obtener un lead específico
- `POST /api/lenders/leads/<id>/contact`: Marcar un lead como contactado
- `GET /api/lenders/packages`: Obtener paquetes de leads disponibles
- `POST /api/lenders/packages/purchase`: Comprar un paquete de leads

### Préstamos

- `GET /api/loans/public`: Obtener préstamos disponibles (pública)
- `GET /api/loans/stats`: Obtener estadísticas de préstamos (pública)
- `GET /api/loans/search`: Buscar préstamos por criterios

## Modelos de datos

### User (Usuario)

Representa a un usuario registrado en la plataforma, ya sea prestatario o prestamista.

### BorrowerProfile (Perfil de Prestatario)

Perfil específico para usuarios que solicitan préstamos, con información financiera y scoring.

### LenderProfile (Perfil de Prestamista)

Perfil específico para usuarios que ofrecen préstamos, con preferencias y paquetes de leads.

### LoanRequest (Solicitud de Préstamo)

Representa una solicitud de préstamo creada por un prestatario.

### Lead (Lead)

Conexión entre una solicitud de préstamo y un prestamista potencial. 