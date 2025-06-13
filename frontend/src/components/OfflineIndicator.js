'use client';

import { usePWA } from '../hooks/usePWA';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm font-semibold z-50">
      <div className="flex items-center justify-center">
        <span className="mr-2">📶</span>
        Sin conexión - Funcionando en modo offline
      </div>
    </div>
  );
} 