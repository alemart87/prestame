'use client';

import { usePWA } from '../hooks/usePWA';

export default function InstallButton() {
  const { isInstallable, isInstalled, installApp } = usePWA();

  const handleInstall = async () => {
    if (isInstallable) {
      await installApp();
    } else {
      // Mostrar instrucciones manuales
      alert('Para instalar la app:\n\n1. En Chrome: Busca el ícono ⊕ en la barra de direcciones\n2. O ve al menú (⋮) → "Instalar Prestame..."\n3. En móvil: Menú → "Instalar aplicación"');
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center text-green-400 text-sm bg-green-50 px-3 py-1 rounded-full">
        <span className="mr-1">✅</span>
        <span>App Instalada</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
    >
      <span className="mr-1">📱</span>
      <span>Instalar App</span>
    </button>
  );
} 