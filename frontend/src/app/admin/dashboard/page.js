'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../services/api'; // Importar la instancia de axios
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FiUsers, FiDollarSign, FiCheckSquare, FiAlertTriangle, FiToggleLeft, FiToggleRight, FiTrash2, FiShare2, FiZap, FiCreditCard, FiPlus, FiEdit, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Componente para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, color }) => (
  <div className={`card ${color}`}>
    <div className="flex items-center">
      <div className="p-3 mr-4 text-gray-700 bg-gray-200 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState('');

  const fetchData = useCallback(async () => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isSuperAdmin) {
      try {
        setLoadingData(true);
        const [statsResponse, usersResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setStats(statsResponse.data);
        setUsers(usersResponse.data.users || []);
        setError('');
      } catch (err) {
        setError('Error al cargar los datos del dashboard.');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
  }, [user, isSuperAdmin, authLoading, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin, fetchData]);

  // Mostrar un spinner mientras se verifica la autenticación
  if (authLoading || !isSuperAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner text="Verificando acceso..." />
      </div>
    );
  }

  if (loadingData || !stats) {
     return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner text="Cargando datos del dashboard..." />
      </div>
    );
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    const confirmMessage = `¿Estás seguro de que quieres ${action} este usuario?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      const response = await api.patch(`/admin/users/${userId}/toggle-status`);
      
      // Actualizar el usuario en el estado local
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_active: response.data.user.is_active }
          : u
      ));
      
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(''), 3000); // Limpiar mensaje después de 3 segundos
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar el estado del usuario');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmMessage = `¿Estás COMPLETAMENTE SEGURO de que quieres ELIMINAR PERMANENTEMENTE al usuario "${userName}"?\n\nEsta acción NO se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      await api.delete(`/admin/users/${userId}`);
      
      // Remover el usuario del estado local
      setUsers(users.filter(u => u.id !== userId));
      
      // Actualizar las estadísticas
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      
      setSuccessMessage('Usuario eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el usuario');
    }
  };

  const handleAssignLeads = async () => {
    if (stats.unassignedLeads === 0) {
      setError("No hay leads pendientes para asignar.");
      setTimeout(() => setError(''), 3000);
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres asignar ${stats.unassignedLeads} leads de forma aleatoria?`;
    if (!window.confirm(confirmMessage)) return;

    setLoadingAssign(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/admin/leads/assign');
      setSuccessMessage(response.data.message);
      await fetchData(); // Recargar todos los datos
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al asignar los leads.');
    } finally {
      setLoadingAssign(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleAssignCredits = async () => {
    if (!selectedUser || !creditsToAdd || creditsToAdd <= 0) {
      toast.error('Por favor, ingresa una cantidad válida de créditos');
      return;
    }

    try {
      const response = await api.post(`/admin/users/${selectedUser.id}/credits`, { credits: parseInt(creditsToAdd) });
      toast.success(response.data.message);
      setShowCreditModal(false);
      setSelectedUser(null);
      setCreditsToAdd('');
      await fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al asignar créditos:', error);
      toast.error(error.response?.data?.error || 'Error al asignar créditos');
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
    return new Date(dateString).toLocaleDateString('es-PY');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administrador</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative mb-6">{successMessage}</div>}

      {/* Sección de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Usuarios" value={stats.totalUsers} icon={<FiUsers size={24} />} color="bg-blue-100" />
        <StatCard title="Préstamos" value={stats.totalLoans} icon={<FiDollarSign size={24} />} color="bg-green-100" />
        <StatCard title="Aprobados" value={stats.approvedLoans} icon={<FiCheckSquare size={24} />} color="bg-purple-100" />
        <StatCard title="Pendientes" value={stats.pendingLoans} icon={<FiAlertTriangle size={24} />} color="bg-yellow-100" />
        <StatCard title="Leads sin Asignar" value={stats.unassignedLeads} icon={<FiZap size={24} />} color="bg-orange-100" />
      </div>

      {/* Acción de Asignar Leads */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FiShare2 className="mr-3 text-primary-600" />
              Asignación de Leads
            </h2>
            <p className="text-gray-600 mt-1 pl-8">
              Distribuye todos los leads sin asignar de forma aleatoria entre los prestamistas activos.
            </p>
          </div>
          <button
            onClick={handleAssignLeads}
            disabled={loadingAssign || stats.unassignedLeads === 0}
            className="btn-primary mt-4 md:mt-0 w-full md:w-auto flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loadingAssign ? (
              <LoadingSpinner size="sm" text="Asignando..." />
            ) : (
              <>
                Asignar {stats.unassignedLeads} Leads
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.user_type === 'superadmin' ? 'bg-red-100 text-red-800' :
                      u.user_type === 'lender' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {u.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.user_type === 'lender' && u.lender_profile ? (
                      <div className="flex items-center">
                        <span className="font-medium text-green-600 mr-2">
                          {u.lender_profile.ai_search_credits}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowCreditModal(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Asignar créditos"
                        >
                          <FiCreditCard className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    {u.user_type !== 'superadmin' && (
                      <>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                            u.is_active 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {u.is_active ? <FiToggleRight className="mr-1" /> : <FiToggleLeft className="mr-1" />}
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(u.id, `${u.first_name} ${u.last_name}`)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          <FiTrash2 className="mr-1" />
                          Eliminar
                        </button>
                      </>
                    )}
                    {u.user_type === 'superadmin' && (
                      <span className="text-gray-400 text-xs">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para asignar créditos */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Asignar Créditos
            </h3>
            <p className="text-gray-600 mb-4">
              Usuario: <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Créditos actuales: <strong>{selectedUser.lender_profile?.ai_search_credits || 0}</strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Créditos a agregar:
              </label>
              <input
                type="number"
                min="1"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: 10"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreditModal(false);
                  setSelectedUser(null);
                  setCreditsToAdd('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignCredits}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Asignar Créditos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 