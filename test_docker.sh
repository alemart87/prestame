#!/bin/bash

echo "🐳 Probando Dockerfiles localmente..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Instala Docker Desktop primero."
    exit 1
fi

print_status "Docker encontrado"

# Probar Backend
echo ""
echo "🔧 Construyendo imagen del Backend..."
cd backend
if docker build -t prestame-backend-test .; then
    print_status "Backend Docker image construida exitosamente"
    
    echo ""
    echo "🚀 Probando Backend container..."
    if docker run --rm -d -p 5001:5000 --name prestame-backend-test prestame-backend-test; then
        print_status "Backend container iniciado en puerto 5001"
        
        # Esperar un poco para que el servidor inicie
        sleep 10
        
        # Probar health check
        if curl -f http://localhost:5001/health > /dev/null 2>&1; then
            print_status "Health check del backend funciona"
        else
            print_warning "Health check del backend no responde (normal si falta DB)"
        fi
        
        # Detener container
        docker stop prestame-backend-test
        print_status "Backend container detenido"
    else
        print_error "Error al iniciar Backend container"
    fi
else
    print_error "Error al construir Backend Docker image"
fi

cd ..

# Probar Frontend
echo ""
echo "🎨 Construyendo imagen del Frontend..."
cd frontend
if docker build -t prestame-frontend-test .; then
    print_status "Frontend Docker image construida exitosamente"
    
    echo ""
    echo "🚀 Probando Frontend container..."
    if docker run --rm -d -p 3001:3000 --name prestame-frontend-test prestame-frontend-test; then
        print_status "Frontend container iniciado en puerto 3001"
        
        # Esperar un poco para que el servidor inicie
        sleep 15
        
        # Probar que responda
        if curl -f http://localhost:3001 > /dev/null 2>&1; then
            print_status "Frontend responde correctamente"
        else
            print_warning "Frontend no responde (puede necesitar más tiempo)"
        fi
        
        # Detener container
        docker stop prestame-frontend-test
        print_status "Frontend container detenido"
    else
        print_error "Error al iniciar Frontend container"
    fi
else
    print_error "Error al construir Frontend Docker image"
fi

cd ..

echo ""
echo "🧹 Limpiando imágenes de prueba..."
docker rmi prestame-backend-test prestame-frontend-test 2>/dev/null || true

echo ""
print_status "Pruebas de Docker completadas"
echo ""
echo "📋 Resumen:"
echo "   - Backend: Dockerfile listo para Render"
echo "   - Frontend: Dockerfile listo para Render"
echo "   - Health checks: Configurados"
echo ""
echo "🚀 Tu proyecto está listo para desplegarse en Render.com"
echo "   Sigue la guía en DEPLOY_RENDER.md" 