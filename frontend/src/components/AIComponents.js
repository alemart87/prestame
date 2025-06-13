'use client';

import { useEffect, useState } from 'react';

// ✅ BOTÓN DE IA SCORING
export const AIScoreButton = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <a
          href="/how-it-works"
          className="group flex items-center bg-white hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 md:px-5"
        >
          {/* Icono */}
          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-2 md:mr-3">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="text-left">
            <div className="font-semibold text-xs md:text-sm">IA Scoring</div>
            <div className="text-xs text-gray-600 hidden md:block">Mide tu score</div>
          </div>
        </a>
        
        {/* Badge "NUEVO" */}
        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs font-bold px-1 py-0.5 md:px-2 md:py-1 rounded-full animate-pulse">
          <span className="hidden md:inline">NUEVO</span>
          <span className="md:hidden">!</span>
        </div>
      </div>
    </div>
  );
};

// ✅ EFECTO WOW DE IA
export const AIWowEffect = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const checkReducedMotion = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkMobile();
    checkReducedMotion();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Si es mobile o prefiere movimiento reducido, efectos mínimos
  if (isMobile || reducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {/* Solo 3 partículas sutiles en mobile */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 25}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: '4s',
              }}
            />
          ))}
        </div>

        {/* Solo 1 onda sutil */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-cyan-400/10 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      </div>
    );
  }

  // ✅ Efectos completos solo en desktop
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Partículas flotantes de IA */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Ondas de energía IA */}
      <div className="absolute top-1/4 left-1/4 w-24 h-24 border border-cyan-400/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/3 right-1/3 w-16 h-16 border border-purple-400/20 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />

      {/* Líneas neurales simplificadas */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path
          d="M100,200 Q300,100 500,200"
          stroke="url(#neuralGradient)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
          style={{ animationDuration: '6s' }}
        />
      </svg>

      {/* Texto flotante */}
      <div className="absolute top-20 right-20 opacity-10">
        <div className="text-cyan-400 text-xs font-mono animate-pulse" style={{ animationDuration: '4s' }}>
          IA SCORING...
        </div>
      </div>
    </div>
  );
}; 