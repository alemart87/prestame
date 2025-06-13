'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { lenderService, getLeadsForLender } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
  FiCpu,
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiShoppingCart
} from 'react-icons/fi';
import AnimatedBackground from '../../../components/AnimatedBackground';
import GlassCard from '../../../components/GlassCard';
import AppNavbar from '../../../components/AppNavbar';
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

// AGREGAR ESTA FUNCIÓN aquí, después de los imports
const formatCurrency = (amount) => {
  if (!amount) return 'Gs. 0';
  
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const LeadsPage = () => {
    const { user, profile, loading: userLoading, refreshProfile } = useAuth();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'grid' o 'list'
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [purchasingId, setPurchasingId] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: 'all',
        source: 'all',
        min_amount: '',
        max_amount: '',
        location: '',
        credit_score_min: ''
    });
    const [followUpDate, setFollowUpDate] = useState(new Date());
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentRef = useRef(null);
    const router = useRouter();
    const [loadingLeads, setLoadingLeads] = useState({}); // Asegúrate de que esté aquí
    const [dataSource, setDataSource] = useState('all'); // Nuevo estado para filtrar origen
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [purchasedLeads, setPurchasedLeads] = useState(new Set());
    const leadsPerPage = 10;

    // Agrega esto después de los estados para verificar
    useEffect(() => {
      console.log('loadingLeads state:', loadingLeads);
      console.log('leads:', leads);
    }, [loadingLeads, leads]);

    // Función para cargar leads
    const fetchLeads = async (showToast = false) => {
        console.log("🔍 fetchLeads llamada");
        
        if (user?.user_type !== 'lender') {
            console.log("❌ Usuario no es prestamista");
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const filterParams = {};
            if (filters.status !== 'all') filterParams.status = filters.status;
            if (searchTerm) filterParams.search = searchTerm;
            
            console.log("📡 Llamando a getLeadsForLender...");
            const fetchedLeads = await getLeadsForLender(filterParams);
            console.log("✅ Leads obtenidos del API:", fetchedLeads);
            
            // ✅ AGREGAR: Log detallado del primer lead
            if (fetchedLeads && fetchedLeads.length > 0) {
                console.log("🔍 Estructura del primer lead:", fetchedLeads[0]);
            }
            
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
                toast.info('Gestiona y adquiere nuevos leads para invertir.', {
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

    const handlePurchaseLead = async (leadId) => {
        try {
            console.log('Intentando comprar lead:', leadId);
            
            setLoadingLeads(prev => ({ ...prev, [leadId]: true }));
            
            // VERIFICAR CRÉDITOS PRIMERO
            if (!profile || profile.lead_credits <= 0) {
                toast.error('No tienes créditos suficientes. Te redirigimos a la página de suscripciones.');
                setTimeout(() => {
                    router.push('/subscriptions');
                }, 2000);
                return;
            }
            
            // INTENTAR COMPRAR EL LEAD
            const response = await lenderService.purchaseLead(leadId);
            
            if (response.success) {
                toast.success('¡Lead desbloqueado exitosamente!');
                
                // Actualizar la lista de leads
                await fetchLeads();
                
                // Actualizar el perfil para mostrar créditos actualizados
                await refreshProfile();
                
            } else {
                toast.error(response.message || 'Error al desbloquear el lead');
            }
            
        } catch (error) {
            console.error('Error purchasing lead:', error);
            
            if (error.message?.includes('insufficient credits') || 
                error.message?.includes('créditos insuficientes')) {
                toast.error('No tienes créditos suficientes. Te redirigimos a la página de suscripciones.');
                setTimeout(() => {
                    router.push('/subscriptions');
                }, 2000);
            } else {
                toast.error('Error al desbloquear el lead. Inténtalo de nuevo.');
            }
        } finally {
            setLoadingLeads(prev => ({ ...prev, [leadId]: false }));
        }
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
            (filters.source === 'real' && lead.contact?.real_data) ||
            (filters.source === 'purchased' && lead.is_purchased);
            
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
                                handlePurchaseLead={handlePurchaseLead}
                                purchasingId={purchasingId}
                                profile={profile}
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
                            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4"
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
                                },
                                { 
                                    label: 'Créditos', 
                                    value: profile?.lead_credits || 0, 
                                    icon: FiCreditCard, 
                                    gradient: 'from-teal-500 to-cyan-600',
                                    description: 'Para comprar leads'
                                }
                            ].map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                                        onClick={stat.label === 'Créditos' ? () => router.push('/subscriptions') : () => {
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
                                        <GlassCard className={`text-center ${
                                            stat.label === 'Nuevos' ? 'new' :
                                            stat.label === 'Pendientes' ? 'pending' :
                                            stat.label === 'Aptos' ? 'suitable' :
                                            stat.label === 'No Aptos' ? 'not_suitable' :
                                            stat.label === 'Seguimientos' && filters.dateRange === 'today' ? 'follow_up' :
                                            stat.label === 'Créditos' ? 'credits' : ''
                                        }`}>
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
                                            <option value="purchased" className="bg-slate-800">Leads Adquiridos</option>
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

                                                                {/* Información principal - SIEMPRE VISIBLE */}
                                                                <div className="mt-2 space-y-4">
                                                                    <div className="flex items-center space-x-3">
                                                                        <motion.div
                                                                            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                                        >
                                                                            <FiDollarSign className="w-6 h-6 text-white" />
                                                                        </motion.div>
                                                                        <div className="flex-1">
                                                                            <h3 className="text-white font-semibold text-lg">
                                                                                {formatCurrency(lead.amount)}
                                                                            </h3>
                                                                            <p className="text-white/60 text-sm">{lead.purpose}</p>
                                                                        </div>
                                                                        {/* Score siempre visible */}
                                                                        <div className="text-right">
                                                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                                lead.borrower_profile?.score >= 80 ? 'bg-green-500/20 text-green-300' :
                                                                                lead.borrower_profile?.score >= 60 ? 'bg-blue-500/20 text-blue-300' :
                                                                                lead.borrower_profile?.score >= 40 ? 'bg-yellow-500/20 text-yellow-300' :
                                                                                'bg-red-500/20 text-red-300'
                                                                            }`}>
                                                                                Score: {lead.borrower_profile?.score || 'N/A'}
                                                                            </div>
                </div>
            </div>

                                                                    {/* Información básica - SIEMPRE VISIBLE */}
                                                                    <div className="space-y-3 bg-white/5 p-4 rounded-xl">
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <p className="text-white/50">Plazo</p>
                                                                                <p className="text-white font-medium">{lead.term_months} meses</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-white/50">Frecuencia</p>
                                                                                <p className="text-white font-medium capitalize">{lead.payment_frequency}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-white/50">Ubicación</p>
                                                                                <p className="text-white font-medium">{lead.location?.city || 'N/A'}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-white/50">Empleo</p>
                                                                                <p className="text-white font-medium">{lead.borrower_profile?.employment_status || 'N/A'}</p>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Ratio deuda/ingreso si está disponible */}
                                                                        {lead.borrower_profile?.debt_to_income_ratio && (
                                                                            <div className="pt-2 border-t border-white/10">
                                                                                <p className="text-white/50 text-xs">Ratio Deuda/Ingreso</p>
                                                                                <div className="flex items-center space-x-2">
                                                                                    <div className="flex-1 bg-white/10 rounded-full h-2">
                                                                                        <div 
                                                                                            className={`h-2 rounded-full ${
                                                                                                lead.borrower_profile.debt_to_income_ratio <= 0.3 ? 'bg-green-500' :
                                                                                                lead.borrower_profile.debt_to_income_ratio <= 0.5 ? 'bg-yellow-500' :
                                                                                                'bg-red-500'
                                                                                            }`}
                                                                                            style={{ width: `${Math.min(lead.borrower_profile.debt_to_income_ratio * 100, 100)}%` }}
                                                                                        />
                                                                                    </div>
                                                                                    <span className="text-white text-xs font-medium">
                                                                                        {(lead.borrower_profile.debt_to_income_ratio * 100).toFixed(1)}%
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                        
                                                                    {/* Información de Contacto o Botón de Compra */}
                                                                    {lead.is_purchased ? (
                                                                        <div className="mt-4 space-y-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                                                                            <h4 className="font-semibold text-green-300 flex items-center">
                                                                                <FiCheckCircle className="mr-2"/> Contacto Desbloqueado
                                                                            </h4>
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center space-x-3">
                                                                                    <FiUser className="w-4 h-4 text-green-400" />
                                                                                    <span className="text-white/90 text-sm">{lead.contact?.full_name}</span>
                                                                                </div>
                                                                                <div className="flex items-center space-x-3">
                                                                                    <FiMail className="w-4 h-4 text-green-400" />
                                                                                    <a href={`mailto:${lead.contact?.email}`} className="text-green-300 hover:text-green-200 text-sm">
                                                                                        {lead.contact?.email}
                                                                                    </a>
                                                                                </div>
                                                                            <div className="flex items-center space-x-3">
                                                                                <FiPhone className="w-4 h-4 text-green-400" />
                                                                                    <a href={`tel:${lead.contact?.phone}`} className="text-green-300 hover:text-green-200 text-sm">
                                                                                        {lead.contact?.phone}
                                                                                    </a>
                                                                            </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="mt-4 space-y-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
                                                                            <h4 className="font-semibold text-purple-300 flex items-center">
                                                                                <FiLock className="mr-2"/> Información de Contacto
                                                                            </h4>
                                                                            <div className="space-y-2 text-white/60">
                                                                            <div className="flex items-center space-x-3">
                                                                                    <FiUser className="w-4 h-4" />
                                                                                    <span className="text-sm">████████ ████████</span>
                                                                            </div>
                                                                                <div className="flex items-center space-x-3">
                                                                                    <FiMail className="w-4 h-4" />
                                                                                    <span className="text-sm">████████@████.com</span>
                                                                                </div>
                                                                                <div className="flex items-center space-x-3">
                                                                                    <FiPhone className="w-4 h-4" />
                                                                                    <span className="text-sm">+595 ███ ███ ███</span>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <motion.button
                                                                                onClick={() => handlePurchaseLead(lead.id)}
                                                                                disabled={loadingLeads[lead.id] || false} // Asegurar que no sea undefined
                                                                                className={`
                                                                                  px-4 py-2 rounded-lg font-medium transition-all duration-200
                                                                                  ${loadingLeads[lead.id] 
                                                                                    ? 'bg-gray-500 text-white cursor-not-allowed opacity-50' 
                                                                                    : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                                                                                  }
                                                                                `}
                                                                            >
                                                                                {loadingLeads[lead.id] ? (
                                                                                    <>
                                                                                        <FiRefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                                                                                        Procesando...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <FiUnlock className="w-4 h-4 inline mr-2" />
                                                                                        Desbloquear
                                                                                    </>
                                                                                )}
                                                                            </motion.button>
                                                                    </div>
                                                                    )}

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
                                                                                    <FiCpu className="w-4 h-4 text-purple-300" />
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
                                                                        {lead.is_purchased ? (
                                                                        <div className="space-y-1">
                                                                                <p className="text-white/80 text-sm flex items-center">
                                                                                    <FiMail className="w-3 h-3 text-green-400 mr-2" />
                                                                                    {lead.contact?.email}
                                                                                </p>
                                                                                <p className="text-white/80 text-sm flex items-center">
                                                                                    <FiPhone className="w-3 h-3 text-green-400 mr-2" />
                                                                                    {lead.contact?.phone}
                                                                                </p>
                                                </div>
                                                                        ) : (
                                                                            <span className="text-white/40 italic">Bloqueado</span>
                                                                        )}
                                            </td>

                                                                    {/* Monto */}
                                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                                      <div className="flex items-center text-sm text-white">
                                                                        <FiDollarSign className="w-4 h-4 mr-1 text-green-400" />
                                                                        {lead.amount ? new Intl.NumberFormat('es-PY', {
                                                                          style: 'currency',
                                                                          currency: 'PYG',
                                                                          minimumFractionDigits: 0
                                                                        }).format(lead.amount) : 'N/A'}
                                                                      </div>
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
                                                                        {lead.is_purchased ? (
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
                                                                        ) : (
                                                                            <motion.button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handlePurchaseLead(lead.id);
                                                                                }}
                                                                                disabled={loadingLeads[lead.id] || false} // Asegurar que no sea undefined
                                                                                className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                whileHover={{ scale: 1.05 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                            >
                                                                                {loadingLeads[lead.id] ? (
                                                                                    <motion.div
                                                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                                                        animate={{ rotate: 360 }}
                                                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                                    />
                                                                                ) : (
                                                                                    <>
                                                                                        <FiCreditCard className="w-3 h-3" />
                                                                                        <span>Desbloquear</span>
                                                                                    </>
                                                                                )}
                                                                            </motion.button>
                                                                        )}
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
    commentRef,
    handlePurchaseLead,
    purchasingId,
    profile
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
                                {lead.is_purchased ? (
                                    <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-green-500/30">
                                        <div className="flex items-start space-x-3">
                                            <FiUser className="w-4 h-4 text-green-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Nombre Completo</p>
                                                <p className="text-white">{lead.contact?.full_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <FiMail className="w-4 h-4 text-green-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Email</p>
                                                <p className="text-white">{lead.contact?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <FiPhone className="w-4 h-4 text-green-400 mt-1" />
                                            <div>
                                                <p className="text-white/70 text-xs">Teléfono</p>
                                                <p className="text-white">{lead.contact?.phone}</p>
                                            </div>
                                        </div>
                                            </div>
                                ) : (
                                    <div className="space-y-4 bg-white/5 p-6 rounded-xl text-center border border-purple-500/30">
                                        <FiShield className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                                        <h4 className="text-lg font-semibold text-white">Información de Contacto Protegida</h4>
                                        <p className="text-white/70">Desbloquea este lead para ver el nombre, email y teléfono del solicitante.</p>
                                        <motion.button
                                            onClick={() => handlePurchaseLead(lead.id)}
                                            disabled={purchasingId === lead.id || (profile?.lead_credits || 0) < 1}
                                            className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {purchasingId === lead.id ? (
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                            ) : (
                                                <>
                                                    <FiCreditCard className="w-5 h-5" />
                                                    <span>Desbloquear Contacto (1 crédito)</span>
                                                </>
                                            )}
                                        </motion.button>
                                        <p className="text-center text-xs text-white/60">
                                            Créditos disponibles: {profile?.lead_credits || 0}
                                        </p>
                                        </div>
                                    )}
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
                                    <div className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                                        <input
                                            type="date"
                                            value={followUpDate.toISOString().split('T')[0]}
                                            onChange={(e) => setFollowUpDate(new Date(e.target.value))}
                                            className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            placeholder="Seleccionar fecha"
                                        />
                                    </div>
                                    
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