'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { findLeadsWithAI, getSearchStatus } from '../../../services/api';
import { toast } from 'react-toastify';
import { FaGlobe, FaSearch, FaSpinner, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import AppNavbar from '../../../components/AppNavbar';
import AnimatedBackground from '../../../components/AnimatedBackground';
import GlassCard from '../../../components/GlassCard';
import { motion } from 'framer-motion';

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
        <div>
            <AppNavbar />
            <AnimatedBackground particleCount={20}>
                <div className="container mx-auto p-4 md:p-8 min-h-screen pt-24">
                    <div className="max-w-4xl mx-auto">
                        <GlassCard>
                            <div className="p-8">
                <div className="text-center mb-8">
                                    <motion.div
                                        className="w-20 h-20 bg-gradient-to-r from-green-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4"
                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                    >
                                        <FaGlobe className="text-white text-4xl" />
                                    </motion.div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">Buscador de Leads Reales</h1>
                                    <p className="text-white/70 mt-2">Encuentra clientes reales en Paraguay usando nuestro super scrapeador de datos</p>
                    <div className="flex justify-center items-center mt-4 space-x-4">
                                        <div className="flex items-center text-green-300">
                            <FaMapMarkerAlt className="mr-2" />
                            <span className="font-semibold">Paraguay</span>
                        </div>
                                        <div className="flex items-center text-blue-300">
                            <FaBuilding className="mr-2" />
                            <span className="font-semibold">Datos Reales</span>
                        </div>
                    </div>
                </div>

                                <div className="text-center mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="font-semibold text-green-200">
                        Búsquedas restantes: <span className="text-2xl">{remainingCredits}</span>
                    </p>
                                    <p className="text-sm text-green-300/80 mt-1">Cada búsqueda encuentra datos reales de sitios paraguayos</p>
                    
                    {/* Botón de debug para refrescar créditos */}
                    <div className="mt-3 flex justify-center gap-2 flex-wrap">
                        <button
                            onClick={refreshProfile}
                                            className="px-3 py-1 bg-blue-500/20 text-white text-xs rounded hover:bg-blue-600/40"
                        >
                            🔄 Actualizar Perfil
                        </button>
                        <button
                            onClick={loadCreditsFromAPI}
                                            className="px-3 py-1 bg-green-500/20 text-white text-xs rounded hover:bg-green-600/40"
                        >
                            🔍 Cargar desde API
                        </button>
                    </div>
                </div>

                {/* Información de fuentes */}
                                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <h3 className="font-semibold text-blue-200 mb-2">🚀 Fuentes de Datos Reales Avanzadas:</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-300/80">
                        <div>• LinkedIn Paraguay</div>
                        <div>• Facebook Business Pages</div>
                        <div>• MercadoLibre Avanzado</div>
                        <div>• Directorios Empresariales</div>
                        <div>• Clasificados ABC/Última Hora</div>
                        <div>• Base de Datos Paraguay</div>
                    </div>
                                    <div className="mt-3 p-3 bg-blue-500/20 rounded text-xs text-blue-300">
                        <strong>🆕 Nuevo:</strong> Scraper avanzado con Selenium para datos más precisos de LinkedIn y Facebook
                    </div>
                </div>
               
                <form onSubmit={handleSearch}>
                    <div className="mb-6">
                                        <label htmlFor="search-prompt" className="block text-lg font-semibold text-white mb-2">
                            Describe el tipo de cliente que buscas:
                        </label>
                        <textarea
                            id="search-prompt"
                            rows="5"
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-white placeholder-white/50"
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
                                        <p className="text-sm text-white/60 mt-2">
                            💡 Tip: Sé específico sobre la ubicación y tipo de negocio para mejores resultados
                        </p>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                                            className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <h3 className="font-semibold text-yellow-200 mb-2">📋 ¿Cómo funciona?</h3>
                                    <ul className="text-sm text-yellow-300/80 space-y-1">
                        <li>1. Nuestro sistema busca en tiempo real en sitios web paraguayos</li>
                        <li>2. Extrae información de contacto real de empresas y comerciantes</li>
                        <li>3. Filtra y valida los datos para asegurar calidad</li>
                        <li>4. Te entrega leads con nombres, teléfonos y emails reales</li>
                    </ul>
                </div>
                            </div>
                        </GlassCard>
            </div>

            {/* Modal de progreso */}
            {isSearching && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                            <GlassCard>
                                <div className="p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                                        <FaSpinner className="animate-spin text-4xl text-green-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                Buscando Leads Reales
                            </h3>
                                        <p className="text-white/70 mb-4">
                                {searchProgress}
                            </p>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                            </div>
                                        <p className="text-xs text-white/50 mt-2">
                                Esto puede tomar unos segundos...
                            </p>
                        </div>
                    </div>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </AnimatedBackground>
        </div>
    );
};

export default RealLeadFinderPage; 