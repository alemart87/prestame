'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(true);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  const handleInstall = async () => {
    const installed = await installApp();
    if (!installed) {
      // Si no se pudo instalar automáticamente, mostrar instrucciones manuales
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Mostrar instrucciones manuales siempre como fallback
  const showManualInstall = () => {
    setShowManualInstructions(true);
  };

  const ManualInstructions = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          📱 Instalar Prestame como App
        </h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔍 Busca el ícono de instalación:</h4>
            <p className="text-blue-700">En la barra de direcciones de Chrome, busca un ícono de instalación (⊕ o 📱) al lado de la URL.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">En Chrome (Desktop):</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Busca el ícono ⊕ en la barra de direcciones</li>
              <li>O ve al menú (⋮) → "Instalar Prestame..."</li>
              <li>Haz clic en "Instalar"</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">En Chrome (Android):</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Toca el menú (⋮) en la esquina superior derecha</li>
              <li>Selecciona "Instalar aplicación" o "Agregar a pantalla de inicio"</li>
              <li>Confirma la instalación</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">En Safari (iOS):</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Toca el botón de compartir (□↗)</li>
              <li>Desplázate y selecciona "Agregar a pantalla de inicio"</li>
              <li>Toca "Agregar"</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">En Edge:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Busca el ícono de aplicación en la barra de direcciones</li>
              <li>O ve al menú (⋯) → "Aplicaciones" → "Instalar este sitio como aplicación"</li>
            </ol>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-1">✨ Beneficios de instalar:</h4>
            <ul className="text-green-700 text-xs space-y-1">
              <li>• Acceso directo desde tu escritorio/pantalla de inicio</li>
              <li>• Funciona sin conexión a internet</li>
              <li>• Notificaciones push</li>
              <li>• Experiencia como app nativa</li>
              <li>• Más rápido y eficiente</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-6">
          <button
            onClick={() => setShowManualInstructions(false)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
          <button
            onClick={() => {
              setShowManualInstructions(false);
              setShowPrompt(false);
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            No mostrar más
          </button>
        </div>
      </div>
    </div>
  );

  if (showManualInstructions) {
    return <ManualInstructions />;
  }

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center text-sm">
          <span className="mr-2">✅</span>
          ¡App instalada correctamente!
        </div>
      </div>
    );
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      {/* Prompt principal */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:bottom-6 md:right-6 md:left-auto md:w-96">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-5 text-white border border-white/20 backdrop-blur-sm animate-slide-up">
          <div className="flex items-start space-x-4">
            <div className="text-4xl animate-bounce">📱</div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2 flex items-center">
                ¡Instala Prestame! 
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">PWA</span>
              </h3>
              <div className="text-sm opacity-90 mb-4 space-y-1">
                <div className="flex items-center">
                  <span className="mr-2">⚡</span>
                  <span>Acceso instantáneo desde tu pantalla de inicio</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📶</span>
                  <span>Funciona sin conexión a internet</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🔔</span>
                  <span>Notificaciones de nuevas oportunidades</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {isInstallable ? (
                  <button
                    onClick={handleInstall}
                    className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <span className="mr-1">✨</span>
                    Instalar Automáticamente
                  </button>
                ) : null}
                
                <button
                  onClick={showManualInstall}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm hover:bg-white/30 transition-all duration-200 border border-white/30 flex items-center justify-center"
                >
                  <span className="mr-1">📖</span>
                  Ver Instrucciones de Instalación
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="text-white/70 hover:text-white text-xs transition-all"
                >
                  Ahora no
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white text-2xl leading-none p-1 hover:bg-white/10 rounded-full transition-all w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Botón flotante permanente */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={showManualInstall}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 animate-pulse"
          title="Instalar como aplicación"
        >
          📱
        </button>
      </div>
    </>
  );
} 