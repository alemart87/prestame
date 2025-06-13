'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedBackground = ({ children, particleCount = 20, className = "" }) => {
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

  // ✅ VERSIÓN MOBILE: Solo gradiente estático + 1 elemento sutil
  if (isMobile || reducedMotion) {
    return (
      <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 ${className}`}>
        {/* Solo 1 orb estático en mobile */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern muy sutil */}
        <div 
          className="absolute inset-0 opacity-2"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // ✅ VERSIÓN DESKTOP: Efectos completos pero optimizados
  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 ${className}`}>
      {/* Animated Background Elements - Solo desktop */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25, // ✅ Más lento para mejor performance
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 30, // ✅ Más lento
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Orb central - Animación más simple */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 20, // ✅ Animación más simple
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Particles - Reducidas drásticamente */}
      {[...Array(6)].map((_, i) => ( // ✅ Solo 6 partículas vs 20
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${20 + i * 15}%`, // ✅ Posiciones fijas vs random
            top: `${20 + i * 10}%`,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + i, // ✅ Duración escalonada
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Grid pattern sutil */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground; 