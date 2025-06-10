'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loanService } from '../../services/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiUser, 
  FiFilter,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiChevronDown,
  FiX
} from 'react-icons/fi';
import AppNavbar from '../../components/AppNavbar';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import ScoreDisplay from '../../components/ScoreDisplay';

export default function LoansPage() {
  const { user, isLender } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    purpose: '',
    paymentFrequency: '',
    minScore: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansResponse, statsResponse] = await Promise.all([
        loanService.getPublicLoans(currentPage, 12),
        loanService.getLoanStats()
      ]);
      
      setLoans(loansResponse.data.loan_requests || []);
      setTotalPages(loansResponse.data.total_pages || 1);
      setStats(statsResponse.data);
    } catch (err) {
      setError('Error al cargar los préstamos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const { minAmount, maxAmount, purpose, paymentFrequency, minScore, search } = filters;
    if (minAmount && loan.amount < parseFloat(minAmount)) return false;
    if (maxAmount && loan.amount > parseFloat(maxAmount)) return false;
    if (purpose && loan.purpose !== purpose) return false;
    if (paymentFrequency && loan.payment_frequency !== paymentFrequency) return false;
    if (minScore && (loan.borrower_score || 0) < parseFloat(minScore)) return false;
    if (search) {
      const searchTerm = search.toLowerCase();
      if (
        !loan.purpose?.toLowerCase().includes(searchTerm) &&
        !loan.description?.toLowerCase().includes(searchTerm)
      ) return false;
    }
    return true;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minAmount: '', maxAmount: '', purpose: '', 
      paymentFrequency: '', minScore: '', search: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency', currency: 'PYG', minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const purposes = [
    'Negocio', 'Educación', 'Salud', 'Vivienda', 'Vehículo', 
    'Consolidación de deudas', 'Emergencia', 'Otro'
  ];

  if (loading && loans.length === 0) {
    return (
      <AnimatedBackground particleCount={15}>
      <div className="flex justify-center items-center min-h-screen">
          <GlassCard className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white/80 text-lg">Cargando préstamos...</p>
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
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Mercado de Préstamos
                </motion.h1>
                <motion.p 
                  className="text-white/70 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Explora las oportunidades de financiamiento disponibles
                </motion.p>
              </div>
            </motion.div>

            {/* Estadísticas */}
            {stats && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {[
                  { label: 'Préstamos Totales', value: stats.total_loans, icon: FiDollarSign, gradient: 'from-green-500 to-emerald-600' },
                  { label: 'Prestatarios Activos', value: stats.unique_borrowers, icon: FiUser, gradient: 'from-blue-500 to-cyan-600' },
                  { label: 'Monto Total', value: formatCurrency(stats.total_amount), icon: FiTrendingUp, gradient: 'from-purple-500 to-pink-600' },
                  { label: 'Préstamos Financiados', value: stats.funded_loans, icon: FiClock, gradient: 'from-orange-500 to-red-600' }
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <GlassCard key={index} className="text-center">
                            <motion.div
                            className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-4`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                            <Icon className="w-8 h-8 text-white" />
                            </motion.div>
                            <p className="text-white text-2xl font-bold mb-1">{stat.value}</p>
                            <p className="text-white/70 text-sm">{stat.label}</p>
                        </GlassCard>
                    );
                })}
              </motion.div>
            )}

            {/* Filtros */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
              <GlassCard>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <FiFilter className="w-6 h-6 text-white" />
                    <h3 className="text-lg font-semibold text-white">Filtros de Búsqueda</h3>
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)} className="text-white/70 hover:text-white">
                    <FiChevronDown className={`w-6 h-6 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {/* Search Input */}
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                          <input type="text" placeholder="Buscar..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" />
                        </div>
                        <input type="number" placeholder="Monto Mín." value={filters.minAmount} onChange={e => handleFilterChange('minAmount', e.target.value)} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" />
                        <input type="number" placeholder="Monto Máx." value={filters.maxAmount} onChange={e => handleFilterChange('maxAmount', e.target.value)} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" />
                        <select value={filters.purpose} onChange={e => handleFilterChange('purpose', e.target.value)} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                          <option value="" className="bg-slate-800">Propósito</option>
                          {purposes.map(p => <option key={p} value={p} className="bg-slate-800">{p}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button onClick={clearFilters} className="text-sm text-white/60 hover:text-white flex items-center space-x-2"><FiX/><span>Limpiar Filtros</span></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>

            {/* Lista de Préstamos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredLoans.map((loan, index) => (
                  <motion.div
                    key={loan.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard className="h-full flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-white/70 text-sm">{loan.purpose}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(loan.amount)}</p>
                          </div>
                          <ScoreDisplay score={loan.borrower_score || 0} />
                  </div>
                        <p className="text-white/80 text-sm mb-4 h-16 overflow-hidden">
                          {loan.description || 'Sin descripción detallada.'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-4">
                           <span className="flex items-center gap-2"><FiCalendar /> {formatDate(loan.created_at)}</span>
                           <span className="flex items-center gap-2"><FiClock /> {loan.term_months} meses</span>
                           <span className="flex items-center gap-2"><FiMapPin /> {loan.borrower_profile?.user_city || 'N/A'}</span>
                </div>
              </div>
                      <Link href={`/loans/${loan.id}`} passHref>
                        <motion.a 
                          className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          Ver Detalles
                        </motion.a>
                      </Link>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
          </div>
            
            {filteredLoans.length === 0 && !loading && (
              <GlassCard className="text-center py-12">
                <p className="text-white/80 text-lg">No se encontraron préstamos con los filtros actuales.</p>
              </GlassCard>
            )}

          {/* Paginación */}
          {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
              <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
              >
                Anterior
              </button>
                <span className="text-white/80">Página {currentPage} de {totalPages}</span>
              <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
} 