'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-white mb-4">¡Conectado!</h1>
          <p className="text-gray-300 mb-6">
            Tu conexión a internet se ha restablecido.
          </p>
          <Link 
            href="/dashboard"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">📱</div>
        <h1 className="text-3xl font-bold text-white mb-4">Sin Conexión</h1>
        <p className="text-gray-300 mb-6">
          No hay conexión a internet. Algunas funciones pueden no estar disponibles.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Funciones Disponibles Offline:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Ver datos guardados</li>
              <li>• Navegar por páginas visitadas</li>
              <li>• Acceder a información básica</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Reintentar Conexión
          </button>
          
          <Link 
            href="/dashboard"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Ver Datos Guardados
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Tip: Esta aplicación funciona mejor con conexión a internet
        </div>
      </div>
    </div>
  );
} 