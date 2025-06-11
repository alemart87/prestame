'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { borrowerService, lenderService, loanService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiCreditCard,
  FiEye,
  FiPlus,
  FiPackage,
  FiRefreshCw,
  FiStar,
  FiTarget,
  FiArrowRight,
  FiActivity,
  FiBarChart
} from 'react-icons/fi';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import AppNavbar from '../../components/AppNavbar';

export default function DashboardPage() {
  const { user, profile, isBorrower, isLender, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      if (isBorrower) {
        const [loanRequests, stats] = await Promise.all([
          borrowerService.getLoanRequests(),
          loanService.getLoanStats()
        ]);
        
        setDashboardData({
          loanRequests: loanRequests.data.loan_requests,
          stats: stats.data
        });
      } else if (isLender) {
        const [leads, packages, stats] = await Promise.all([
          lenderService.getLeads(),
          lenderService.getPackages(),
          loanService.getLoanStats()
        ]);
        
        setDashboardData({
          leads: leads.data.leads,
          packages: packages.data.packages,
          stats: stats.data
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
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
            <p className="text-white/80 text-lg">Cargando dashboard...</p>
          </GlassCard>
      </div>
      </AnimatedBackground>
    );
  }

  if (!user) {
    return null;
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
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
            >
        <div>
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
            ¡Hola, {user.first_name}! 👋
                </motion.h1>
                <motion.p 
                  className="text-white/70 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
            {isBorrower ? 'Gestiona tus solicitudes de préstamo' : 'Revisa tus leads y oportunidades'}
                </motion.p>
        </div>
        
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 lg:mt-0 flex items-center space-x-4"
              >
        {profile && isBorrower && (
                  <GlassCard className="text-center">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-r ${getScoreColor(profile.score || 0)} rounded-2xl flex items-center justify-center`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiStar className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="text-left">
                        <p className="text-white/70 text-sm">Score Katupyry</p>
                        <p className="text-white text-2xl font-bold">{profile.score || 0}</p>
                      </div>
          </div>
                  </GlassCard>
        )}
        
        {isLender && (
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={refreshing ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                      >
                        <FiRefreshCw className="w-4 h-4" />
                      </motion.div>
                      <span>Actualizar</span>
                    </motion.button>
                    
                    <GlassCard className="text-center">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <FiCreditCard className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="text-left">
                          <p className="text-white/70 text-sm">Créditos</p>
                          <p className="text-white text-xl font-bold">{profile?.ai_search_credits || 0}</p>
            </div>
                      </div>
                    </GlassCard>
          </div>
        )}
              </motion.div>
            </motion.div>

      {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isBorrower && (
          <>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiCreditCard className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                {dashboardData?.loanRequests?.length || 0}
              </h3>
                      <p className="text-white/70">Mis Solicitudes</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiDollarSign className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                {formatCurrency(
                  dashboardData?.loanRequests?.reduce((sum, loan) => sum + loan.amount, 0) || 0
                )}
              </h3>
                      <p className="text-white/70">Monto Total Solicitado</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300">
                      <motion.div
                        className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${getScoreColor(profile?.score || 0)} rounded-2xl mb-4`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiTrendingUp className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                {profile?.score || 0}
              </h3>
                      <p className="text-white/70">Score Katupyry</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiUsers className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                {dashboardData?.stats?.total_loans || 0}
              </h3>
                      <p className="text-white/70">Préstamos en la Plataforma</p>
                    </GlassCard>
                  </motion.div>
          </>
        )}

        {isLender && (
          <>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiUsers className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                {dashboardData?.leads?.length || 0}
              </h3>
                      <p className="text-white/70">Leads Disponibles</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300 border-green-500/30">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiCreditCard className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-green-300 mb-2">
                {profile?.ai_search_credits || 0}
              </h3>
                      <p className="text-green-200 font-medium">Créditos de Búsqueda</p>
                      <p className="text-green-300/70 text-xs mt-1">Para buscar leads reales</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiPackage className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                {profile?.current_package || 'Básico'}
              </h3>
                      <p className="text-white/70">Paquete Actual</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard className="text-center group hover:bg-white/15 transition-all duration-300">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiBarChart className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                {formatCurrency(dashboardData?.stats?.total_amount || 0)}
              </h3>
                      <p className="text-white/70">Monto Total en Plataforma</p>
                    </GlassCard>
                  </motion.div>
          </>
        )}
      </div>

      {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isBorrower && (
          <>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                  >
                    <GlassCard>
                      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                        <FiTarget className="mr-3 text-blue-400" />
                        Acciones Rápidas
                      </h3>
                      <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/loan-request"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 group"
                >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <FiPlus className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Nueva Solicitud</p>
                                <p className="text-white/60 text-sm">Solicita un nuevo préstamo</p>
                              </div>
                            </div>
                            <FiArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                            href="/my-loans"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 group"
                >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <FiEye className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Ver Mis Préstamos</p>
                                <p className="text-white/60 text-sm">Gestiona tus préstamos activos</p>
                              </div>
                            </div>
                            <FiArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/how-it-works"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <FiActivity className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Mejorar Score</p>
                                <p className="text-white/60 text-sm">Aprende a aumentar tu puntaje</p>
              </div>
            </div>
                            <FiArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </Link>
                        </motion.div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    <GlassCard>
                      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                        <FiCreditCard className="mr-3 text-green-400" />
                        Mis Solicitudes Recientes
                      </h3>
                      <div className="space-y-4">
                        {dashboardData?.loanRequests?.slice(0, 3).map((loan, index) => (
                          <motion.div
                            key={loan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl"
                          >
                            <div className="flex items-center justify-between">
                    <div>
                                <p className="text-white font-medium">{formatCurrency(loan.amount)}</p>
                                <p className="text-white/60 text-sm">{loan.purpose}</p>
                    </div>
                              <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  loan.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                  loan.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                  'bg-red-500/20 text-red-300'
                    }`}>
                      {loan.status === 'pending' ? 'Pendiente' :
                       loan.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>
                            </div>
                          </motion.div>
                        )) || (
                          <div className="text-center py-8">
                            <p className="text-white/60">No tienes solicitudes aún</p>
                            <Link
                              href="/loan-request"
                              className="text-blue-400 hover:text-blue-300 font-medium mt-2 inline-block"
                            >
                              Crear tu primera solicitud →
                            </Link>
                          </div>
                )}
              </div>
                    </GlassCard>
                  </motion.div>
          </>
        )}

        {isLender && (
          <>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                  >
                    <GlassCard>
                      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                        <FiTarget className="mr-3 text-blue-400" />
                        Acciones Rápidas
                      </h3>
                      <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/leads"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 group"
                >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <FiUsers className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Ver Leads</p>
                                <p className="text-white/60 text-sm">Explora oportunidades de préstamo</p>
                              </div>
                            </div>
                            <FiArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                            href="/ai-lead-finder"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 group"
                >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <FiActivity className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Búsqueda IA</p>
                                <p className="text-white/60 text-sm">Encuentra leads con inteligencia artificial</p>
                              </div>
                            </div>
                            <FiArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/subscriptions"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Suscripciones</p>
                                <p className="text-white/60 text-sm">Gestiona tu plan y créditos</p>
              </div>
            </div>
                            <FiArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </Link>
                        </motion.div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    <GlassCard>
                      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                        <FiUsers className="mr-3 text-green-400" />
                        Leads Recientes
                      </h3>
                      <div className="space-y-4">
                        {dashboardData?.leads?.slice(0, 3).map((lead, index) => (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl"
                          >
                            <div className="flex items-center justify-between">
                    <div>
                                <p className="text-white font-medium">{formatCurrency(lead.amount)}</p>
                                <p className="text-white/60 text-sm">{lead.purpose}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white/80 text-sm">Score: {lead.score}</p>
                                <p className="text-white/60 text-xs">{lead.city}</p>
                              </div>
                    </div>
                          </motion.div>
                        )) || (
                          <div className="text-center py-8">
                            <p className="text-white/60">No hay leads disponibles</p>
                            <Link
                              href="/leads"
                              className="text-blue-400 hover:text-blue-300 font-medium mt-2 inline-block"
                            >
                              Explorar leads →
                            </Link>
                  </div>
                )}
              </div>
                    </GlassCard>
                  </motion.div>
          </>
        )}
            </div>
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
} 