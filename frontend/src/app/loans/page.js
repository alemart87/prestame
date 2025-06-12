'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { loanService } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiUser, 
  FiTrendingUp,
  FiClock,
  FiShield,
  FiArrowRight,
  FiEye,
  FiLock
} from 'react-icons/fi';
import AppNavbar from '../../components/AppNavbar';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';

export default function LoansPage() {
  const { user, isLender, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si es prestamista autenticado, redirigir a la página de leads
    if (!authLoading && user && isLender) {
      router.push('/leads');
      return;
    }
    
    // Cargar solo estadísticas generales
    loadStats();
  }, [user, isLender, authLoading, router]);

  const loadStats = async () => {
    try {
      const statsResponse = await loanService.getLoanStats();
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency', currency: 'PYG', minimumFractionDigits: 0
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <AnimatedBackground particleCount={15}>
        <div className="flex justify-center items-center min-h-screen">
          <GlassCard className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white/80 text-lg">Cargando...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <div>
      <AppNavbar />
      <AnimatedBackground particleCount={20}>
        <div className="min-h-screen pt-20 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Mercado de Préstamos
              </motion.h1>
              <motion.p 
                className="text-white/70 text-xl max-w-3xl mx-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Conectamos prestatarios con prestamistas de manera segura y transparente
              </motion.p>
            </motion.div>

            {/* Estadísticas Públicas */}
            {stats && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {[
                  { 
                    label: 'Préstamos Totales', 
                    value: stats.total_loans, 
                    icon: FiDollarSign, 
                    gradient: 'from-green-500 to-emerald-600',
                    description: 'Solicitudes activas'
                  },
                  { 
                    label: 'Prestatarios Activos', 
                    value: stats.unique_borrowers, 
                    icon: FiUser, 
                    gradient: 'from-blue-500 to-cyan-600',
                    description: 'Usuarios verificados'
                  },
                  { 
                    label: 'Volumen Total', 
                    value: formatCurrency(stats.total_amount), 
                    icon: FiTrendingUp, 
                    gradient: 'from-purple-500 to-pink-600',
                    description: 'En solicitudes'
                  },
                  { 
                    label: 'Préstamos Financiados', 
                    value: stats.funded_loans, 
                    icon: FiClock, 
                    gradient: 'from-orange-500 to-red-600',
                    description: 'Exitosamente'
                  }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      whileHover={{ y: -5 }}
                    >
                      <GlassCard className="text-center h-full">
                        <motion.div
                          className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-4`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <p className="text-white text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                        <p className="text-white/50 text-xs mt-1">{stat.description}</p>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Sección de Acceso */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Para Prestatarios */}
              <GlassCard className="text-center">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <FiUser className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">¿Necesitas un Préstamo?</h3>
                <p className="text-white/70 mb-6">
                  Solicita financiamiento de manera rápida y segura. 
                  Nuestro sistema de scoring te ayuda a obtener las mejores condiciones.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-white/80">
                    <FiShield className="w-4 h-4 mr-2 text-green-400" />
                    <span>Evaluación con IA</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <FiShield className="w-4 h-4 mr-2 text-green-400" />
                    <span>Proceso 100% digital</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <FiShield className="w-4 h-4 mr-2 text-green-400" />
                    <span>Múltiples prestamistas</span>
                  </div>
                </div>
                <Link href="/register">
                  <motion.button
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Solicitar Préstamo</span>
                    <FiArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </GlassCard>

              {/* Para Prestamistas */}
              <GlassCard className="text-center">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <FiEye className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">¿Quieres Invertir?</h3>
                <p className="text-white/70 mb-6">
                  Accede a leads calificados de prestatarios verificados. 
                  Información detallada para tomar las mejores decisiones de inversión.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-white/80">
                    <FiLock className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Leads verificados</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <FiLock className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Scoring completo</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <FiLock className="w-4 h-4 mr-2 text-purple-400" />
                    <span>CRM integrado</span>
                  </div>
                </div>
                {user ? (
                  <Link href="/leads">
                    <motion.button
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Ver Leads</span>
                      <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <motion.button
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Registrarse como Prestamista</span>
                      <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                )}
              </GlassCard>
            </motion.div>

            {/* Aviso de Seguridad */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <GlassCard className="text-center border border-yellow-500/30">
                <FiShield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Información Protegida</h3>
                <p className="text-white/70">
                  Los datos detallados de préstamos y contactos están protegidos. 
                  Solo los prestamistas registrados con créditos activos pueden acceder a esta información.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
} 