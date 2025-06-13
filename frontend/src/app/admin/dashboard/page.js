'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner';
import GlassCard from '../../../components/GlassCard';
import { FiUsers, FiDollarSign, FiCheckSquare, FiAlertTriangle, FiZap, FiCreditCard, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';

// Componente para estadísticas
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <GlassCard className="p-6 text-center">
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} text-white mb-4 mx-auto`}>
        {icon}
      </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
  </GlassCard>
);

// Modal para asignar créditos
const CreditAssignmentModal = ({ isOpen, onClose, onAssign, selectedUser }) => {
  const [credits, setCredits] = useState(10);
  const [creditType, setCreditType] = useState('lead_credits');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onAssign(selectedUser.id, credits, creditType);
      onClose();
      setCredits(10);
    } catch (error) {
      console.error('Error asignando créditos:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          💳 Asignar Créditos a {selectedUser?.name}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Créditos
            </label>
            <select
              value={creditType}
              onChange={(e) => setCreditType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="lead_credits">🛒 Créditos para Comprar Leads</option>
              <option value="ai_search_credits">🤖 Créditos de Búsqueda IA</option>
            </select>
            
            {/* Descripción del tipo de crédito */}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              {creditType === 'lead_credits' ? (
                <p className="text-sm text-gray-600">
                  <strong>💰 Créditos para Comprar Leads:</strong> Permite al prestamista comprar leads individuales de solicitudes de préstamo reales.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  <strong>🤖 Créditos de Búsqueda IA:</strong> Permite usar el sistema de scraping avanzado para encontrar leads reales en sitios paraguayos.
                </p>
              )}
            </div>
          </div>

      <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de Créditos
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 10"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {creditType === 'lead_credits' 
                ? '1 crédito = 1 lead comprable' 
                : '1 crédito = 1 búsqueda de hasta 15 leads reales'
              }
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? '⏳ Asignando...' : '✅ Asignar Créditos'}
            </button>
      </div>
        </form>
    </div>
  </div>
);
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreditModal, setShowCreditModal] = useState(false);

  // Verificar que sea superadmin
  useEffect(() => {
    if (!user) return;
    
    if (user.user_type !== 'superadmin') {
      toast.error('Acceso denegado. Solo SuperAdmins pueden acceder.');
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Cargar estadísticas con manejo de errores mejorado
  const loadStats = useCallback(async () => {
    try {
      console.log('🔍 Cargando estadísticas...');
      const response = await api.get('/admin/stats');
      console.log('📊 Estadísticas recibidas:', response.data);
      
      // Si hay error pero también datos de fallback
      if (response.data.error && response.data.fallback_data) {
        console.warn('⚠️ Usando datos de fallback:', response.data.fallback_data);
        setStats(response.data.fallback_data);
        toast.warning('Algunas estadísticas no están disponibles');
      } else {
        setStats(response.data);
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      
      // Estadísticas por defecto si falla completamente
      setStats({
        users: { total: 0, lenders: 0, borrowers: 0, active: 0 },
        credits: { total_lead_credits: 0, total_ai_credits: 0 },
        loans: { total_requests: 0, active: 0, pending: 0 },
        leads: { total: 0, new: 0 },
        financial: { total_amount_requested: 0, avg_loan_amount: 0 }
      });
      
      toast.error('Error cargando estadísticas');
    }
  }, []);

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    try {
      console.log('🔍 Cargando usuarios...');
      const response = await api.get('/admin/users');
      console.log('👥 Respuesta completa de usuarios:', response.data);
      console.log('👥 Array de usuarios:', response.data.users);
      
      // Verificar cada usuario
      response.data.users?.forEach((user, index) => {
        console.log(`👤 Usuario ${index}:`, {
          name: `${user.first_name} ${user.last_name}`,
          type: user.user_type,
          lender_profile: user.lender_profile,
          lead_credits: user.lender_profile?.lead_credits,
          ai_credits: user.lender_profile?.ai_search_credits
        });
      });
      
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      toast.error('Error cargando usuarios');
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🔍 User state:', user);
    console.log('🔍 User type:', user?.user_type);
    
    const loadData = async () => {
      if (!user || user.user_type !== 'superadmin') {
        console.log('❌ No es superadmin o user no definido');
        return;
      }
      
      console.log('✅ Es superadmin, cargando datos...');
      setLoading(true);
      
      try {
        console.log('📡 Iniciando carga de stats...');
        await loadStats();
        console.log('📡 Iniciando carga de users...');
        await loadUsers();
        console.log('✅ Datos cargados exitosamente');
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, loadStats, loadUsers]);

  // Asignar créditos
  const handleAssignCredits = async (userId, credits, creditType = 'lead_credits') => {
    try {
      console.log(`🎯 Asignando ${credits} créditos de tipo ${creditType} al usuario ${userId}`);
      const response = await api.post(`/admin/users/${userId}/credits`, { 
        credits, 
        credit_type: creditType 
      });
      console.log('✅ Respuesta:', response.data);
      
      const creditName = creditType === 'lead_credits' ? 'créditos para comprar leads' : 'créditos de búsqueda IA';
      toast.success(`✅ ${credits} ${creditName} asignados exitosamente`);
      
      await loadUsers(); // Recargar lista de usuarios
    } catch (error) {
      console.error('❌ Error asignando créditos:', error);
      toast.error(`❌ Error: ${error.response?.data?.error || 'Error asignando créditos'}`);
    }
  };

  // Alternar estado del usuario
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success(`Usuario ${currentStatus ? 'desactivado' : 'activado'} exitosamente`);
      await loadUsers();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      toast.error(`Error: ${error.response?.data?.error || 'Error actualizando usuario'}`);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado exitosamente');
      await loadUsers();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error(`Error: ${error.response?.data?.error || 'Error eliminando usuario'}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PY');
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!user || user.user_type !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando acceso..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dashboard SuperAdmin
          </h1>
          <p className="text-gray-600">
            Panel de control y administración del sistema
          </p>
        </div>

        {/* Estadísticas Generales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Total Usuarios"
              value={stats.users?.total || 0}
              subtitle={`${stats.users?.active || 0} activos`}
              icon={<FiUsers className="w-6 h-6" />}
              color="bg-gradient-to-r from-blue-500 to-purple-600"
            />
            <StatCard
              title="Prestamistas"
              value={stats.users?.lenders || 0}
              subtitle={`${stats.credits?.lenders_with_credits || 0} con créditos`}
              icon={<FiDollarSign className="w-6 h-6" />}
              color="bg-gradient-to-r from-green-500 to-emerald-600"
            />
            <StatCard
              title="Prestatarios"
              value={stats.users?.borrowers || 0}
              subtitle={`${stats.loans?.total_requests || 0} solicitudes`}
              icon={<FiCheckSquare className="w-6 h-6" />}
              color="bg-gradient-to-r from-orange-500 to-red-600"
            />
            <StatCard
              title="Créditos Leads"
              value={stats.credits?.total_lead_credits || 0}
              subtitle="Para comprar leads"
              icon={<FiCreditCard className="w-6 h-6" />}
              color="bg-gradient-to-r from-purple-500 to-pink-600"
            />
            <StatCard
              title="Créditos IA"
              value={stats.credits?.total_ai_credits || 0}
              subtitle="Para búsquedas"
              icon={<FiZap className="w-6 h-6" />}
              color="bg-gradient-to-r from-indigo-500 to-blue-600"
            />
          </div>
        )}

        {/* Agregar una sección de estadísticas detalladas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Resumen Financiero */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Resumen Financiero</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total solicitado:</span>
                  <span className="font-semibold">{formatCurrency(stats.financial?.total_amount_requested || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Promedio por préstamo:</span>
                  <span className="font-semibold">{formatCurrency(stats.financial?.avg_loan_amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Préstamos activos:</span>
                  <span className="font-semibold text-green-600">{stats.loans?.active || 0}</span>
                </div>
              </div>
            </div>

            {/* Distribución de Créditos */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Distribución de Créditos</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Créditos para leads:</span>
                  <span className="font-semibold text-purple-600">{stats.credits?.total_lead_credits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créditos IA:</span>
                  <span className="font-semibold text-blue-600">{stats.credits?.total_ai_credits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prestamistas activos:</span>
                  <span className="font-semibold text-green-600">{stats.credits?.lenders_with_credits || 0}</span>
                </div>
              </div>
      </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Actividad Reciente</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Leads disponibles:</span>
                  <span className="font-semibold text-orange-600">{stats.leads?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leads nuevos:</span>
                  <span className="font-semibold text-red-600">{stats.leads?.new || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Préstamos pendientes:</span>
                  <span className="font-semibold text-yellow-600">{stats.loans?.pending || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Usuarios */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <button
              onClick={() => {
                loadUsers();
                loadStats();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              🔄 Actualizar
          </button>
        </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
              <button
                onClick={loadUsers}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Recargar Datos
              </button>
      </div>
          ) : (
        <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Usuario</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Créditos IA</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Registro</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-gray-800">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.user_type === 'lender' 
                            ? 'bg-green-100 text-green-800' 
                            : user.user_type === 'borrower' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {user.user_type === 'lender' ? '💰 Prestamista' : user.user_type === 'borrower' ? '🏦 Prestatario' : '👑 SuperAdmin'}
                    </span>
                  </td>
                      <td className="py-3 px-2">
                        {user.user_type === 'lender' ? (
                          <div className="text-sm space-y-1">
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                🛒 {user.lender_profile?.lead_credits || 0} leads
                              </span>
                            </div>
                      <div className="flex items-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                🤖 {user.lender_profile?.ai_search_credits || 0} IA
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-2 justify-center">
                          {/* Botón Asignar Créditos */}
                          {user.user_type === 'lender' && (
                        <button
                          onClick={() => {
                                setSelectedUser({
                                  id: user.id,
                                  name: `${user.first_name} ${user.last_name}`
                                });
                            setShowCreditModal(true);
                          }}
                              className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-all"
                              title="Asignar Créditos"
                        >
                              <FiCreditCard className="inline w-3 h-3 mr-1" />
                              Créditos
                        </button>
                          )}
                          
                          {/* Botón Activar/Desactivar */}
                          {user.user_type !== 'superadmin' && (
                        <button
                              onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              className={`px-3 py-1 text-xs rounded transition-all ${
                                user.is_active 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {user.is_active ? (
                                <>
                                  <FiToggleRight className="inline w-3 h-3 mr-1" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <FiToggleLeft className="inline w-3 h-3 mr-1" />
                                  Activar
                                </>
                              )}
                        </button>
                          )}
                        
                          {/* Botón Eliminar */}
                          {user.user_type !== 'superadmin' && (
                        <button
                              onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                              className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-all"
                              title="Eliminar Usuario"
                        >
                              <FiTrash2 className="inline w-3 h-3 mr-1" />
                          Eliminar
                        </button>
                    )}
                        </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
      </div>

        {/* Modal para Asignar Créditos */}
        <CreditAssignmentModal
          isOpen={showCreditModal}
          onClose={() => setShowCreditModal(false)}
          onAssign={handleAssignCredits}
          selectedUser={selectedUser}
              />
            </div>
    </div>
  );
} 