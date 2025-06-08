'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getLeadsForLender } from '../../../services/api';
import { toast } from 'react-toastify';
import { FaUserPlus, FaEnvelope, FaPhone, FaCity, FaInfoCircle, FaFileAlt, FaSpinner, FaGlobe, FaRobot, FaCheckCircle, FaBuilding, FaSync } from 'react-icons/fa';

const LeadsPage = () => {
    const { user, loading: userLoading } = useAuth();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, real, fictitious

    useEffect(() => {
        if (!userLoading) {
            if (user?.user_type === 'lender' && user.lender_profile) {
                const fetchLeads = async () => {
                    try {
                        const fetchedLeads = await getLeadsForLender();
                        console.log("Leads obtenidos del API:", fetchedLeads);
                        setLeads(fetchedLeads);
                    } catch (error) {
                        console.error("Error al cargar los leads:", error);
                        toast.error('No se pudieron cargar los leads.');
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchLeads();
            } else {
                setIsLoading(false);
            }
        }
    }, [user, userLoading]);

    // Filtrar leads según el filtro seleccionado
    const filteredLeads = leads.filter(lead => {
        if (filter === 'all') return true;
        if (filter === 'real') return lead.contact?.real_data === true;
        if (filter === 'fictitious') return lead.contact?.real_data !== true;
        return true;
    });

    // Contar tipos de leads
    const realLeadsCount = leads.filter(lead => lead.contact?.real_data === true).length;
    const fictitiousLeadsCount = leads.filter(lead => lead.contact?.real_data !== true).length;

    if (isLoading || userLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
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
                <h1 className="text-3xl font-bold text-gray-800">Mis Leads</h1>
                <div className="text-right">
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                const fetchedLeads = await getLeadsForLender();
                                console.log("Leads actualizados:", fetchedLeads);
                                setLeads(fetchedLeads);
                                toast.success('Leads actualizados correctamente');
                            } catch (error) {
                                console.error("Error al actualizar leads:", error);
                                toast.error('Error al actualizar leads');
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaSync className="inline mr-2" />
                        Actualizar
                    </button>
                    <p className="text-sm text-gray-600">Total: {leads.length} leads</p>
                    <div className="flex space-x-4 mt-1">
                        <span className="text-sm text-green-600 font-semibold">
                            <FaGlobe className="inline mr-1" />
                            Reales: {realLeadsCount}
                        </span>
                        <span className="text-sm text-purple-600 font-semibold">
                            <FaRobot className="inline mr-1" />
                            Ficticios: {fictitiousLeadsCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'all' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Todos ({leads.length})
                </button>
                <button
                    onClick={() => setFilter('real')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'real' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    <FaGlobe className="inline mr-1" />
                    Datos Reales ({realLeadsCount})
                </button>
                <button
                    onClick={() => setFilter('fictitious')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'fictitious' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    <FaRobot className="inline mr-1" />
                    Ficticios ({fictitiousLeadsCount})
                </button>
            </div>

            {filteredLeads.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <FaUserPlus className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700">
                        {filter === 'all' ? 'No tienes leads todavía' : `No tienes leads ${filter === 'real' ? 'reales' : 'ficticios'}`}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {filter === 'all' 
                            ? 'Usa el Buscador de Leads Reales para empezar a contactar clientes.' 
                            : `Cambia el filtro para ver otros tipos de leads.`
                        }
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                                    const isRealData = lead.contact?.real_data === true;
                                    return (
                                        <tr key={lead.id} className={isRealData ? 'bg-green-50' : 'bg-purple-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {isRealData ? (
                                                        <FaCheckCircle className="text-green-500 mr-3" />
                                                    ) : (
                                                        <FaRobot className="text-purple-500 mr-3" />
                                                    )}
                                                    <div>
                                                        <span className="font-medium text-gray-900">
                                                            {lead.contact?.full_name || 'Sin nombre'}
                                                        </span>
                                                        <div className="mt-1">
                                                            {isRealData ? (
                                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                    <FaGlobe className="inline mr-1" />
                                                                    DATOS REALES
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                                                    <FaRobot className="inline mr-1" />
                                                                    FICTICIO
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex items-center mb-1">
                                                    <FaEnvelope className="mr-2 text-gray-400" /> 
                                                    <span className={isRealData ? 'font-semibold text-green-700' : 'text-gray-600'}>
                                                        {lead.contact?.email || 'Sin email'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FaPhone className="mr-2 text-gray-400" /> 
                                                    <span className={isRealData ? 'font-semibold text-green-700' : 'text-gray-600'}>
                                                        {lead.contact?.phone_number || 'Sin teléfono'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <FaCity className="mr-2 text-gray-400" /> 
                                                    <span className={isRealData ? 'font-semibold text-green-700' : 'text-gray-600'}>
                                                        {lead.contact?.city || 'Sin ciudad'}, {lead.contact?.country || 'Sin país'}
                                                    </span>
                                                </div>
                                                {lead.contact?.business_type && (
                                                    <div className="flex items-center mt-1">
                                                        <FaBuilding className="mr-2 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
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
                                                {isRealData ? (
                                                    <div className="text-green-600 font-medium">
                                                        <FaGlobe className="inline mr-1" />
                                                        {lead.contact?.source || 'Web Paraguay'}
                                                    </div>
                                                ) : (
                                                    <div className="text-purple-600 font-medium">
                                                        <FaRobot className="inline mr-1" />
                                                        IA Generado
                                                    </div>
                                                )}
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
            {leads.length > 0 && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">
                        <FaInfoCircle className="inline mr-2" />
                        Información sobre tus leads
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                            <strong>Leads con Datos Reales:</strong> Información extraída de sitios web paraguayos reales. 
                            Estos contactos existen y puedes contactarlos directamente.
                        </div>
                        <div>
                            <strong>Leads Ficticios:</strong> Datos generados por IA para propósitos de demostración. 
                            No representan personas reales.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsPage; 