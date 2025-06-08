'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { borrowerService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
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
  FiAlertCircle
} from 'react-icons/fi';

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
        return <FiClock className="h-5 w-5 text-blue-500" />;
      case 'funded':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <FiXCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FiAlertCircle className="h-5 w-5 text-gray-500" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'funded':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLoans = loanRequests.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando solicitudes..." />
      </div>
    );
  }

  if (!user || !isBorrower) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes de Préstamo</h1>
          <p className="text-gray-600">
            Gestiona y revisa el estado de tus solicitudes
          </p>
        </div>
        
        <Link href="/loan-request" className="btn-primary flex items-center mt-4 sm:mt-0">
          <FiPlus className="mr-2 h-4 w-4" />
          Nueva Solicitud
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todas ({loanRequests.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Activas ({loanRequests.filter(l => l.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('funded')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'funded'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Financiadas ({loanRequests.filter(l => l.status === 'funded').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'cancelled'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Canceladas ({loanRequests.filter(l => l.status === 'cancelled').length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Lista de Solicitudes */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-12">
          <FiDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No tienes solicitudes de préstamo' : `No tienes solicitudes ${getStatusText(filter).toLowerCase()}`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Crea tu primera solicitud para comenzar a buscar financiamiento'
              : 'Cambia el filtro para ver otras solicitudes'
            }
          </p>
          {filter === 'all' && (
            <Link href="/loan-request" className="btn-primary">
              <FiPlus className="mr-2 h-4 w-4" />
              Crear Primera Solicitud
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLoans.map((loan) => (
            <div key={loan.id} className="card hover:shadow-lg transition-shadow">
              {/* Header de la tarjeta */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  {getStatusIcon(loan.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {getStatusText(loan.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(loan.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(loan.created_at)}
                  </p>
                </div>
              </div>

              {/* Detalles del préstamo */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Propósito:</span>
                  <span className="text-sm font-medium text-gray-900">{loan.purpose}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Frecuencia:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {loan.payment_frequency === 'monthly' ? 'Mensual' : 
                     loan.payment_frequency === 'weekly' ? 'Semanal' : 'Diario'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plazo:</span>
                  <span className="text-sm font-medium text-gray-900">{loan.term_months} meses</span>
                </div>

                {loan.description && (
                  <div>
                    <span className="text-sm text-gray-600">Descripción:</span>
                    <p className="text-sm text-gray-900 mt-1 line-clamp-2">
                      {loan.description}
                    </p>
                  </div>
                )}

                {loan.collateral && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Garantía:</span>
                    <span className="text-sm font-medium text-gray-900">{loan.collateral}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                    <FiEye className="mr-1 h-4 w-4" />
                    Ver Detalles
                  </button>
                  
                  {loan.status === 'active' && (
                    <>
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center">
                        <FiEdit className="mr-1 h-4 w-4" />
                        Editar
                      </button>
                      <button 
                        onClick={() => handleCancelLoan(loan.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                      >
                        <FiTrash2 className="mr-1 h-4 w-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
                
                {loan.status === 'active' && (
                  <span className="text-xs text-gray-500">
                    Visible para prestamistas
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {loanRequests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="card text-center">
            <FiDollarSign className="h-6 w-6 text-primary-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(loanRequests.reduce((sum, loan) => sum + loan.amount, 0))}
            </p>
            <p className="text-sm text-gray-600">Total Solicitado</p>
          </div>
          
          <div className="card text-center">
            <FiClock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">
              {loanRequests.filter(l => l.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Solicitudes Activas</p>
          </div>
          
          <div className="card text-center">
            <FiCheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">
              {loanRequests.filter(l => l.status === 'funded').length}
            </p>
            <p className="text-sm text-gray-600">Financiadas</p>
          </div>
          
          <div className="card text-center">
            <FiCalendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">
              {loanRequests.length > 0 ? 
                Math.round(loanRequests.reduce((sum, loan) => sum + loan.term_months, 0) / loanRequests.length) : 0
              }
            </p>
            <p className="text-sm text-gray-600">Plazo Promedio (meses)</p>
          </div>
        </div>
      )}
    </div>
  );
} 