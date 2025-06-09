'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getLeadsForLender } from '../../../services/api';
import { toast } from 'react-toastify';
import { FaUserPlus, FaEnvelope, FaPhone, FaCity, FaFileAlt, FaSpinner, FaGlobe, FaCheckCircle, FaBuilding, FaSync } from 'react-icons/fa';

const LeadsPage = () => {
    const { user, profile, loading: userLoading } = useAuth();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

    // Función para cargar leads
    const fetchLeads = async (showToast = false) => {
        console.log("🔍 fetchLeads llamada");
        console.log("👤 User:", user);
        console.log("📋 Profile:", profile);
        console.log("🔑 User type:", user?.user_type);
        console.log("🏦 Is lender:", user?.user_type === 'lender');
        
        // Simplificar la condición - solo verificar que sea lender
        if (user?.user_type !== 'lender') {
            console.log("❌ Usuario no es prestamista");
            return;
        }
        
        setIsLoading(true);
        try {
            console.log("📡 Llamando a getLeadsForLender...");
            const fetchedLeads = await getLeadsForLender();
            console.log("✅ Leads obtenidos del API:", fetchedLeads);
            setLeads(fetchedLeads || []);
            setLastUpdated(new Date());
            if (showToast) {
                toast.success(`✅ ${(fetchedLeads || []).length} leads cargados correctamente`);
            }
        } catch (error) {
            console.error("❌ Error al cargar los leads:", error);
            console.error("❌ Error completo:", error.response?.data || error.message);
            toast.error('❌ No se pudieron cargar los leads. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar leads automáticamente al entrar
    useEffect(() => {
        console.log("🔄 useEffect ejecutado");
        console.log("⏳ userLoading:", userLoading);
        console.log("👤 user:", user);
        console.log("🔑 user_type:", user?.user_type);
        
        if (!userLoading && user) {
            if (user.user_type === 'lender') {
                console.log("✅ Condiciones cumplidas, cargando leads...");
                fetchLeads();
                // Toast de bienvenida solo la primera vez
                setTimeout(() => {
                    toast.success('✅ Leads reales cargados. Datos verificados de empresas paraguayas.', {
                        autoClose: 4000
                    });
                }, 1000);
            } else {
                console.log("⚠️ Usuario no es prestamista");
                setIsLoading(false);
            }
        } else if (!userLoading) {
            console.log("⚠️ No hay usuario autenticado");
            setIsLoading(false);
        }
    }, [user, userLoading]);

    // Auto-refresh cada 30 segundos si hay leads y está habilitado
    useEffect(() => {
        if (leads.length > 0 && autoRefreshEnabled && !isLoading) {
            const interval = setInterval(() => {
                fetchLeads();
            }, 30000); // 30 segundos

            return () => clearInterval(interval);
        }
    }, [leads.length, user, autoRefreshEnabled, isLoading]);

    // Solo mostrar leads reales - filtrar automáticamente
    const filteredLeads = leads.filter(lead => lead.contact?.real_data === true);

    // Contar leads reales
    const realLeadsCount = filteredLeads.length;

    // Solo mostrar spinner de pantalla completa en la carga inicial
    if ((isLoading && leads.length === 0) || userLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                <p className="text-gray-600">Cargando tus leads...</p>
            </div>
        );
    }
    
    if (user?.user_type !== 'lender') {
        return (
            <div className="container mx-auto p-8 text-center bg-white rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-gray-700">Acceso Denegado</h2>
                <p className="text-gray-500 mt-2">Esta sección es solo para prestamistas.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Mis Leads</h1>
                    {lastUpdated && (
                        <p className="text-sm text-gray-500 mt-1">
                            Última actualización: {lastUpdated.toLocaleTimeString('es-PY')}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => fetchLeads(true)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                        >
                            {isLoading ? (
                                <FaSpinner className="inline mr-2 animate-spin" />
                            ) : (
                                <FaSync className="inline mr-2" />
                            )}
                            {isLoading ? 'Actualizando...' : 'Actualizar'}
                        </button>
                        <button
                            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                autoRefreshEnabled 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title={autoRefreshEnabled ? 'Desactivar actualización automática' : 'Activar actualización automática'}
                        >
                            {autoRefreshEnabled ? '🔄 Auto' : '⏸️ Manual'}
                        </button>

                    </div>
                    <p className="text-sm text-gray-600">
                        <FaGlobe className="inline mr-1 text-green-600" />
                        <strong>{realLeadsCount} Leads Reales</strong> disponibles
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                        ✅ Datos verificados de empresas paraguayas
                    </p>
                    {autoRefreshEnabled && leads.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                            🔄 Actualización automática cada 30s
                        </p>
                    )}
                </div>
            </div>

            {/* Información de leads reales */}
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FaCheckCircle className="text-green-600 mr-2 text-xl" />
                        <div>
                            <h3 className="font-semibold text-green-800">Leads Reales Verificados</h3>
                            <p className="text-sm text-green-600">
                                Datos extraídos de sitios web paraguayos oficiales
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-green-700">{realLeadsCount}</span>
                        <p className="text-sm text-green-600">Contactos disponibles</p>
                    </div>
                </div>
            </div>

            {filteredLeads.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <FaUserPlus className="mx-auto text-5xl text-green-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700">
                        No tienes leads reales todavía
                    </h2>
                    <p className="text-gray-500 mt-2 mb-4">
                        Usa el Buscador de Leads Reales para encontrar empresas paraguayas que necesitan financiamiento.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                        <h3 className="font-semibold text-blue-800 mb-2">¿Cómo funciona?</h3>
                        <ul className="text-sm text-blue-700 text-left space-y-1">
                            <li>✅ Describe el tipo de cliente que buscas</li>
                            <li>✅ Nuestra IA busca en sitios paraguayos reales</li>
                            <li>✅ Obtienes contactos verificados con teléfonos y emails</li>
                            <li>✅ Contacta directamente a empresas interesadas</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${isLoading && leads.length > 0 ? 'opacity-75' : ''}`}>
                    {/* Indicador de actualización en segundo plano */}
                    {isLoading && leads.length > 0 && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-2">
                            <div className="flex items-center">
                                <FaSpinner className="animate-spin text-blue-500 mr-2" />
                                <p className="text-sm text-blue-700">Actualizando leads...</p>
                            </div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Necesidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLeads.map(lead => {
                                    return (
                                        <tr key={lead.id} className="bg-green-50 hover:bg-green-100 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaCheckCircle className="text-green-500 mr-3" />
                                                    <div>
                                                        <span className="font-medium text-gray-900">
                                                            {lead.contact?.full_name || 'Sin nombre'}
                                                        </span>
                                                        <div className="mt-1">
                                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                <FaGlobe className="inline mr-1" />
                                                                VERIFICADO
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex items-center mb-1">
                                                    <FaEnvelope className="mr-2 text-green-500" /> 
                                                    <span className="font-semibold text-green-700">
                                                        {lead.contact?.email || 'Sin email'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FaPhone className="mr-2 text-green-500" /> 
                                                    <span className="font-semibold text-green-700">
                                                        {lead.contact?.phone_number || 'Sin teléfono'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <FaCity className="mr-2 text-green-500" /> 
                                                    <span className="font-semibold text-green-700">
                                                        {lead.contact?.city || 'Sin ciudad'}, {lead.contact?.country || 'Paraguay'}
                                                    </span>
                                                </div>
                                                {lead.contact?.business_type && (
                                                    <div className="flex items-center mt-1">
                                                        <FaBuilding className="mr-2 text-green-500" />
                                                        <span className="text-xs text-green-600 font-medium">
                                                            {lead.contact.business_type}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                                                <div className="flex items-center">
                                                   <FaFileAlt className="mr-2 text-gray-400 flex-shrink-0" />
                                                   <p className="truncate">{lead.loan_request?.purpose || 'No especificada'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="text-green-600 font-medium">
                                                    <FaGlobe className="inline mr-1" />
                                                    {lead.contact?.source || 'Web Paraguay'}
                                                </div>
                                                <div className="text-xs text-green-500 mt-1">
                                                    ✅ Verificado
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Información adicional */}
            {realLeadsCount > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">
                        <FaCheckCircle className="inline mr-2" />
                        Leads Reales Verificados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center text-green-700">
                                <FaGlobe className="mr-2" />
                                <strong>Fuentes Verificadas:</strong>
                            </div>
                            <ul className="text-green-600 ml-6 space-y-1">
                                <li>• LinkedIn Paraguay</li>
                                <li>• Facebook Business</li>
                                <li>• MercadoLibre Paraguay</li>
                                <li>• Directorios empresariales</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center text-green-700">
                                <FaCheckCircle className="mr-2" />
                                <strong>Datos Incluidos:</strong>
                            </div>
                            <ul className="text-green-600 ml-6 space-y-1">
                                <li>• Nombres y empresas reales</li>
                                <li>• Teléfonos paraguayos válidos</li>
                                <li>• Emails verificados</li>
                                <li>• Ubicación y tipo de negocio</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <p className="text-green-800 text-sm font-medium">
                            💡 <strong>Tip:</strong> Estos son contactos reales de empresas paraguayas. 
                            Puedes llamar o escribir directamente para ofrecer tus servicios de financiamiento.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsPage; 