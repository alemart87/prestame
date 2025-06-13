'use client';

import { usePWA } from '../hooks/usePWA';

export default function PWAInstallButton() {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled) {
    return (
      <div className="flex items-center text-green-400 text-sm">
        <span className="mr-1">✅</span>
        <span className="hidden md:inline">App Instalada</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installApp}
      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
    >
      <span className="mr-1">📱</span>
      <span className="hidden md:inline">Instalar App</span>
      <span className="md:hidden">Instalar</span>
    </button>
  );
} 