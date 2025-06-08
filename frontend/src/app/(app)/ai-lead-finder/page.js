'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { findLeadsWithAI, getSearchStatus } from '../../../services/api';
import { toast } from 'react-toastify';
import { FaGlobe, FaSearch, FaSpinner, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';

const RealLeadFinderPage = () => {
    const { user, profile, loading: userLoading, refreshProfile } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [remainingCredits, setRemainingCredits] = useState(0);
    const [searchProgress, setSearchProgress] = useState('');

    useEffect(() => {
        console.log('🔍 AI Lead Finder - Usuario:', user);
        console.log('🔍 AI Lead Finder - Perfil:', profile);
        
        if (profile?.ai_search_credits !== undefined) {
            console.log('💳 Créditos encontrados en perfil:', profile.ai_search_credits);
            setRemainingCredits(profile.ai_search_credits);
        } else {
            console.log('❌ No se encontraron créditos en el perfil, intentando cargar desde API...');
            loadCreditsFromAPI();
        }
    }, [user, profile]);

    const loadCreditsFromAPI = async () => {
        if (user?.user_type === 'lender') {
            try {
                console.log('🔄 Cargando créditos desde API de búsqueda...');
                const searchStatus = await getSearchStatus();
                console.log('📊 Estado de búsqueda:', searchStatus);
                
                if (searchStatus.credits_remaining !== undefined) {
                    console.log('💳 Créditos desde API:', searchStatus.credits_remaining);
                    setRemainingCredits(searchStatus.credits_remaining);
                }
            } catch (error) {
                console.error('❌ Error cargando créditos desde API:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            toast.error('Por favor, describe qué tipo de clientes buscas.');
            return;
        }

        setIsSearching(true);
        setSearchProgress('Iniciando búsqueda en sitios paraguayos...');
        
        try {
            // Simular progreso de búsqueda
            setTimeout(() => setSearchProgress('Buscando en LinkedIn Paraguay...'), 500);
            setTimeout(() => setSearchProgress('Buscando en Facebook Business...'), 1500);
            setTimeout(() => setSearchProgress('Buscando en MercadoLibre...'), 2500);
            setTimeout(() => setSearchProgress('Procesando y validando datos...'), 3500);
            
            const response = await findLeadsWithAI({ prompt });
            
            // Mensaje de éxito mejorado con redirección
            const leadsCount = response.leads_found || 0;
            toast.success(
                `¡${leadsCount} leads reales encontrados! 🎉 Tus datos están disponibles en LEADS.`,
                {
                    duration: 6000,
                    action: {
                        label: 'Ver Leads',
                        onClick: () => window.location.href = '/leads'
                    }
                }
            );
            
            setRemainingCredits(response.remaining_credits);
            setPrompt('');
            
            // Redirección automática después de 3 segundos
            setTimeout(() => {
                window.location.href = '/leads';
            }, 3000);
            
        } catch (error) {
            console.error('Error al buscar leads reales:', error);
            toast.error(error.response?.data?.msg || 'Ha ocurrido un error al buscar los leads.');
        } finally {
            setIsSearching(false);
            setSearchProgress('');
        }
    };
    
    if (userLoading) {
         return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (!user || user.user_type !== 'lender') {
        return (
            <div className="container mx-auto p-8 text-center bg-white rounded-lg shadow">
                <h1 className="text-2xl font-semibold text-gray-700">Acceso Denegado</h1>
                <p className="text-gray-500 mt-2">Esta función es exclusiva para prestamistas.</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <FaGlobe className="mx-auto text-5xl text-green-600 mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Buscador de Leads Reales</h1>
                    <p className="text-gray-600 mt-2">Encuentra clientes reales en Paraguay usando nuestro super scrapeador de datos</p>
                    <div className="flex justify-center items-center mt-4 space-x-4">
                        <div className="flex items-center text-green-600">
                            <FaMapMarkerAlt className="mr-2" />
                            <span className="font-semibold">Paraguay</span>
                        </div>
                        <div className="flex items-center text-blue-600">
                            <FaBuilding className="mr-2" />
                            <span className="font-semibold">Datos Reales</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800">
                        Búsquedas restantes: <span className="text-2xl">{remainingCredits}</span>
                    </p>
                    <p className="text-sm text-green-600 mt-1">Cada búsqueda encuentra datos reales de sitios paraguayos</p>
                    
                    {/* Botón de debug para refrescar créditos */}
                    <div className="mt-3 flex justify-center gap-2 flex-wrap">
                        <button
                            onClick={refreshProfile}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                            🔄 Actualizar Perfil
                        </button>
                        <button
                            onClick={loadCreditsFromAPI}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                            🔍 Cargar desde API
                        </button>
                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Perfil: {profile?.ai_search_credits || 'No cargado'}
                        </div>
                        <div className="text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded">
                            Estado: {remainingCredits}
                        </div>
                    </div>
                </div>

                {/* Información de fuentes */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">🚀 Fuentes de Datos Reales Avanzadas:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
                        <div>• LinkedIn Paraguay</div>
                        <div>• Facebook Business Pages</div>
                        <div>• MercadoLibre Avanzado</div>
                        <div>• Directorios Empresariales</div>
                        <div>• Clasificados ABC/Última Hora</div>
                        <div>• Base de Datos Paraguay</div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-100 rounded text-xs text-blue-600">
                        <strong>🆕 Nuevo:</strong> Scraper avanzado con Selenium para datos más precisos de LinkedIn y Facebook
                    </div>
                </div>
               
                <form onSubmit={handleSearch}>
                    <div className="mb-6">
                        <label htmlFor="search-prompt" className="block text-lg font-semibold text-gray-700 mb-2">
                            Describe el tipo de cliente que buscas:
                        </label>
                        <textarea
                            id="search-prompt"
                            rows="5"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                            placeholder="Ejemplos:
• 'Comerciantes de Asunción que vendan ropa'
• 'Pequeños empresarios de Ciudad del Este'
• 'Productores agrícolas de Itapúa'
• 'Dueños de restaurantes en Central'
• 'Vendedores de MercadoLibre Paraguay'
• 'Empresas de construcción en Asunción'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isSearching}
                        ></textarea>
                        <p className="text-sm text-gray-500 mt-2">
                            💡 Tip: Sé específico sobre la ubicación y tipo de negocio para mejores resultados
                        </p>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isSearching || remainingCredits <= 0}
                        >
                            {isSearching ? (
                                <>
                                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Buscando datos reales...
                                </>
                            ) : remainingCredits <= 0 ? (
                                <>
                                    Sin créditos disponibles
                                </>
                            ) : (
                                <>
                                    <FaSearch className="mr-2" />
                                    Buscar Leads Reales
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Información adicional */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">📋 ¿Cómo funciona?</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>1. Nuestro sistema busca en tiempo real en sitios web paraguayos</li>
                        <li>2. Extrae información de contacto real de empresas y comerciantes</li>
                        <li>3. Filtra y valida los datos para asegurar calidad</li>
                        <li>4. Te entrega leads con nombres, teléfonos y emails reales</li>
                    </ul>
                </div>
            </div>

            {/* Modal de progreso */}
            {isSearching && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Buscando Leads Reales
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchProgress}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Esto puede tomar unos segundos...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealLeadFinderPage; 