'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedBackground = ({ children, particleCount = 20, className = "" }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // ✅ Detectar mobile y preferencias de movimiento
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

  // ✅ Configuraciones optimizadas para mobile
  const mobileConfig = {
    particleCount: isMobile ? 8 : particleCount, // Menos partículas en mobile
    animationDuration: isMobile ? 40 : 20, // Animaciones más lentas en mobile
    blurIntensity: isMobile ? 'blur-xl' : 'blur-3xl', // Menos blur en mobile
  };

  // ✅ Animaciones simplificadas para mobile
  const getAnimationProps = (baseAnimation, mobileFallback) => {
    if (reducedMotion) return {}; // Sin animaciones si el usuario prefiere movimiento reducido
    if (isMobile) return mobileFallback;
    return baseAnimation;
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 ${className}`}>
      {/* Animated Background Elements - Optimizados */}
      <div className="absolute inset-0">
        <motion.div
          className={`absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full ${mobileConfig.blurIntensity}`}
          {...getAnimationProps(
            {
              animate: {
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              },
              transition: {
                duration: mobileConfig.animationDuration,
                repeat: Infinity,
                ease: "easeInOut"
              }
            },
            {
              animate: {
                x: [0, 50, 0], // ✅ Movimiento reducido en mobile
                y: [0, -50, 0],
                scale: [1, 1.1, 1],
              },
              transition: {
                duration: 30, // ✅ Más lento en mobile
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          )}
        />
        
        <motion.div
          className={`absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full ${mobileConfig.blurIntensity}`}
          {...getAnimationProps(
            {
              animate: {
                x: [0, -150, 0],
                y: [0, 100, 0],
                scale: [1, 0.8, 1],
              },
              transition: {
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }
            },
            {
              animate: {
                x: [0, -75, 0], // ✅ Movimiento reducido
                y: [0, 50, 0],
                scale: [1, 0.9, 1],
              },
              transition: {
                duration: 35,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          )}
        />

        {/* ✅ Orb central - Solo en desktop o con animación reducida en mobile */}
        {!isMobile && (
          <motion.div
            className={`absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full ${mobileConfig.blurIntensity}`}
            {...getAnimationProps(
              {
                animate: {
                  x: [0, 200, -200, 0],
                  y: [0, -200, 200, 0],
                  scale: [1, 1.5, 0.5, 1],
                },
                transition: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              },
              {}
            )}
          />
        )}
        
        {/* ✅ Orbs adicionales - Solo en desktop */}
        {!isMobile && (
          <>
            <motion.div
              className="absolute top-1/4 right-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl"
              animate={{
                x: [0, -80, 80, 0],
                y: [0, 80, -80, 0],
                scale: [1, 1.3, 0.7, 1],
              }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-emerald-500/15 rounded-full blur-2xl"
              animate={{
                x: [0, 120, -120, 0],
                y: [0, -60, 60, 0],
                scale: [1, 0.8, 1.4, 1],
              }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}
      </div>

      {/* Floating Particles - Optimizadas */}
      {!reducedMotion && [...Array(mobileConfig.particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, isMobile ? -50 : -100, 0], // ✅ Menos movimiento en mobile
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: isMobile ? 4 + Math.random() * 3 : 3 + Math.random() * 2, // ✅ Más lento en mobile
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Subtle grid pattern overlay - Simplificado en mobile */}
      <div 
        className={`absolute inset-0 ${isMobile ? 'opacity-3' : 'opacity-5'}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: isMobile ? '80px 80px' : '50px 50px' // ✅ Grid más grande en mobile
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