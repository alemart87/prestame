'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { lenderService, getLeadsForLender } from '../../../services/api';
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
  FiXCircle,
  FiAlertCircle,
  FiClipboard,
  FiCalendar,
  FiMessageSquare,
  FiSend,
  FiBuilding, 
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiStar,
  FiFilter,
  FiSearch,
  FiEye,
  FiEdit,
  FiHeart,
  FiClock,
  FiShield,
  FiMoreVertical,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiList,
  FiGrid,
  FiPlusCircle,
  FiTrash2,
  FiEdit3,
  FiSave,
  FiX,
  FiCreditCard,
  FiUser,
  FiBrain
} from 'react-icons/fi';
import AnimatedBackground from '../../../components/AnimatedBackground';
import GlassCard from '../../../components/GlassCard';
import AppNavbar from '../../../components/AppNavbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';

// Definición de estados de leads
const LEAD_STATUSES = {
  new: { 
    label: 'Nuevo', 
    color: 'blue', 
    icon: FiUserPlus,
    description: 'Lead recién adquirido' 
  },
  pending: { 
    label: 'Pendiente', 
    color: 'orange', 
    icon: FiClock,
    description: 'Pendiente de gestión' 
  },
  suitable: { 
    label: 'Apto', 
    color: 'green', 
    icon: FiCheckCircle,
    description: 'Apto para crédito' 
  },
  not_suitable: { 
    label: 'No Apto', 
    color: 'red', 
    icon: FiXCircle,
    description: 'No apto para crédito' 
  },
  follow_up: { 
    label: 'Seguimiento', 
    color: 'purple', 
    icon: FiCalendar,
    description: 'Requiere seguimiento' 
  },
  closed: { 
    label: 'Cerrado', 
    color: 'gray', 
    icon: FiClipboard,
    description: 'Proceso finalizado' 
  }
};

const LeadsPage = () => {
    const { user, profile, loading: userLoading } = useAuth();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: 'all',
        source: 'all'
    });
    const [followUpDate, setFollowUpDate] = useState(new Date());
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentRef = useRef(null);
    const router = useRouter();

    // Función para cargar leads
    const fetchLeads = async (showToast = false) => {
        console.log("🔍 fetchLeads llamada");
        
        if (user?.user_type !== 'lender') {
            console.log("❌ Usuario no es prestamista");
            return;
        }
        
        setIsLoading(true);
        try {
            // Usar filtros
            const filterParams = {};
            if (filters.status !== 'all') filterParams.status = filters.status;
            if (searchTerm) filterParams.search = searchTerm;
            
            console.log("📡 Llamando a getLeadsForLender...");
            const fetchedLeads = await getLeadsForLender(filterParams);
            console.log("✅ Leads obtenidos del API:", fetchedLeads);
            setLeads(fetchedLeads || []);
            setLastUpdated(new Date());
            if (showToast) {
                toast.success(`✅ ${(fetchedLeads || []).length} leads cargados correctamente`);
            }
        } catch (error) {
            console.error("❌ Error al cargar los leads:", error);
            toast.error('❌ No se pudieron cargar los leads. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar leads automáticamente al entrar
    useEffect(() => {
        if (!userLoading && user?.user_type === 'lender') {
                fetchLeads();
                // Toast de bienvenida solo la primera vez
                setTimeout(() => {
                toast.success('✅ CRM de Leads cargado. Gestiona tus contactos eficientemente.', {
                        autoClose: 4000
                    });
                }, 1000);
        } else if (!userLoading) {
            setIsLoading(false);
        }
    }, [user, userLoading]);

    // Auto-refresh cada 30 segundos si está habilitado
    useEffect(() => {
        if (autoRefreshEnabled && !isLoading && user?.user_type === 'lender') {
            const interval = setInterval(() => {
                fetchLeads();
            }, 30000); // 30 segundos

            return () => clearInterval(interval);
        }
    }, [autoRefreshEnabled, isLoading, user]);

    // Función para abrir detalle de lead
    const openLeadDetail = (lead) => {
        setSelectedLead(lead);
        setIsDetailOpen(true);
    };

    // Función para cerrar detalle de lead
    const closeLeadDetail = () => {
        setIsDetailOpen(false);
        setSelectedLead(null);
    };

    // Función para actualizar estado de lead
    const updateLeadStatus = async (leadId, newStatus, date = null) => {
        setIsSubmitting(true);
        try {
            await lenderService.updateLeadStatus(leadId, newStatus, date ? date.toISOString() : null);
            
            // Actualizar lead en el estado local
            setLeads(prevLeads => 
                prevLeads.map(lead => 
                    lead.id === leadId 
                        ? {...lead, status: newStatus, 
                           notes: newStatus === 'follow_up' && date 
                            ? JSON.stringify({
                                ...(lead.notes ? JSON.parse(lead.notes) : {}),
                                follow_up_date: date.toISOString()
                              })
                            : lead.notes
                          } 
                        : lead
                )
            );
            
            if (selectedLead?.id === leadId) {
                setSelectedLead(prev => ({
                    ...prev, 
                    status: newStatus,
                    notes: newStatus === 'follow_up' && date 
                        ? JSON.stringify({
                            ...(prev.notes ? JSON.parse(prev.notes) : {}),
                            follow_up_date: date.toISOString()
                          })
                        : prev.notes
                }));
            }
            
            toast.success(`✅ Estado actualizado a "${LEAD_STATUSES[newStatus].label}"`);
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            toast.error('No se pudo actualizar el estado. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para añadir comentario
    const addComment = async (leadId) => {
        if (!newComment.trim()) {
            toast.warning('El comentario no puede estar vacío');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await lenderService.addLeadComment(leadId, newComment);
            
            // Actualizar comentarios en el estado local
            const updatedLead = {...selectedLead};
            let notesData = {};
            
            try {
                notesData = updatedLead.notes ? JSON.parse(updatedLead.notes) : {};
            } catch (e) {
                notesData = { comments: [{ text: updatedLead.notes, date: new Date().toISOString() }] };
            }
            
            if (!notesData.comments) {
                notesData.comments = [];
            }
            
            notesData.comments.push({
                text: newComment,
                date: new Date().toISOString(),
                user: `${user.first_name} ${user.last_name}`
            });
            
            updatedLead.notes = JSON.stringify(notesData);
            setSelectedLead(updatedLead);
            
            // También actualizar en la lista
            setLeads(prevLeads => 
                prevLeads.map(lead => 
                    lead.id === leadId ? updatedLead : lead
                )
            );
            
            setNewComment('');
            toast.success('✅ Comentario agregado correctamente');
            
            // Hacer scroll hacia abajo en el área de comentarios
            if (commentRef.current) {
                commentRef.current.scrollTop = commentRef.current.scrollHeight;
            }
        } catch (error) {
            console.error("Error al agregar comentario:", error);
            toast.error('No se pudo agregar el comentario. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Verificar si un lead tiene seguimiento para hoy
    const isFollowUpToday = (lead) => {
        if (lead.status !== 'follow_up' || !lead.notes) return false;
        
        try {
            const notesData = JSON.parse(lead.notes);
            if (!notesData.follow_up_date) return false;
            
            const followUpDate = new Date(notesData.follow_up_date);
            const today = new Date();
            
            return followUpDate.getDate() === today.getDate() &&
                   followUpDate.getMonth() === today.getMonth() &&
                   followUpDate.getFullYear() === today.getFullYear();
        } catch (e) {
            return false;
        }
    };

    // Obtener la fecha de seguimiento de un lead
    const getFollowUpDate = (lead) => {
        if (!lead.notes) return null;
        
        try {
            const notesData = JSON.parse(lead.notes);
            if (!notesData.follow_up_date) return null;
            
            return new Date(notesData.follow_up_date);
        } catch (e) {
            return null;
        }
    };

    // Obtener los comentarios de un lead
    const getComments = (lead) => {
        if (!lead.notes) return [];
        
        try {
            const notesData = JSON.parse(lead.notes);
            return notesData.comments || [];
        } catch (e) {
            return [];
        }
    };

    // Filtrar leads según criterios de búsqueda y filtros
    const filteredLeads = leads.filter(lead => {
        // Filtro por término de búsqueda
        const matchesSearch = !searchTerm || 
            lead.contact?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtro por categoría
        const matchesCategory = selectedCategory === 'all' || 
            lead.contact?.category === selectedCategory;
        
        // Filtro por estado
        const matchesStatus = filters.status === 'all' || lead.status === filters.status;
        
        // Filtro por seguimiento (para leads con fecha de seguimiento hoy)
        const matchesFollowUpToday = filters.dateRange !== 'today' || isFollowUpToday(lead);
        
        // Filtro por fuente (AI o reales)
        const matchesSource = filters.source === 'all' || 
            (filters.source === 'ai' && lead.contact?.ai_generated) ||
            (filters.source === 'real' && lead.contact?.real_data);
            
        return matchesSearch && matchesCategory && matchesStatus && matchesFollowUpToday && matchesSource;
    });

    // Contar leads por estado
    const leadCountsByStatus = Object.keys(LEAD_STATUSES).reduce((acc, status) => {
        acc[status] = leads.filter(lead => lead.status === status).length;
        return acc;
    }, {});
    
    // Contar leads con seguimiento para hoy
    const todayFollowUpsCount = leads.filter(isFollowUpToday).length;

    // Contar leads reales vs AI
    const realLeadsCount = leads.filter(lead => lead.contact?.real_data === true).length;
    const aiLeadsCount = leads.filter(lead => lead.contact?.ai_generated === true).length;

    // Obtener categorías únicas
    const categories = [...new Set(leads
        .filter(lead => lead.contact?.real_data === true || lead.contact?.ai_generated === true)
        .map(lead => lead.contact?.category)
        .filter(Boolean)
    )];

    // Solo mostrar spinner de pantalla completa en la carga inicial
    if ((isLoading && leads.length === 0) || userLoading) {
        return (
            <AnimatedBackground particleCount={15}>
                <AppNavbar />
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
                <AppNavbar />
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
                    {/* Detalle del Lead */}
                    <AnimatePresence>
                        {isDetailOpen && selectedLead && (
                            <LeadDetailModal 
                                lead={selectedLead} 
                                onClose={closeLeadDetail}
                                updateStatus={updateLeadStatus}
                                addComment={addComment}
                                newComment={newComment}
                                setNewComment={setNewComment}
                                followUpDate={followUpDate}
                                setFollowUpDate={setFollowUpDate}
                                isSubmitting={isSubmitting}
                                getComments={getComments}
                                getFollowUpDate={getFollowUpDate}
                                commentRef={commentRef}
                            />
                        )}
                    </AnimatePresence>
                    
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
                                    CRM de Leads
                                </motion.h1>
                                <motion.p 
                                    className="text-white/70 text-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    Gestiona y haz seguimiento a tus prospectos
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
                                className="flex items-center space-x-4 mt-4 lg:mt-0"
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

                                <div className="flex space-x-2">
                                    <motion.button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-l-lg ${viewMode === 'grid' 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-white/10 text-white/70'} transition-all duration-300`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiGrid className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-r-lg ${viewMode === 'list' 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-white/10 text-white/70'} transition-all duration-300`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiList className="w-5 h-5" />
                                    </motion.button>
                                </div>

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
                            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
                        >
                            {[
                                { 
                                    label: 'Total Leads', 
                                    value: filteredLeads.length, 
                                    icon: FiUsers, 
                                    gradient: 'from-blue-500 to-cyan-600',
                                    description: 'Disponibles'
                                },
                                { 
                                    label: 'Nuevos', 
                                    value: leadCountsByStatus.new || 0, 
                                    icon: FiUserPlus, 
                                    gradient: 'from-indigo-500 to-blue-600',
                                    description: 'Sin gestionar'
                                },
                                { 
                                    label: 'Pendientes', 
                                    value: leadCountsByStatus.pending || 0, 
                                    icon: FiClock, 
                                    gradient: 'from-orange-500 to-amber-600',
                                    description: 'En gestión'
                                },
                                { 
                                    label: 'Aptos', 
                                    value: leadCountsByStatus.suitable || 0, 
                                    icon: FiCheckCircle, 
                                    gradient: 'from-green-500 to-emerald-600',
                                    description: 'Para crédito'
                                },
                                { 
                                    label: 'Seguimientos', 
                                    value: todayFollowUpsCount, 
                                    icon: FiCalendar, 
                                    gradient: 'from-purple-500 to-pink-600',
                                    description: 'Para hoy'
                                },
                                { 
                                    label: 'No Aptos', 
                                    value: leadCountsByStatus.not_suitable || 0, 
                                    icon: FiXCircle, 
                                    gradient: 'from-red-500 to-pink-600',
                                    description: 'Rechazados'
                                }
                            ].map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                                        onClick={() => {
                                            if (stat.label === 'Nuevos') 
                                                setFilters(prev => ({...prev, status: 'new'}));
                                            else if (stat.label === 'Pendientes') 
                                                setFilters(prev => ({...prev, status: 'pending'}));
                                            else if (stat.label === 'Aptos') 
                                                setFilters(prev => ({...prev, status: 'suitable'}));
                                            else if (stat.label === 'No Aptos') 
                                                setFilters(prev => ({...prev, status: 'not_suitable'}));
                                            else if (stat.label === 'Seguimientos') {
                                                setFilters(prev => ({...prev, status: 'follow_up', dateRange: 'today'}));
                                            }
                                            else setFilters(prev => ({...prev, status: 'all', dateRange: 'all'}));
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <GlassCard className={`text-center ${filters.status === (
                                            stat.label === 'Nuevos' ? 'new' :
                                            stat.label === 'Pendientes' ? 'pending' :
                                            stat.label === 'Aptos' ? 'suitable' :
                                            stat.label === 'No Aptos' ? 'not_suitable' :
                                            stat.label === 'Seguimientos' && filters.dateRange === 'today' ? 'follow_up' : ''
                                        ) ? 'border-2 border-white' : ''}`}>
                                            <motion.div
                                                className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3`}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </motion.div>
                                            <p className="text-white text-xl font-bold mb-1">{stat.value}</p>
                                            <p className="text-white/70 text-sm">{stat.label}</p>
                                            <p className="text-white/50 text-xs">{stat.description}</p>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
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
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Búsqueda */}
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">
                                            Buscar leads
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

                                    {/* Estado */}
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">
                                            Estado
                                        </label>
                                        <motion.select
                                            value={filters.status}
                                            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                                            whileFocus={{ scale: 1.02 }}
                                        >
                                            <option value="all" className="bg-slate-800">Todos los estados</option>
                                            {Object.entries(LEAD_STATUSES).map(([value, status]) => (
                                                <option key={value} value={value} className="bg-slate-800">
                                                    {status.label}
                                                </option>
                                            ))}
                                        </motion.select>
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

                                    {/* Fuente */}
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">
                                            Origen
                                        </label>
                                        <motion.select
                                            value={filters.source}
                                            onChange={(e) => setFilters(prev => ({...prev, source: e.target.value}))}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                                            whileFocus={{ scale: 1.02 }}
                                        >
                                            <option value="all" className="bg-slate-800">Todos los orígenes</option>
                                            <option value="real" className="bg-slate-800">Datos reales</option>
                                            <option value="ai" className="bg-slate-800">Generados por IA</option>
                                        </motion.select>
                                    </div>
                                </div>

                                {/* Filtros activos */}
                                {(filters.status !== 'all' || filters.dateRange !== 'all' || filters.source !== 'all' || selectedCategory !== 'all' || searchTerm) && (
                                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                                        <span className="text-white/70 text-sm">Filtros activos:</span>
                                        
                                        {filters.status !== 'all' && (
                                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs flex items-center">
                                                Estado: {LEAD_STATUSES[filters.status].label}
                                                <button 
                                                    onClick={() => setFilters(prev => ({...prev, status: 'all'}))}
                                                    className="ml-2 hover:text-red-300"
                                                >
                                                    ×
                        </button>
                                            </span>
                                        )}
                                        
                                        {filters.dateRange !== 'all' && (
                                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs flex items-center">
                                                Seguimientos: Hoy
                        <button
                                                    onClick={() => setFilters(prev => ({...prev, dateRange: 'all'}))}
                                                    className="ml-2 hover:text-red-300"
                                                >
                                                    ×
                        </button>
                                            </span>
                                        )}
                                        
                                        {filters.source !== 'all' && (
                                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs flex items-center">
                                                Origen: {filters.source === 'real' ? 'Datos reales' : 'IA'}
                                                <button 
                                                    onClick={() => setFilters(prev => ({...prev, source: 'all'}))}
                                                    className="ml-2 hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        
                                        {selectedCategory !== 'all' && (
                                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs flex items-center">
                                                Categoría: {selectedCategory?.replace('_', ' ')}
                                                <button 
                                                    onClick={() => setSelectedCategory('all')}
                                                    className="ml-2 hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        
                                        {searchTerm && (
                                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs flex items-center">
                                                Búsqueda: {searchTerm}
                                                <button 
                                                    onClick={() => setSearchTerm('')}
                                                    className="ml-2 hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        
                                        <button 
                                            onClick={() => {
                                                setFilters({status: 'all', dateRange: 'all', source: 'all'});
                                                setSelectedCategory('all');
                                                setSearchTerm('');
                                            }}
                                            className="text-red-300 hover:text-red-200 text-xs ml-2"
                                        >
                                            Limpiar todos
                                        </button>
                    </div>
                                )}
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
                                            {searchTerm || selectedCategory !== 'all' || filters.status !== 'all'
                                                ? 'No se encontraron leads con esos filtros'
                                                : 'No tienes leads todavía'
                                            }
                                        </h2>
                                        <p className="text-white/70 mb-6">
                                            {searchTerm || selectedCategory !== 'all' || filters.status !== 'all'
                                                ? 'Intenta cambiar los filtros de búsqueda'
                                                : 'Adquiere leads usando los paquetes disponibles o busca leads con IA.'
                                            }
                                        </p>
                                        
                                        {!searchTerm && selectedCategory === 'all' && filters.status === 'all' && (
                                            <div className="flex justify-center space-x-4">
                                                <motion.button
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push('/subscriptions')}
                                                >
                                                    <FiCreditCard className="w-4 h-4" />
                                                    <span>Ver Planes</span>
                                                </motion.button>
                                                
                                                <motion.button
                                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push('/ai-lead-finder')}
                                                >
                                                    <FiTarget className="w-4 h-4" />
                                                    <span>Buscar con IA</span>
                                                </motion.button>
                                            </div>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Vista de Grid */}
                                    {viewMode === 'grid' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            <AnimatePresence>
                                                {filteredLeads.map((lead, index) => (
                                                    <motion.div
                                                        key={lead.id || index}
                                                        initial={{ opacity: 0, y: 50 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -50 }}
                                                        transition={{ delay: 1.0 + index * 0.05, duration: 0.6 }}
                                                        layout
                                                    >
                                                        <motion.div
                                                            whileHover={{ scale: 1.02, y: -5 }}
                                                            transition={{ duration: 0.3 }}
                                                            onClick={() => openLeadDetail(lead)}
                                                            className="cursor-pointer"
                                                        >
                                                            <GlassCard className={`h-full relative ${
                                                                lead.status === 'suitable' ? 'border-l-4 border-l-green-500' :
                                                                lead.status === 'not_suitable' ? 'border-l-4 border-l-red-500' :
                                                                lead.status === 'follow_up' ? 'border-l-4 border-l-purple-500' :
                                                                lead.status === 'pending' ? 'border-l-4 border-l-orange-500' : ''
                                                            }`}>
                                                                {/* Status Badge */}
                                                                <div className="absolute right-4 top-4">
                                                                    <div 
                                                                        className={`px-3 py-1 rounded-full text-xs font-medium
                                                                            ${lead.status === 'new' ? 'bg-blue-500/20 text-blue-300' : 
                                                                            lead.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                                                                            lead.status === 'suitable' ? 'bg-green-500/20 text-green-300' :
                                                                            lead.status === 'not_suitable' ? 'bg-red-500/20 text-red-300' :
                                                                            lead.status === 'follow_up' ? 'bg-purple-500/20 text-purple-300' : 
                                                                            'bg-gray-500/20 text-gray-300'}`
                                                                        }
                                                                    >
                                                                        {LEAD_STATUSES[lead.status]?.label || 'Desconocido'}
                                                                    </div>
                                                                </div>

                                                                {/* Información principal */}
                                                                <div className="mt-2 space-y-4">
                                                                    <div className="flex items-center space-x-3">
                                                                        <motion.div
                                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center
                                                                                ${lead.status === 'new' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                                                                                lead.status === 'pending' ? 'bg-gradient-to-r from-orange-500 to-amber-600' :
                                                                                lead.status === 'suitable' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                                                                lead.status === 'not_suitable' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                                                                                lead.status === 'follow_up' ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 
                                                                                'bg-gradient-to-r from-gray-500 to-gray-600'}`
                                                                            }
                                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                                        >
                                                                            {lead.status && LEAD_STATUSES[lead.status] && (() => {
                                                                                const Icon = LEAD_STATUSES[lead.status].icon;
                                                                                return <Icon className="w-6 h-6 text-white" />;
                                                                            })()}
                                                                        </motion.div>
                                                                        <div className="flex-1">
                                                                            <h3 className="text-white font-semibold text-lg">
                                                                                {lead.contact?.company_name || lead.contact?.full_name || 'Lead sin nombre'}
                                                                            </h3>
                                                                            {lead.contact?.category && (
                                                                                <p className="text-white/60 text-sm capitalize">
                                                                                    {lead.contact.category.replace('_', ' ')}
                        </p>
                    )}
                </div>
            </div>

                                                                    <div className="space-y-3">
                                                                        {/* Email */}
                                                                        {lead.contact?.email && (
                                                                            <div className="flex items-center space-x-3">
                                                                                <FiMail className="w-4 h-4 text-blue-400" />
                                                                                <span className="text-white/80 text-sm">{lead.contact.email}</span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Teléfono */}
                                                                        {lead.contact?.phone && (
                                                                            <div className="flex items-center space-x-3">
                                                                                <FiPhone className="w-4 h-4 text-green-400" />
                                                                                <span className="text-white/80 text-sm">{lead.contact.phone}</span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Ubicación */}
                                                                        {lead.contact?.city && (
                                                                            <div className="flex items-center space-x-3">
                                                                                <FiMapPin className="w-4 h-4 text-purple-400" />
                                                                                <span className="text-white/80 text-sm">{lead.contact.city}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Seguimiento */}
                                                                    {isFollowUpToday(lead) && (
                                                                        <div className="mt-3 bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                                                                            <div className="flex items-center space-x-2">
                                                                                <FiCalendar className="w-4 h-4 text-purple-300" />
                        <div>
                                                                                    <p className="text-purple-300 text-xs">Seguimiento para hoy</p>
                                                                                    <p className="text-white text-sm font-medium">
                                                                                        {getFollowUpDate(lead)?.toLocaleDateString('es-PY')}
                            </p>
                        </div>
                    </div>
                    </div>
                                                                    )}

                                                                    {/* Información de préstamo */}
                                                                    {lead.loan_request && (
                                                                        <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                                                            <div className="flex justify-between items-center text-sm">
                                                                                <div>
                                                                                    <p className="text-white/50 text-xs">Monto</p>
                                                                                    <p className="text-white font-medium">
                                                                                        Gs. {lead.loan_request.amount?.toLocaleString()}
                                                                                    </p>
                </div>
                                                                                <div>
                                                                                    <p className="text-white/50 text-xs">Plazo</p>
                                                                                    <p className="text-white text-center">
                                                                                        {lead.loan_request.term_months}m
                                                                                    </p>
            </div>
                                                                                <div>
                                                                                    <p className="text-white/50 text-xs">Frecuencia</p>
                                                                                    <p className="text-white capitalize">
                                                                                        {lead.loan_request.payment_frequency?.slice(0, 3)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Comentarios recientes */}
                                                                    {getComments(lead)?.length > 0 && (
                                                                        <div className="mt-2 border-t border-white/10 pt-3">
                                                                            <p className="text-white/50 text-xs flex items-center">
                                                                                <FiMessageSquare className="w-3 h-3 mr-1" /> 
                                                                                Último comentario:
                                                                            </p>
                                                                            <p className="text-white/80 text-sm mt-1 line-clamp-2">
                                                                                {getComments(lead)[getComments(lead).length - 1]?.text}
                                                                            </p>
                    </div>
                                                                    )}

                                                                    {/* Score Final del prestatario (si está disponible) */}
                                                                    {lead.borrower_profile?.final_score && (
                                                                        <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <FiBrain className="w-4 h-4 text-purple-300" />
                                                                                    <span className="text-purple-300 text-sm font-medium">Score Final IA</span>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="text-white text-lg font-bold">{lead.borrower_profile.final_score.toFixed(1)}</p>
                                                                                    <p className="text-white/50 text-xs">
                                                                                        {lead.borrower_profile.final_score >= 80 ? '🏆 Excelente' :
                                                                                         lead.borrower_profile.final_score >= 70 ? '⭐ Muy Bueno' :
                                                                                         lead.borrower_profile.final_score >= 60 ? '👍 Bueno' :
                                                                                         lead.borrower_profile.final_score >= 40 ? '⚡ Regular' : '⚠️ Bajo'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Botón de gestión */}
                                                                    <div className="flex justify-center mt-4">
                                                                        <motion.button
                                                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center space-x-2 transition-all duration-300"
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                        >
                                                                            <FiEdit className="w-4 h-4" />
                                                                            <span>Gestionar Lead</span>
                                                                        </motion.button>
                </div>
                            </div>
                                                            </GlassCard>
                                                        </motion.div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                        </div>
                    )}

                                    {/* Vista de Lista */}
                                    {viewMode === 'list' && (
                                        <GlassCard>
                    <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-white/10">
                                                            <th className="px-4 py-3 text-left text-white/80 font-medium">Estado</th>
                                                            <th className="px-4 py-3 text-left text-white/80 font-medium">Empresa/Cliente</th>
                                                            <th className="px-4 py-3 text-left text-white/80 font-medium">Contacto</th>
                                                            <th className="px-4 py-3 text-left text-white/80 font-medium">Monto</th>
                                                            <th className="px-4 py-3 text-left text-white/80 font-medium">Seguimiento</th>
                                                            <th className="px-4 py-3 text-left text-white/80 font-medium">Acciones</th>
                                </tr>
                            </thead>
                                                    <tbody>
                                                        <AnimatePresence>
                                                            {filteredLeads.map((lead, index) => (
                                                                <motion.tr 
                                                                    key={lead.id || index}
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -20 }}
                                                                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                                                    onClick={() => openLeadDetail(lead)}
                                                                >
                                                                    {/* Estado */}
                                                                    <td className="px-4 py-3">
                                                                        <div 
                                                                            className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1
                                                                                ${lead.status === 'new' ? 'bg-blue-500/20 text-blue-300' : 
                                                                                lead.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                                                                                lead.status === 'suitable' ? 'bg-green-500/20 text-green-300' :
                                                                                lead.status === 'not_suitable' ? 'bg-red-500/20 text-red-300' :
                                                                                lead.status === 'follow_up' ? 'bg-purple-500/20 text-purple-300' : 
                                                                                'bg-gray-500/20 text-gray-300'}`
                                                                            }
                                                                        >
                                                                            {lead.status && LEAD_STATUSES[lead.status] && (() => {
                                                                                const Icon = LEAD_STATUSES[lead.status].icon;
                                                                                return <Icon className="w-3 h-3 mr-1" />;
                                                                            })()}
                                                                            <span>{LEAD_STATUSES[lead.status]?.label || 'Desconocido'}</span>
                                                                        </div>
                                                                    </td>

                                                                    {/* Empresa/Cliente */}
                                                                    <td className="px-4 py-3">
                                                    <div>
                                                                            <p className="text-white font-medium">
                                                                                {lead.contact?.company_name || lead.contact?.full_name || 'Lead sin nombre'}
                                                                            </p>
                                                                            {lead.contact?.category && (
                                                                                <p className="text-white/60 text-xs capitalize">
                                                                                    {lead.contact.category.replace('_', ' ')}
                                                                                </p>
                                                                            )}
                                                        </div>
                                                                    </td>

                                                                    {/* Contacto */}
                                                                    <td className="px-4 py-3">
                                                                        <div className="space-y-1">
                                                                            {lead.contact?.email && (
                                                                                <p className="text-white/80 text-sm flex items-center">
                                                                                    <FiMail className="w-3 h-3 text-blue-400 mr-1" />
                                                                                    {lead.contact.email}
                                                                                </p>
                                                                            )}
                                                                            {lead.contact?.phone && (
                                                                                <p className="text-white/80 text-sm flex items-center">
                                                                                    <FiPhone className="w-3 h-3 text-green-400 mr-1" />
                                                                                    {lead.contact.phone}
                                                                                </p>
                                                                            )}
                                                </div>
                                            </td>

                                                                    {/* Monto */}
                                                                    <td className="px-4 py-3">
                                                                        {lead.loan_request ? (
                                                                            <div>
                                                                                <p className="text-white font-medium">
                                                                                    Gs. {lead.loan_request.amount?.toLocaleString()}
                                                                                </p>
                                                                                <p className="text-white/60 text-xs">
                                                                                    {lead.loan_request.term_months} meses
                                                                                </p>
                                                </div>
                                                                        ) : (
                                                                            <span className="text-white/40">N/A</span>
                                                                        )}
                                            </td>

                                                                    {/* Seguimiento */}
                                                                    <td className="px-4 py-3">
                                                                        {isFollowUpToday(lead) ? (
                                                                            <div className="bg-purple-500/20 px-2 py-1 rounded text-purple-300 text-xs flex items-center">
                                                                                <FiCalendar className="w-3 h-3 mr-1" />
                                                                                <span>Hoy</span>
                                                </div>
                                                                        ) : lead.status === 'follow_up' ? (
                                                                            <div className="text-white/80 text-xs flex items-center">
                                                                                <FiCalendar className="w-3 h-3 mr-1" />
                                                                                {getFollowUpDate(lead)?.toLocaleDateString('es-PY') || 'Programado'}
                                                    </div>
                                                                        ) : (
                                                                            <span className="text-white/40">-</span>
                                                )}
                                            </td>

                                                                    {/* Acciones */}
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center space-x-2">
                                                                            <button 
                                                                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openLeadDetail(lead);
                                                                                }}
                                                                            >
                                                                                <FiEye className="w-4 h-4" />
                                                                            </button>
                                                                            
                                                                            {lead.contact?.email && (
                                                                                <a 
                                                                                    href={`mailto:${lead.contact.email}`}
                                                                                    className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-300 transition-colors"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <FiMail className="w-4 h-4" />
                                                                                </a>
                                                                            )}
                                                                            
                                                                            {lead.contact?.phone && (
                                                                                <a 
                                                                                    href={`tel:${lead.contact.phone}`}
                                                                                    className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 transition-colors"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <FiPhone className="w-4 h-4" />
                                                                                </a>
                                                                            )}
                                                </div>
                                            </td>
                                                                </motion.tr>
                                                            ))}
                                                        </AnimatePresence>
                                                    </tbody>
                                                </table>
                                                </div>
                                        </GlassCard>
                                    )}
                                </>
                            )}
                        </motion.div>
                                                </div>
                </div>
            </AnimatedBackground>
        </div>
    );
};

// Componente modal para detalles del lead
const LeadDetailModal = ({ 
    lead, 
    onClose, 
    updateStatus: updateLeadStatus, 
    addComment, 
    newComment, 
    setNewComment, 
    followUpDate, 
    setFollowUpDate,
    isSubmitting,
    getComments,
    getFollowUpDate,
    commentRef
}) => {
    return (
        <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div 
                className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                            ${lead.status === 'new' ? 'bg-blue-500' : 
                              lead.status === 'pending' ? 'bg-orange-500' :
                              lead.status === 'suitable' ? 'bg-green-500' :
                              lead.status === 'not_suitable' ? 'bg-red-500' :
                              lead.status === 'follow_up' ? 'bg-purple-500' : 'bg-gray-500'}`
                        }>
                            {lead.status && LEAD_STATUSES[lead.status] && (() => {
                                const Icon = LEAD_STATUSES[lead.status].icon;
                                return <Icon className="w-6 h-6 text-white" />;
                            })()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {lead.contact?.company_name || lead.contact?.full_name || 'Lead sin nombre'}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-white/60 text-sm">Estado:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    ${lead.status === 'new' ? 'bg-blue-500/20 text-blue-300' : 
                                      lead.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                                      lead.status === 'suitable' ? 'bg-green-500/20 text-green-300' :
                                      lead.status === 'not_suitable' ? 'bg-red-500/20 text-red-300' :
                                      lead.status === 'follow_up' ? 'bg-purple-500/20 text-purple-300' : 
                                      'bg-gray-500/20 text-gray-300'}`
                                }>
                                    {LEAD_STATUSES[lead.status]?.label || 'Desconocido'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                        onClick={onClose}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Contenido */}
                <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(90vh-80px)]">
                    {/* Información de contacto */}
                    <div className="md:col-span-2 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            {/* Información de contacto */}
                            <div>
                                <h3 className="text-white font-semibold mb-4 flex items-center">
                                    <FiUser className="mr-2" /> Información de contacto
                                </h3>
                                <div className="space-y-3 bg-white/5 p-4 rounded-xl">
                                    {lead.contact?.company_name && (
                                        <div className="flex items-start space-x-3">
                                            <FiBuilding className="w-4 h-4 text-blue-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Empresa</p>
                                                <p className="text-white">{lead.contact.company_name}</p>
                    </div>
                </div>
            )}

                                    {lead.contact?.full_name && (
                                        <div className="flex items-start space-x-3">
                                            <FiUser className="w-4 h-4 text-green-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Nombre</p>
                                                <p className="text-white">{lead.contact.full_name}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {(lead.contact?.email || lead.contact?.phone) && (
                                        <div className="flex items-start space-x-3">
                                            <FiMail className="w-4 h-4 text-purple-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Contacto</p>
                                                {lead.contact?.email && (
                                                    <p className="text-white">Email: {lead.contact.email}</p>
                                                )}
                                                {lead.contact?.phone && (
                                                    <p className="text-white">Teléfono: {lead.contact.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {(lead.contact?.city || lead.contact?.country) && (
                                        <div className="flex items-start space-x-3">
                                            <FiMapPin className="w-4 h-4 text-red-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Ubicación</p>
                                                <p className="text-white">
                                                    {[lead.contact?.city, lead.contact?.country]
                                                        .filter(Boolean).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {lead.contact?.category && (
                                        <div className="flex items-start space-x-3">
                                            <FiTarget className="w-4 h-4 text-amber-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Categoría</p>
                                                <p className="text-white capitalize">
                                                    {lead.contact.category.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {(lead.contact?.real_data || lead.contact?.ai_generated) && (
                                        <div className="flex items-start space-x-3">
                                            <FiShield className="w-4 h-4 text-cyan-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Origen</p>
                                                <p className="text-white">
                                                    {lead.contact?.real_data ? 'Datos reales verificados' : 'Generado por IA'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Información del préstamo */}
                            {lead.loan_request && (
                                <div>
                                    <h3 className="text-white font-semibold mb-4 flex items-center">
                                        <FiCreditCard className="mr-2" /> Información del préstamo
                    </h3>
                                    <div className="space-y-3 bg-white/5 p-4 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/70 text-xs">Monto solicitado</p>
                                                <p className="text-white text-lg font-semibold">
                                                    Gs. {lead.loan_request.amount?.toLocaleString()}
                                                </p>
                </div>
                                            <div>
                                                <p className="text-white/70 text-xs">Plazo</p>
                                                <p className="text-white">
                                                    {lead.loan_request.term_months} meses
                                                </p>
            </div>
                                            <div>
                                                <p className="text-white/70 text-xs">Frecuencia</p>
                                                <p className="text-white capitalize">
                                                    {lead.loan_request.payment_frequency}
                                                </p>
                            </div>
                        </div>
                                        
                                        <div>
                                            <p className="text-white/70 text-xs">Propósito</p>
                                            <p className="text-white">{lead.loan_request.purpose}</p>
                    </div>
                                    </div>
                                </div>
                            )}

                            {/* Comentarios */}
                            <div>
                                <h3 className="text-white font-semibold mb-4 flex items-center">
                                    <FiMessageSquare className="mr-2" /> Historial de seguimiento
                                </h3>
                                <div ref={commentRef} className="space-y-3 bg-white/5 p-4 rounded-xl max-h-60 overflow-y-auto">
                                    {getComments(lead).length > 0 ? (
                                        getComments(lead).map((comment, index) => (
                                            <div key={index} className="bg-white/10 p-3 rounded-lg">
                                                <div className="flex justify-between items-center text-xs text-white/50 mb-1">
                                                    <span>{comment.user || 'Usuario'}</span>
                                                    <span>{new Date(comment.date).toLocaleString('es-PY')}</span>
                                                </div>
                                                <p className="text-white/90">{comment.text}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-white/50 text-center py-4">
                                            No hay comentarios. Añade el primero para hacer seguimiento.
                                        </p>
                                    )}
                                </div>
                                
                                {/* Formulario para añadir comentario */}
                                <div className="mt-3 flex space-x-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Añadir comentario..."
                                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                addComment(lead.id);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => addComment(lead.id)}
                                        disabled={isSubmitting || !newComment.trim()}
                                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg p-2 transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <motion.div
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                        ) : (
                                            <FiSend className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Panel de acciones */}
                    <div className="border-l border-white/10 p-6 bg-white/5 overflow-y-auto">
                        <h3 className="text-white font-semibold mb-4">Gestión del Lead</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">
                                    Actualizar estado
                                </label>
                                <div className="space-y-2">
                                    {Object.entries(LEAD_STATUSES).map(([status, data]) => {
                                        const StatusIcon = data.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    if (status === 'follow_up') {
                                                        // No actualizar directamente para follow_up, debe seleccionar fecha
                                                    } else {
                                                        updateLeadStatus(lead.id, status);
                                                    }
                                                }}
                                                disabled={isSubmitting || lead.status === status}
                                                className={`w-full px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                                                    lead.status === status 
                                                    ? `bg-${data.color}-500/30 text-${data.color}-300 border border-${data.color}-500/50` 
                                                    : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'
                                                }`}
                                            >
                                                <StatusIcon className="w-4 h-4" />
                                                <span>{data.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Programar seguimiento */}
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">
                                    Programar seguimiento
                                </label>
                                <div className="space-y-3">
                                    <DatePicker
                                        selected={followUpDate}
                                        onChange={date => setFollowUpDate(date)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Seleccionar fecha"
                                    />
                                    
                                    {getFollowUpDate(lead) && (
                                        <div className="bg-purple-500/20 text-purple-300 p-3 rounded-lg border border-purple-500/30">
                                            <div className="flex items-center space-x-2">
                                                <FiCalendar className="w-4 h-4" />
                                                <div>
                                                    <p className="text-xs">Fecha de seguimiento programada</p>
                                                    <p className="font-medium">{getFollowUpDate(lead).toLocaleDateString('es-PY')}</p>
                                                </div>
                    </div>
                </div>
            )}
                                    
                                    <button
                                        onClick={() => updateLeadStatus(lead.id, 'follow_up', followUpDate)}
                                        disabled={isSubmitting}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiCalendar className="w-4 h-4" />
                                                <span>Programar seguimiento</span>
                                            </>
                                        )}
                                    </button>
        </div>
                            </div>
                            
                            {/* Información adicional */}
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-white font-medium mb-2">Información adicional</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">ID del lead:</span>
                                        <span className="text-white">{lead.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Fecha de creación:</span>
                                        <span className="text-white">
                                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-PY') : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Última actualización:</span>
                                        <span className="text-white">
                                            {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString('es-PY') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LeadsPage; 