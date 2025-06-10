'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiDollarSign,
  FiUsers,
  FiSave,
  FiTrendingUp,
  FiStar,
  FiBriefcase,
  FiHome,
  FiHeart,
  FiTarget,
  FiShield,
  FiCheck,
  FiAlertCircle,
  FiEdit3
} from 'react-icons/fi';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import AppNavbar from '../../components/AppNavbar';

// Componente para mostrar el Score Katupyry
const ScoreDisplay = ({ score, showDetails = false }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita Mejora';
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <h3 className="text-white/90 text-sm font-medium mb-2">Score Katupyry</h3>
        <div className="relative w-24 h-24 mx-auto mb-3">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - score / 100) }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'} />
                <stop offset="100%" stopColor={score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{score}</span>
          </div>
        </div>
        <p className={`text-sm font-medium bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
          {getScoreLabel(score)}
        </p>
        {showDetails && (
          <p className="text-white/60 text-xs mt-1">
            {score >= 80 ? 'Acceso a las mejores tasas' :
             score >= 60 ? 'Buenas oportunidades disponibles' :
             score >= 40 ? 'Mejora tu perfil para más opciones' :
             'Completa tu información para mejorar'}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default function ProfilePage() {
  const { user, profile, updateProfile, isBorrower, isLender, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && profile) {
      // Llenar el formulario con los datos existentes
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('email', user.email);
      setValue('phone', user.phone);
      setValue('address', user.address);
      setValue('city', user.city);
      setValue('department', user.department);

      if (isBorrower && profile) {
        setValue('monthly_income', profile.monthly_income);
        setValue('monthly_expenses', profile.monthly_expenses);
        setValue('dependents', profile.dependents);
        setValue('hobbies', profile.hobbies);
        setValue('employment_status', profile.employment_status);
        setValue('job_title', profile.job_title);
        setValue('employer', profile.employer);
      }

      if (isLender && profile) {
        setValue('min_amount', profile.min_amount);
        setValue('max_amount', profile.max_amount);
        setValue('interest_rate', profile.interest_rate);
        setValue('payment_frequency_preference', profile.payment_frequency_preference);
        setValue('risk_tolerance', profile.risk_tolerance);
      }
    }
  }, [user, profile, authLoading, router, setValue, isBorrower, isLender]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Omitir el email de los datos a enviar
      const { email, ...userData } = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        department: data.department,
      };

      const profileData = {};

      if (isBorrower) {
        profileData.monthly_income = parseFloat(data.monthly_income) || null;
        profileData.monthly_expenses = parseFloat(data.monthly_expenses) || null;
        profileData.dependents = parseInt(data.dependents) || 0;
        profileData.hobbies = data.hobbies;
        profileData.employment_status = data.employment_status;
        profileData.job_title = data.job_title;
        profileData.employer = data.employer;
        
        // Calcular ratio de deuda a ingresos
        if (profileData.monthly_income && profileData.monthly_expenses) {
          profileData.debt_to_income_ratio = profileData.monthly_expenses / profileData.monthly_income;
        }
      }

      if (isLender) {
        profileData.min_amount = parseFloat(data.min_amount) || null;
        profileData.max_amount = parseFloat(data.max_amount) || null;
        profileData.interest_rate = parseFloat(data.interest_rate) || null;
        profileData.payment_frequency_preference = data.payment_frequency_preference;
        profileData.risk_tolerance = data.risk_tolerance;
      }

      const result = await updateProfile({
        user: userData,
        profile: profileData
      });

      if (result.success) {
        setSuccess('Perfil actualizado exitosamente');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const monthlyIncome = watch('monthly_income');
  const monthlyExpenses = watch('monthly_expenses');
  const debtToIncomeRatio = monthlyIncome && monthlyExpenses ? (monthlyExpenses / monthlyIncome) * 100 : 0;

  if (authLoading) {
    return (
      <AnimatedBackground particleCount={15}>
        <div className="flex justify-center items-center min-h-screen">
          <GlassCard className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white/80 text-lg">Cargando perfil...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <AppNavbar />
      
      <AnimatedBackground particleCount={25}>
        <div className="min-h-screen pt-20 px-4">
          <div className="max-w-6xl mx-auto space-y-8">
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
                  Mi Perfil
                </motion.h1>
                <motion.p 
                  className="text-white/70 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {isBorrower ? 'Completa tu información para mejorar tu Score Katupyry' : 'Configura tus preferencias de préstamo'}
                </motion.p>
              </div>
              
              {profile && isBorrower && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <ScoreDisplay score={profile.score || 0} showDetails={true} />
                </motion.div>
              )}
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {/* Mensajes de estado */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center space-x-3"
                  >
                    <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-4 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center space-x-3"
                  >
                    <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-200 text-sm">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Información Personal */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <GlassCard>
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FiUser className="w-5 h-5 text-white" />
                    </motion.div>
                    Información Personal
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Nombre
                      </label>
                      <motion.input
                        {...register('first_name', { required: 'El nombre es requerido' })}
                        type="text"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="Tu nombre"
                        whileFocus={{ scale: 1.02 }}
                      />
                      <AnimatePresence>
                        {errors.first_name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                            <span>{errors.first_name.message}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Apellido
                      </label>
                      <motion.input
                        {...register('last_name', { required: 'El apellido es requerido' })}
                        type="text"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="Tu apellido"
                        whileFocus={{ scale: 1.02 }}
                      />
                      <AnimatePresence>
                        {errors.last_name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                            <span>{errors.last_name.message}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                    >
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Correo Electrónico
                      </label>
                      <motion.input
                        {...register('email')}
                        type="email"
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                        placeholder="tu@email.com"
                      />
                      <p className="mt-1 text-white/50 text-xs">El correo no se puede modificar</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                    >
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Teléfono
                      </label>
                      <motion.input
                        {...register('phone', { required: 'El teléfono es requerido' })}
                        type="tel"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="0981 123 456"
                        whileFocus={{ scale: 1.02 }}
                      />
                      <AnimatePresence>
                        {errors.phone && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                            <span>{errors.phone.message}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1, duration: 0.6 }}
                      className="md:col-span-2"
                    >
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Dirección
                      </label>
                      <motion.input
                        {...register('address')}
                        type="text"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="Tu dirección completa"
                        whileFocus={{ scale: 1.02 }}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                    >
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Ciudad
                      </label>
                      <motion.input
                        {...register('city')}
                        type="text"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="Asunción"
                        whileFocus={{ scale: 1.02 }}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3, duration: 0.6 }}
                    >
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Departamento
                      </label>
                      <motion.select
                        {...register('department')}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        whileFocus={{ scale: 1.02 }}
                      >
                        <option value="" className="bg-slate-800">Seleccionar</option>
                        <option value="Asunción" className="bg-slate-800">Asunción</option>
                        <option value="Central" className="bg-slate-800">Central</option>
                        <option value="Alto Paraná" className="bg-slate-800">Alto Paraná</option>
                        <option value="Itapúa" className="bg-slate-800">Itapúa</option>
                        <option value="Caaguazú" className="bg-slate-800">Caaguazú</option>
                        <option value="Paraguarí" className="bg-slate-800">Paraguarí</option>
                        <option value="San Pedro" className="bg-slate-800">San Pedro</option>
                        <option value="Cordillera" className="bg-slate-800">Cordillera</option>
                        <option value="Guairá" className="bg-slate-800">Guairá</option>
                        <option value="Caazapá" className="bg-slate-800">Caazapá</option>
                        <option value="Misiones" className="bg-slate-800">Misiones</option>
                        <option value="Ñeembucú" className="bg-slate-800">Ñeembucú</option>
                        <option value="Amambay" className="bg-slate-800">Amambay</option>
                        <option value="Canindeyú" className="bg-slate-800">Canindeyú</option>
                        <option value="Presidente Hayes" className="bg-slate-800">Presidente Hayes</option>
                        <option value="Concepción" className="bg-slate-800">Concepción</option>
                        <option value="Alto Paraguay" className="bg-slate-800">Alto Paraguay</option>
                        <option value="Boquerón" className="bg-slate-800">Boquerón</option>
                      </motion.select>
                    </motion.div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Información Financiera - Solo para Prestatarios */}
              {isBorrower && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <GlassCard>
                    <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiDollarSign className="w-5 h-5 text-white" />
                      </motion.div>
                      Información Financiera
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Ingresos Mensuales (Gs.)
                        </label>
                        <motion.input
                          {...register('monthly_income', { 
                            required: 'Los ingresos son requeridos',
                            min: { value: 0, message: 'Los ingresos deben ser positivos' }
                          })}
                          type="number"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="2000000"
                          whileFocus={{ scale: 1.02 }}
                        />
                        <AnimatePresence>
                          {errors.monthly_income && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                            >
                              <FiAlertCircle className="w-4 h-4" />
                              <span>{errors.monthly_income.message}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Gastos Mensuales (Gs.)
                        </label>
                        <motion.input
                          {...register('monthly_expenses', { 
                            required: 'Los gastos son requeridos',
                            min: { value: 0, message: 'Los gastos deben ser positivos' }
                          })}
                          type="number"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="1500000"
                          whileFocus={{ scale: 1.02 }}
                        />
                        <AnimatePresence>
                          {errors.monthly_expenses && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                            >
                              <FiAlertCircle className="w-4 h-4" />
                              <span>{errors.monthly_expenses.message}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Indicador de Ratio Deuda-Ingresos */}
                      {monthlyIncome && monthlyExpenses && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="md:col-span-2"
                        >
                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white/80 text-sm">Ratio Gastos/Ingresos</span>
                              <span className={`text-sm font-medium ${
                                debtToIncomeRatio <= 30 ? 'text-green-400' :
                                debtToIncomeRatio <= 50 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {debtToIncomeRatio.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <motion.div
                                className={`h-2 rounded-full ${
                                  debtToIncomeRatio <= 30 ? 'bg-green-500' :
                                  debtToIncomeRatio <= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(debtToIncomeRatio, 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                            <p className="text-white/60 text-xs mt-1">
                              {debtToIncomeRatio <= 30 ? 'Excelente gestión financiera' :
                               debtToIncomeRatio <= 50 ? 'Gestión financiera aceptable' : 'Considera reducir gastos'}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Número de Dependientes
                        </label>
                        <motion.input
                          {...register('dependents', { 
                            min: { value: 0, message: 'No puede ser negativo' }
                          })}
                          type="number"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="0"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Estado Laboral
                        </label>
                        <motion.select
                          {...register('employment_status')}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                          whileFocus={{ scale: 1.02 }}
                        >
                          <option value="" className="bg-slate-800">Seleccionar</option>
                          <option value="employed" className="bg-slate-800">Empleado</option>
                          <option value="self_employed" className="bg-slate-800">Independiente</option>
                          <option value="unemployed" className="bg-slate-800">Desempleado</option>
                          <option value="student" className="bg-slate-800">Estudiante</option>
                          <option value="retired" className="bg-slate-800">Jubilado</option>
                        </motion.select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Cargo/Puesto
                        </label>
                        <motion.input
                          {...register('job_title')}
                          type="text"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="Desarrollador, Contador, etc."
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Empleador/Empresa
                        </label>
                        <motion.input
                          {...register('employer')}
                          type="text"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="Nombre de la empresa"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.6 }}
                        className="md:col-span-2"
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Hobbies e Intereses
                        </label>
                        <motion.textarea
                          {...register('hobbies')}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300 resize-none"
                          placeholder="Deportes, lectura, música, etc."
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Preferencias de Préstamo - Solo para Prestamistas */}
              {isLender && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <GlassCard>
                    <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiTarget className="w-5 h-5 text-white" />
                      </motion.div>
                      Preferencias de Préstamo
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Monto Mínimo (Gs.)
                        </label>
                        <motion.input
                          {...register('min_amount', { 
                            min: { value: 0, message: 'El monto debe ser positivo' }
                          })}
                          type="number"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="500000"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Monto Máximo (Gs.)
                        </label>
                        <motion.input
                          {...register('max_amount', { 
                            min: { value: 0, message: 'El monto debe ser positivo' }
                          })}
                          type="number"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="10000000"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Tasa de Interés Preferida (%)
                        </label>
                        <motion.input
                          {...register('interest_rate', { 
                            min: { value: 0, message: 'La tasa debe ser positiva' },
                            max: { value: 100, message: 'La tasa no puede ser mayor a 100%' }
                          })}
                          type="number"
                          step="0.1"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                          placeholder="15.5"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Frecuencia de Pago Preferida
                        </label>
                        <motion.select
                          {...register('payment_frequency_preference')}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                          whileFocus={{ scale: 1.02 }}
                        >
                          <option value="" className="bg-slate-800">Seleccionar</option>
                          <option value="weekly" className="bg-slate-800">Semanal</option>
                          <option value="biweekly" className="bg-slate-800">Quincenal</option>
                          <option value="monthly" className="bg-slate-800">Mensual</option>
                          <option value="quarterly" className="bg-slate-800">Trimestral</option>
                        </motion.select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="md:col-span-2"
                      >
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Tolerancia al Riesgo
                        </label>
                        <motion.select
                          {...register('risk_tolerance')}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                          whileFocus={{ scale: 1.02 }}
                        >
                          <option value="" className="bg-slate-800">Seleccionar</option>
                          <option value="low" className="bg-slate-800">Baja - Solo prestatarios con score alto</option>
                          <option value="medium" className="bg-slate-800">Media - Score medio a alto</option>
                          <option value="high" className="bg-slate-800">Alta - Acepto cualquier score</option>
                        </motion.select>
                      </motion.div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Botón de Guardar */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex justify-end"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      <span>Guardar Perfil</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
} 