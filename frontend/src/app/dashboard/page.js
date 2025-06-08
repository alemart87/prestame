'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { borrowerService, lenderService, loanService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreDisplay from '../../components/ScoreDisplay';
import Link from 'next/link';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiCreditCard,
  FiEye,
  FiPlus,
  FiPackage
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user, profile, isBorrower, isLender, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {user.first_name}! 👋
          </h1>
          <p className="text-gray-600">
            {isBorrower ? 'Gestiona tus solicitudes de préstamo' : 'Revisa tus leads y oportunidades'}
          </p>
        </div>
        
        {profile && isBorrower && (
          <div className="mt-4 sm:mt-0">
            <ScoreDisplay score={profile.score || 0} showDetails={true} />
          </div>
        )}
        
        {isLender && (
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={refreshProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Actualizar Créditos
            </button>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              Debug: {profile?.ai_search_credits || 'No cargado'} créditos
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isBorrower && (
          <>
            <div className="card text-center">
              <FiCreditCard className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData?.loanRequests?.length || 0}
              </h3>
              <p className="text-gray-600">Mis Solicitudes</p>
            </div>
            <div className="card text-center">
              <FiDollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  dashboardData?.loanRequests?.reduce((sum, loan) => sum + loan.amount, 0) || 0
                )}
              </h3>
              <p className="text-gray-600">Monto Total Solicitado</p>
            </div>
            <div className="card text-center">
              <FiTrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {profile?.score || 0}
              </h3>
              <p className="text-gray-600">Score Katupyry</p>
            </div>
            <div className="card text-center">
              <FiUsers className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData?.stats?.total_loans || 0}
              </h3>
              <p className="text-gray-600">Préstamos en la Plataforma</p>
            </div>
          </>
        )}

        {isLender && (
          <>
            <div className="card text-center">
              <FiUsers className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData?.leads?.length || 0}
              </h3>
              <p className="text-gray-600">Leads Disponibles</p>
            </div>
            <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <FiCreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-800">
                {profile?.ai_search_credits || 0}
              </h3>
              <p className="text-green-700 font-medium">Créditos de Búsqueda</p>
              <p className="text-xs text-green-600 mt-1">Para buscar leads reales</p>
            </div>
            <div className="card text-center">
              <FiPackage className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {profile?.current_package || 'Básico'}
              </h3>
              <p className="text-gray-600">Paquete Actual</p>
            </div>
            <div className="card text-center">
              <FiDollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData?.stats?.total_amount || 0)}
              </h3>
              <p className="text-gray-600">Monto Total en Plataforma</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isBorrower && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/loan-request"
                  className="flex items-center p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <FiPlus className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="text-primary-700 font-medium">Nueva Solicitud de Préstamo</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <FiTrendingUp className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-700 font-medium">Mejorar mi Score</span>
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Últimas Solicitudes</h3>
              <div className="space-y-3">
                {dashboardData?.loanRequests?.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(loan.amount)}</p>
                      <p className="text-sm text-gray-600">{loan.purpose || 'Sin propósito'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {loan.status === 'pending' ? 'Pendiente' :
                       loan.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>
                ))}
                {(!dashboardData?.loanRequests || dashboardData.loanRequests.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No tienes solicitudes aún</p>
                )}
              </div>
            </div>
          </>
        )}

        {isLender && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/leads"
                  className="flex items-center p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <FiUsers className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="text-primary-700 font-medium">Ver Leads Disponibles</span>
                </Link>
                <Link
                  href="/packages"
                  className="flex items-center p-3 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                >
                  <FiPackage className="h-5 w-5 text-secondary-600 mr-3" />
                  <span className="text-secondary-700 font-medium">Comprar Paquete de Leads</span>
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads Recientes</h3>
              <div className="space-y-3">
                {dashboardData?.leads?.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Lead #{lead.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleDateString('es-PY')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {lead.status === 'new' ? 'Nuevo' :
                       lead.status === 'viewed' ? 'Visto' : 'Contactado'}
                    </span>
                  </div>
                ))}
                {(!dashboardData?.leads || dashboardData.leads.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No tienes leads disponibles</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Completion */}
      {profile && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completar Perfil</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                {isBorrower 
                  ? 'Completa tu perfil para mejorar tu Score Katupyry'
                  : 'Completa tu perfil para recibir mejores leads'
                }
              </p>
            </div>
            <Link
              href="/profile"
              className="btn-primary"
            >
              Completar Perfil
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 