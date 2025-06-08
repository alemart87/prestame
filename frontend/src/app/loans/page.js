'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loanService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreDisplay from '../../components/ScoreDisplay';
import Link from 'next/link';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiUser, 
  FiFilter,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiRefreshCw
} from 'react-icons/fi';

export default function LoansPage() {
  const { user, isLender } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
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

  useEffect(() => {
    applyFilters();
  }, [loans, filters]);

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

  const applyFilters = () => {
    let filtered = [...loans];

    // Filtro por monto
    if (filters.minAmount) {
      filtered = filtered.filter(loan => loan.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(loan => loan.amount <= parseFloat(filters.maxAmount));
    }

    // Filtro por propósito
    if (filters.purpose) {
      filtered = filtered.filter(loan => loan.purpose === filters.purpose);
    }

    // Filtro por frecuencia de pago
    if (filters.paymentFrequency) {
      filtered = filtered.filter(loan => loan.payment_frequency === filters.paymentFrequency);
    }

    // Filtro por score mínimo
    if (filters.minScore) {
      filtered = filtered.filter(loan => (loan.borrower_score || 0) >= parseFloat(filters.minScore));
    }

    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(loan => 
        loan.purpose?.toLowerCase().includes(searchTerm) ||
        loan.description?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredLoans(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      purpose: '',
      paymentFrequency: '',
      minScore: '',
      search: ''
    });
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const purposes = [
    'Negocio', 'Educación', 'Salud', 'Vivienda', 'Vehículo', 
    'Consolidación de deudas', 'Emergencia', 'Otro'
  ];

  if (loading && loans.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando préstamos..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Préstamo</h1>
          <p className="text-gray-600">
            Explora las oportunidades de financiamiento disponibles
          </p>
        </div>
        
        {!user && (
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Link href="/register?type=lender" className="btn-primary">
              Ser Prestamista
            </Link>
            <Link href="/register?type=borrower" className="btn-secondary">
              Solicitar Préstamo
            </Link>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <FiDollarSign className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_loans}</h3>
            <p className="text-gray-600">Préstamos Totales</p>
          </div>
          <div className="card text-center">
            <FiUser className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.unique_borrowers}</h3>
            <p className="text-gray-600">Prestatarios Activos</p>
          </div>
          <div className="card text-center">
            <FiTrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_amount)}</h3>
            <p className="text-gray-600">Monto Total</p>
          </div>
          <div className="card text-center">
            <FiClock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.funded_loans}</h3>
            <p className="text-gray-600">Préstamos Financiados</p>
          </div>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por propósito o descripción..."
              className="input-field pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filtros
          </button>
          
          {/* Botón de actualizar */}
          <button
            onClick={loadData}
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Mínimo (Gs.)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="100000"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Máximo (Gs.)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="10000000"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Propósito
                </label>
                <select
                  className="input-field"
                  value={filters.purpose}
                  onChange={(e) => handleFilterChange('purpose', e.target.value)}
                >
                  <option value="">Todos</option>
                  {purposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia de Pago
                </label>
                <select
                  className="input-field"
                  value={filters.paymentFrequency}
                  onChange={(e) => handleFilterChange('paymentFrequency', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Mínimo
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="50"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => handleFilterChange('minScore', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Lista de préstamos */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-12">
          <FiDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron préstamos
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.values(filters).some(f => f) 
              ? 'Intenta ajustar los filtros para ver más resultados'
              : 'No hay solicitudes de préstamo disponibles en este momento'
            }
          </p>
          {Object.values(filters).some(f => f) && (
            <button onClick={clearFilters} className="btn-primary">
              Limpiar Filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {filteredLoans.length} de {loans.length} solicitudes
            </p>
            {isLender && (
              <Link href="/leads" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver mis leads →
              </Link>
            )}
          </div>

          {/* Grid de préstamos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
              <div key={loan.id} className="card hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatCurrency(loan.amount)}
                    </h3>
                    <p className="text-sm text-gray-600">{loan.purpose}</p>
                  </div>
                  <div className="text-right">
                    <ScoreDisplay score={loan.borrower_score || 0} size="sm" />
                  </div>
                </div>

                {/* Detalles */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="font-medium">
                      {loan.payment_frequency === 'monthly' ? 'Mensual' : 
                       loan.payment_frequency === 'weekly' ? 'Semanal' : 'Diario'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plazo:</span>
                    <span className="font-medium">{loan.term_months} meses</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Publicado:</span>
                    <span className="font-medium">{formatDate(loan.created_at)}</span>
                  </div>
                </div>

                {/* Descripción */}
                {loan.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {loan.description}
                    </p>
                  </div>
                )}

                {/* Garantía */}
                {loan.collateral && (
                  <div className="mb-4 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-800">
                      <strong>Garantía:</strong> {loan.collateral}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  {user ? (
                    isLender ? (
                      <Link 
                        href={`/leads?loan=${loan.id}`}
                        className="btn-primary text-sm"
                      >
                        Ver Lead
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Solo para prestamistas
                      </span>
                    )
                  ) : (
                    <Link 
                      href="/register?type=lender"
                      className="btn-primary text-sm"
                    >
                      Ser Prestamista
                    </Link>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <FiMapPin className="h-3 w-3 mr-1" />
                    Paraguay
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 