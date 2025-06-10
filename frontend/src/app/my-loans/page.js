'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { borrowerService } from '../../services/api';
import Link from 'next/link';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiEye, 
  FiEdit,
  FiTrash2,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiTrendingUp,
  FiTarget,
  FiCreditCard,
  FiPercent,
  FiUser,
  FiFileText
} from 'react-icons/fi';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import AppNavbar from '../../components/AppNavbar';

export default function MyLoansPage() {
  const { user, isBorrower, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loanRequests, setLoanRequests] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, funded, cancelled
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && !isBorrower) {
      router.push('/dashboard');
      return;
    }

    if (user && isBorrower) {
      loadLoanRequests();
    }
  }, [user, authLoading, isBorrower, router]);

  const loadLoanRequests = async () => {
    try {
      const response = await borrowerService.getLoanRequests();
      setLoanRequests(response.data.loan_requests || []);
    } catch (err) {
      setError('Error al cargar las solicitudes de préstamo');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLoan = async (loanId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta solicitud?')) {
      return;
    }

    try {
      await borrowerService.cancelLoanRequest(loanId);
      await loadLoanRequests(); // Recargar la lista
    } catch (err) {
      setError('Error al cancelar la solicitud');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiClock className="h-5 w-5 text-blue-400" />;
      case 'funded':
        return <FiCheckCircle className="h-5 w-5 text-green-400" />;
      case 'cancelled':
        return <FiXCircle className="h-5 w-5 text-red-400" />;
      default:
        return <FiAlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'funded':
        return 'Financiada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'active':
        return 'from-blue-500 to-cyan-600';
      case 'funded':
        return 'from-green-500 to-emerald-600';
      case 'cancelled':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  const getFilterColor = (filterType) => {
    switch (filterType) {
      case 'all':
        return 'from-purple-500 to-pink-600';
      case 'active':
        return 'from-blue-500 to-cyan-600';
      case 'funded':
        return 'from-green-500 to-emerald-600';
      case 'cancelled':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  const filteredLoans = loanRequests.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

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
            <p className="text-white/80 text-lg">Cargando solicitudes...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  if (!user || !isBorrower) {
    return null;
  }

  return (
    <div>
      <AppNavbar />
      
      <AnimatedBackground particleCount={25}>
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
                  Mis Solicitudes de Préstamo
                </motion.h1>
                <motion.p 
                  className="text-white/70 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Gestiona y revisa el estado de tus solicitudes
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Link href="/loan-request">
                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Nueva Solicitud</span>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Estadísticas */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {[
                { 
                  label: 'Total', 
                  value: loanRequests.length, 
                  icon: FiFileText, 
                  gradient: 'from-purple-500 to-pink-600' 
                },
                { 
                  label: 'Activas', 
                  value: loanRequests.filter(l => l.status === 'active').length, 
                  icon: FiClock, 
                  gradient: 'from-blue-500 to-cyan-600' 
                },
                { 
                  label: 'Financiadas', 
                  value: loanRequests.filter(l => l.status === 'funded').length, 
                  icon: FiCheckCircle, 
                  gradient: 'from-green-500 to-emerald-600' 
                },
                { 
                  label: 'Canceladas', 
                  value: loanRequests.filter(l => l.status === 'cancelled').length, 
                  icon: FiXCircle, 
                  gradient: 'from-red-500 to-pink-600' 
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                >
                  <GlassCard className="text-center">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <p className="text-white text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Filtros */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <GlassCard>
                <div className="flex items-center space-x-4 mb-4">
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <FiFilter className="w-4 h-4 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white">Filtrar Solicitudes</h3>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'all', label: 'Todas', count: loanRequests.length },
                    { key: 'active', label: 'Activas', count: loanRequests.filter(l => l.status === 'active').length },
                    { key: 'funded', label: 'Financiadas', count: loanRequests.filter(l => l.status === 'funded').length },
                    { key: 'cancelled', label: 'Canceladas', count: loanRequests.filter(l => l.status === 'cancelled').length }
                  ].map((filterOption) => (
                    <motion.button
                      key={filterOption.key}
                      onClick={() => setFilter(filterOption.key)}
                      className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        filter === filterOption.key
                          ? `bg-gradient-to-r ${getFilterColor(filterOption.key)} text-white shadow-lg`
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {filterOption.label} ({filterOption.count})
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center space-x-3"
                >
                  <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de Préstamos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-6"
            >
              {filteredLoans.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <GlassCard className="text-center py-12">
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-r from-gray-500 to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FiFileText className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {filter === 'all' ? 'No tienes solicitudes de préstamo' : `No tienes solicitudes ${getStatusText(filter).toLowerCase()}s`}
                    </h3>
                    <p className="text-white/70 mb-6">
                      {filter === 'all' 
                        ? 'Crea tu primera solicitud para comenzar a obtener financiamiento'
                        : 'Cambia el filtro para ver otras solicitudes'
                      }
                    </p>
                    {filter === 'all' && (
                      <Link href="/loan-request">
                        <motion.button
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiPlus className="w-4 h-4" />
                          <span>Crear Primera Solicitud</span>
                        </motion.button>
                      </Link>
                    )}
                  </GlassCard>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {filteredLoans.map((loan, index) => (
                      <motion.div
                        key={loan.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                        layout
                      >
                        <motion.div
                          whileHover={{ scale: 1.02, y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <GlassCard className="h-full">
                            {/* Header de la tarjeta */}
                            <div className="flex items-center justify-between mb-4">
                              <motion.div
                                className={`px-4 py-2 bg-gradient-to-r ${getStatusGradient(loan.status)} rounded-xl flex items-center space-x-2`}
                                whileHover={{ scale: 1.05 }}
                              >
                                {getStatusIcon(loan.status)}
                                <span className="text-white text-sm font-medium">
                                  {getStatusText(loan.status)}
                                </span>
                              </motion.div>
                              
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiEye className="w-4 h-4 text-white" />
                                </motion.button>
                                
                                {loan.status === 'active' && (
                                  <>
                                    <motion.button
                                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FiEdit className="w-4 h-4 text-white" />
                                    </motion.button>
                                    
                                    <motion.button
                                      onClick={() => handleCancelLoan(loan.id)}
                                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-300"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FiTrash2 className="w-4 h-4 text-red-400" />
                                    </motion.button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Información principal */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white/70 text-sm">Monto Solicitado</p>
                                  <p className="text-white text-2xl font-bold">
                                    {formatCurrency(loan.amount)}
                                  </p>
                                </div>
                                <motion.div
                                  className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <FiDollarSign className="w-6 h-6 text-white" />
                                </motion.div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-white/70 text-xs">Propósito</p>
                                  <p className="text-white text-sm font-medium capitalize">
                                    {loan.purpose?.replace('_', ' ') || 'No especificado'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-white/70 text-xs">Plazo</p>
                                  <p className="text-white text-sm font-medium">
                                    {loan.term_months} meses
                                  </p>
                                </div>
                                <div>
                                  <p className="text-white/70 text-xs">Frecuencia</p>
                                  <p className="text-white text-sm font-medium capitalize">
                                    {loan.payment_frequency === 'daily' ? 'Diario' :
                                     loan.payment_frequency === 'weekly' ? 'Semanal' : 'Mensual'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-white/70 text-xs">Fecha</p>
                                  <p className="text-white text-sm font-medium">
                                    {formatDate(loan.created_at)}
                                  </p>
                                </div>
                              </div>

                              {loan.description && (
                                <div>
                                  <p className="text-white/70 text-xs mb-1">Descripción</p>
                                  <p className="text-white/90 text-sm bg-white/5 p-3 rounded-lg">
                                    {loan.description}
                                  </p>
                                </div>
                              )}

                              {loan.status === 'funded' && loan.lender && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
                                >
                                  <div className="flex items-center space-x-2">
                                    <FiUser className="w-4 h-4 text-green-400" />
                                    <p className="text-green-200 text-sm">
                                      Financiado por: {loan.lender.first_name} {loan.lender.last_name}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </GlassCard>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
} 