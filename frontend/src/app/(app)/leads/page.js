'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getLeadsForLender } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FiUserPlus, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiFileText, 
  FiGlobe, 
  FiCheckCircle, 
  FiBuilding, 
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiStar,
  FiFilter,
  FiSearch,
  FiEye,
  FiHeart,
  FiClock,
  FiShield
} from 'react-icons/fi';
import AnimatedBackground from '../../../components/AnimatedBackground';
import GlassCard from '../../../components/GlassCard';
import AppNavbar from '../../../components/AppNavbar';

const LeadsPage = () => {
    const { user, profile, loading: userLoading } = useAuth();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

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
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = !searchTerm || 
            lead.contact?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact?.city?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || 
            lead.contact?.category === selectedCategory;
            
        return lead.contact?.real_data === true && matchesSearch && matchesCategory;
    });

    // Contar leads reales
    const realLeadsCount = leads.filter(lead => lead.contact?.real_data === true).length;

    // Obtener categorías únicas
    const categories = [...new Set(leads
        .filter(lead => lead.contact?.real_data === true)
        .map(lead => lead.contact?.category)
        .filter(Boolean)
    )];

    // Solo mostrar spinner de pantalla completa en la carga inicial
    if ((isLoading && leads.length === 0) || userLoading) {
        return (
            <AnimatedBackground particleCount={15}>
                <div className="flex justify-center items-center min-h-screen">
                    <GlassCard className="text-center">
                        <motion.div
                            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-white/80 text-lg">Cargando tus leads...</p>
                    </GlassCard>
            </div>
            </AnimatedBackground>
        );
    }
    
    if (user?.user_type !== 'lender') {
        return (
            <AnimatedBackground particleCount={15}>
                <div className="flex justify-center items-center min-h-screen">
                    <GlassCard className="text-center">
                        <motion.div
                            className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                            <FiShield className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Acceso Denegado</h2>
                        <p className="text-white/70">Esta sección es solo para prestamistas.</p>
                    </GlassCard>
            </div>
            </AnimatedBackground>
        );
    }

    return (
        <div>
            <AppNavbar />
            
            <AnimatedBackground particleCount={30}>
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
                                    Mis Leads
                                </motion.h1>
                                <motion.p 
                                    className="text-white/70 text-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    Empresas paraguayas verificadas que necesitan financiamiento
                                </motion.p>
                    {lastUpdated && (
                                    <motion.p 
                                        className="text-white/50 text-sm mt-1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                    >
                            Última actualización: {lastUpdated.toLocaleTimeString('es-PY')}
                                    </motion.p>
                    )}
                </div>
                            
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="flex items-center space-x-4"
                            >
                                <motion.button
                                    onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                        autoRefreshEnabled 
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                            : 'bg-white/10 text-white/70 border border-white/20'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={autoRefreshEnabled ? 'Desactivar actualización automática' : 'Activar actualización automática'}
                                >
                                    {autoRefreshEnabled ? '🔄 Auto' : '⏸️ Manual'}
                                </motion.button>

                                <motion.button
                            onClick={() => fetchLeads(true)}
                            disabled={isLoading}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                                isLoading 
                                            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                    }`}
                                    whileHover={!isLoading ? { scale: 1.05, y: -2 } : {}}
                                    whileTap={!isLoading ? { scale: 0.95 } : {}}
                        >
                            {isLoading ? (
                                        <>
                                            <motion.div
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            <span>Actualizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiRefreshCw className="w-4 h-4" />
                                            <span>Actualizar</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Estadísticas */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-6"
                        >
                            {[
                                { 
                                    label: 'Leads Reales', 
                                    value: realLeadsCount, 
                                    icon: FiCheckCircle, 
                                    gradient: 'from-green-500 to-emerald-600',
                                    description: 'Verificados'
                                },
                                { 
                                    label: 'Empresas', 
                                    value: filteredLeads.length, 
                                    icon: FiBuilding, 
                                    gradient: 'from-blue-500 to-cyan-600',
                                    description: 'Disponibles'
                                },
                                { 
                                    label: 'Categorías', 
                                    value: categories.length, 
                                    icon: FiTarget, 
                                    gradient: 'from-purple-500 to-pink-600',
                                    description: 'Diferentes'
                                },
                                { 
                                    label: 'Actualización', 
                                    value: autoRefreshEnabled ? '30s' : 'Manual', 
                                    icon: FiClock, 
                                    gradient: 'from-orange-500 to-red-600',
                                    description: 'Frecuencia'
                                }
                            ].map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                                    >
                                        <GlassCard className="text-center">
                                            <motion.div
                                                className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-4`}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Icon className="w-8 h-8 text-white" />
                                            </motion.div>
                                            <p className="text-white text-2xl font-bold mb-1">{stat.value}</p>
                                            <p className="text-white/70 text-sm">{stat.label}</p>
                                            <p className="text-white/50 text-xs">{stat.description}</p>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Información de leads reales */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                        >
                            <GlassCard className="border-green-500/30 bg-green-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            <FiCheckCircle className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Leads Reales Verificados</h3>
                                            <p className="text-green-200 text-sm">
                                                Datos extraídos de sitios web paraguayos oficiales
                    </p>
                    {autoRefreshEnabled && leads.length > 0 && (
                                                <p className="text-green-300 text-xs mt-1">
                            🔄 Actualización automática cada 30s
                        </p>
                    )}
                </div>
            </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold text-white">{realLeadsCount}</span>
                                        <p className="text-green-200 text-sm">Contactos disponibles</p>
                        </div>
                    </div>
                            </GlassCard>
                        </motion.div>

                        {/* Filtros y Búsqueda */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            <GlassCard>
                                <div className="flex items-center space-x-4 mb-6">
                                    <motion.div
                                        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <FiFilter className="w-4 h-4 text-white" />
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-white">Filtrar y Buscar</h3>
                    </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Búsqueda */}
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">
                                            Buscar empresas
                                        </label>
                                        <div className="relative">
                                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                                            <motion.input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                                                placeholder="Buscar por empresa, email o ciudad..."
                                                whileFocus={{ scale: 1.02 }}
                                            />
                </div>
            </div>

                                    {/* Categorías */}
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">
                                            Categoría
                                        </label>
                                        <motion.select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                                            whileFocus={{ scale: 1.02 }}
                                        >
                                            <option value="all" className="bg-slate-800">Todas las categorías</option>
                                            {categories.map(category => (
                                                <option key={category} value={category} className="bg-slate-800 capitalize">
                                                    {category?.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </motion.select>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Lista de Leads */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.6 }}
                            className="space-y-6"
                        >
            {filteredLeads.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0, duration: 0.6 }}
                                >
                                    <GlassCard className="text-center py-12">
                                        <motion.div
                                            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            <FiUserPlus className="w-10 h-10 text-white" />
                                        </motion.div>
                                        <h2 className="text-2xl font-semibold text-white mb-2">
                                            {searchTerm || selectedCategory !== 'all' 
                                                ? 'No se encontraron leads con esos filtros'
                                                : 'No tienes leads reales todavía'
                                            }
                    </h2>
                                        <p className="text-white/70 mb-6">
                                            {searchTerm || selectedCategory !== 'all'
                                                ? 'Intenta cambiar los filtros de búsqueda'
                                                : 'Usa el Buscador de Leads Reales para encontrar empresas paraguayas que necesitan financiamiento.'
                                            }
                    </p>
                                        
                                        {!searchTerm && selectedCategory === 'all' && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 max-w-md mx-auto">
                                                <h3 className="font-semibold text-blue-300 mb-3">¿Cómo funciona?</h3>
                                                <ul className="text-sm text-blue-200 text-left space-y-2">
                                                    <li className="flex items-center space-x-2">
                                                        <FiGlobe className="w-4 h-4 text-blue-400" />
                                                        <span>Extraemos datos de sitios web paraguayos</span>
                                                    </li>
                                                    <li className="flex items-center space-x-2">
                                                        <FiCheckCircle className="w-4 h-4 text-green-400" />
                                                        <span>Verificamos la información automáticamente</span>
                                                    </li>
                                                    <li className="flex items-center space-x-2">
                                                        <FiTarget className="w-4 h-4 text-purple-400" />
                                                        <span>Te mostramos empresas que necesitan financiamiento</span>
                                                    </li>
                        </ul>
                    </div>
                                        )}
                                    </GlassCard>
                                </motion.div>
            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {filteredLeads.map((lead, index) => (
                                            <motion.div
                                                key={lead.id || index}
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -50 }}
                                                transition={{ delay: 1.0 + index * 0.1, duration: 0.6 }}
                                                layout
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.02, y: -5 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <GlassCard className="h-full">
                                                        {/* Header de la tarjeta */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <motion.div
                                                                className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center space-x-2"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                <FiCheckCircle className="w-3 h-3 text-white" />
                                                                <span className="text-white text-xs font-medium">Verificado</span>
                                                            </motion.div>
                                                            
                                                            <div className="flex items-center space-x-2">
                                                                <motion.button
                                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <FiEye className="w-4 h-4 text-white" />
                                                                </motion.button>
                                                                
                                                                <motion.button
                                                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-300"
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <FiHeart className="w-4 h-4 text-red-400" />
                                                                </motion.button>
                        </div>
                                                        </div>

                                                        {/* Información principal */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center space-x-3">
                                                                <motion.div
                                                                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                                >
                                                                    <FiBuilding className="w-6 h-6 text-white" />
                                                                </motion.div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-white font-semibold text-lg">
                                                                        {lead.contact?.company_name || 'Empresa sin nombre'}
                                                                    </h3>
                                                                    {lead.contact?.category && (
                                                                        <p className="text-white/60 text-sm capitalize">
                                                                            {lead.contact.category.replace('_', ' ')}
                                                                        </p>
                                                                    )}
                                                    </div>
                                                </div>

                                                            <div className="space-y-3">
                                                                {lead.contact?.email && (
                                                                    <div className="flex items-center space-x-3">
                                                                        <FiMail className="w-4 h-4 text-blue-400" />
                                                                        <span className="text-white/80 text-sm">{lead.contact.email}</span>
                                                </div>
                                                                )}
                                                                
                                                                {lead.contact?.phone && (
                                                                    <div className="flex items-center space-x-3">
                                                                        <FiPhone className="w-4 h-4 text-green-400" />
                                                                        <span className="text-white/80 text-sm">{lead.contact.phone}</span>
                                                    </div>
                                                )}
                                                                
                                                                {lead.contact?.city && (
                                                                    <div className="flex items-center space-x-3">
                                                                        <FiMapPin className="w-4 h-4 text-purple-400" />
                                                                        <span className="text-white/80 text-sm">{lead.contact.city}</span>
                </div>
            )}

                                                                {lead.contact?.website && (
                                                                    <div className="flex items-center space-x-3">
                                                                        <FiGlobe className="w-4 h-4 text-cyan-400" />
                                                                        <a 
                                                                            href={lead.contact.website} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="text-cyan-300 text-sm hover:text-cyan-200 transition-colors"
                                                                        >
                                                                            Sitio web
                                                                        </a>
                            </div>
                                                                )}
                        </div>

                                                            {lead.contact?.description && (
                                                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                                                    <p className="text-white/80 text-sm">
                                                                        {lead.contact.description}
                                                                    </p>
                            </div>
                                                            )}

                                                            {/* Botón de contacto */}
                                                            <motion.button
                                                                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <FiMail className="w-4 h-4" />
                                                                <span>Contactar Empresa</span>
                                                            </motion.button>
                        </div>
                                                    </GlassCard>
                                                </motion.div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                    </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </AnimatedBackground>
        </div>
    );
};

export default LeadsPage; 