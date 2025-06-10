'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { borrowerService } from '../../services/api';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiFileText, 
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiPercent,
  FiShield,
  FiTarget,
  FiCreditCard,
  FiHash
} from 'react-icons/fi';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import AppNavbar from '../../components/AppNavbar';

const BenefitIcon = ({ iconName, className }) => {
  const icons = {
    FiClock,
    FiPercent,
    FiShield,
    FiTarget,
  };

  const IconComponent = icons[iconName];
  if (!IconComponent) return null;

  return <IconComponent className={className} />;
};

export default function LoanRequestPage() {
  const { user, profile, isBorrower, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && !isBorrower) {
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, isBorrower, router]);

  const watchAmount = watch('amount');
  const watchPaymentFrequency = watch('payment_frequency');
  const watchTermMonths = watch('term_months');

  // Calcular cuota estimada
  const calculateEstimatedPayment = () => {
    if (!watchAmount || !watchTermMonths) return 0;
    
    const amount = parseFloat(watchAmount);
    const months = parseInt(watchTermMonths);
    const interestRate = 0.15; // 15% anual estimado
    
    if (watchPaymentFrequency === 'monthly') {
      const monthlyRate = interestRate / 12;
      const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                     (Math.pow(1 + monthlyRate, months) - 1);
      return payment;
    } else if (watchPaymentFrequency === 'weekly') {
      const weeklyRate = interestRate / 52;
      const weeks = months * 4.33;
      const payment = (amount * weeklyRate * Math.pow(1 + weeklyRate, weeks)) / 
                     (Math.pow(1 + weeklyRate, weeks) - 1);
      return payment;
    } else if (watchPaymentFrequency === 'daily') {
      const dailyRate = interestRate / 365;
      const days = months * 30;
      const payment = (amount * dailyRate * Math.pow(1 + dailyRate, days)) / 
                     (Math.pow(1 + dailyRate, days) - 1);
      return payment;
    }
    
    return 0;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const loanData = {
        amount: parseFloat(data.amount),
        purpose: data.purpose,
        payment_frequency: data.payment_frequency,
        term_months: parseInt(data.term_months),
        description: data.description,
        collateral: data.collateral
      };

      const response = await borrowerService.createLoanRequest(loanData);
      
      if (response.data) {
        setSuccess('¡Solicitud de préstamo creada exitosamente!');
        setTimeout(() => {
          router.push('/my-loans');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la solicitud de préstamo');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita Mejora';
  };

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
            <p className="text-white/80 text-lg">Cargando...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  if (!user || !isBorrower) {
    return null;
  }

  const estimatedPayment = calculateEstimatedPayment();

  return (
    <div>
      <AppNavbar />
      
      <AnimatedBackground particleCount={30}>
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
                  Nueva Solicitud de Préstamo
                </motion.h1>
                <motion.p 
                  className="text-white/70 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Completa la información para solicitar tu préstamo
                </motion.p>
              </div>
              
              {profile && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <GlassCard className="text-center">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className={`w-20 h-20 bg-gradient-to-r ${getScoreColor(profile.score || 0)} rounded-3xl flex items-center justify-center`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiStar className="w-10 h-10 text-white" />
                      </motion.div>
                      <div className="text-left">
                        <p className="text-white/70 text-sm">Score Katupyry</p>
                        <p className="text-white text-3xl font-bold">{profile.score || 0}</p>
                        <p className="text-white/60 text-xs">{getScoreLabel(profile.score || 0)}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </motion.div>

            {/* Información del Score */}
            {profile && profile.score < 50 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <GlassCard className="border-yellow-500/30 bg-yellow-500/10">
                  <div className="flex items-start space-x-3">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FiAlertCircle className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Mejora tu Score Katupyry
                      </h3>
                      <p className="text-white/80 text-sm">
                        Un score más alto aumenta tus posibilidades de obtener mejores condiciones. 
                        <motion.a 
                          href="/profile" 
                          className="font-medium text-yellow-300 hover:text-yellow-200 underline ml-1"
                          whileHover={{ scale: 1.05 }}
                        >
                          Completa tu perfil
                        </motion.a> para mejorar tu score.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
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
                    <FiCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-200 text-sm">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario Principal */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Información del Préstamo */}
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
                        Detalles del Préstamo
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8, duration: 0.6 }}
                        >
                          <label className="block text-white/90 text-sm font-medium mb-2">
                            Monto Solicitado (Gs.) *
                          </label>
                          <motion.input
                            {...register('amount', { 
                              required: 'El monto es requerido',
                              min: { value: 100000, message: 'El monto mínimo es Gs. 100.000' },
                              max: { value: 50000000, message: 'El monto máximo es Gs. 50.000.000' }
                            })}
                            type="number"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                            placeholder="1000000"
                            whileFocus={{ scale: 1.02 }}
                          />
                          <AnimatePresence>
                            {errors.amount && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                              >
                                <FiAlertCircle className="w-4 h-4" />
                                <span>{errors.amount.message}</span>
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
                            Propósito del Préstamo *
                          </label>
                          <motion.select
                            {...register('purpose', { required: 'El propósito es requerido' })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                            whileFocus={{ scale: 1.02 }}
                          >
                            <option value="" className="bg-slate-800">Seleccionar propósito</option>
                            <option value="personal" className="bg-slate-800">Personal</option>
                            <option value="business" className="bg-slate-800">Negocio</option>
                            <option value="education" className="bg-slate-800">Educación</option>
                            <option value="home_improvement" className="bg-slate-800">Mejoras del hogar</option>
                            <option value="debt_consolidation" className="bg-slate-800">Consolidación de deudas</option>
                            <option value="medical" className="bg-slate-800">Médico</option>
                            <option value="vehicle" className="bg-slate-800">Vehículo</option>
                            <option value="other" className="bg-slate-800">Otro</option>
                          </motion.select>
                          <AnimatePresence>
                            {errors.purpose && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                              >
                                <FiAlertCircle className="w-4 h-4" />
                                <span>{errors.purpose.message}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0, duration: 0.6 }}
                        >
                          <label className="block text-white/90 text-sm font-medium mb-2">
                            Frecuencia de Pago *
                          </label>
                          <motion.select
                            {...register('payment_frequency', { required: 'La frecuencia es requerida' })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                            whileFocus={{ scale: 1.02 }}
                          >
                            <option value="" className="bg-slate-800">Seleccionar frecuencia</option>
                            <option value="daily" className="bg-slate-800">Diario</option>
                            <option value="weekly" className="bg-slate-800">Semanal</option>
                            <option value="monthly" className="bg-slate-800">Mensual</option>
                          </motion.select>
                          <AnimatePresence>
                            {errors.payment_frequency && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                              >
                                <FiAlertCircle className="w-4 h-4" />
                                <span>{errors.payment_frequency.message}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1, duration: 0.6 }}
                        >
                          <label className="block text-white/90 text-sm font-medium mb-2">
                            Plazo (meses) *
                          </label>
                          <motion.input
                            {...register('term_months', { 
                              required: 'El plazo es requerido',
                              min: { value: 1, message: 'El plazo mínimo es 1 mes' },
                              max: { value: 60, message: 'El plazo máximo es 60 meses' }
                            })}
                            type="number"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                            placeholder="12"
                            whileFocus={{ scale: 1.02 }}
                          />
                          <AnimatePresence>
                            {errors.term_months && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                              >
                                <FiAlertCircle className="w-4 h-4" />
                                <span>{errors.term_months.message}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2, duration: 0.6 }}
                          className="md:col-span-2"
                        >
                          <label className="block text-white/90 text-sm font-medium mb-2">
                            Descripción del Préstamo
                          </label>
                          <motion.textarea
                            {...register('description')}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300 resize-none"
                            placeholder="Describe para qué necesitas el préstamo..."
                            whileFocus={{ scale: 1.02 }}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.3, duration: 0.6 }}
                          className="md:col-span-2"
                        >
                          <label className="block text-white/90 text-sm font-medium mb-2">
                            Garantía/Colateral (opcional)
                          </label>
                          <motion.textarea
                            {...register('collateral')}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300 resize-none"
                            placeholder="Describe cualquier garantía que puedas ofrecer..."
                            whileFocus={{ scale: 1.02 }}
                          />
                        </motion.div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>

                {/* Calculadora de Cuotas */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="space-y-6"
                >
                  <GlassCard>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <motion.div
                        className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiHash className="w-4 h-4 text-white" />
                      </motion.div>
                      Calculadora de Cuotas
                    </h3>

                    <div className="space-y-4">
                      {watchAmount && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-white/5 border border-white/10 rounded-xl"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white/70 text-sm">Monto</span>
                            <span className="text-white font-semibold">{formatCurrency(watchAmount)}</span>
                          </div>
                        </motion.div>
                      )}

                      {watchTermMonths && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-white/5 border border-white/10 rounded-xl"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white/70 text-sm">Plazo</span>
                            <span className="text-white font-semibold">{watchTermMonths} meses</span>
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Tasa Estimada</span>
                          <span className="text-white font-semibold">15% anual</span>
                        </div>
                      </motion.div>

                      {estimatedPayment > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl"
                        >
                          <div className="text-center">
                            <p className="text-white/70 text-sm mb-1">Cuota Estimada</p>
                            <p className="text-white text-2xl font-bold">{formatCurrency(estimatedPayment)}</p>
                            <p className="text-white/60 text-xs">
                              {watchPaymentFrequency === 'daily' ? 'por día' :
                               watchPaymentFrequency === 'weekly' ? 'por semana' : 'por mes'}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                      >
                        <div className="flex items-start space-x-2">
                          <FiInfo className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-blue-200 text-xs">
                            Esta es una estimación. Las condiciones finales dependerán de tu score y la evaluación del prestamista.
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </GlassCard>

                  {/* Beneficios */}
                  <GlassCard>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <motion.div
                        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <FiShield className="w-4 h-4 text-white" />
                      </motion.div>
                      Beneficios
                    </h3>

                    <div className="space-y-3">
                      {[
                        { icon: 'FiClock', text: 'Respuesta rápida' },
                        { icon: 'FiPercent', text: 'Tasas competitivas' },
                        { icon: 'FiShield', text: 'Proceso seguro' },
                        { icon: 'FiTarget', text: 'Sin comisiones ocultas' }
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 + index * 0.1, duration: 0.4 }}
                          className="flex items-center space-x-3"
                        >
                          <motion.div
                            className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                          >
                            <BenefitIcon iconName={benefit.icon} className="w-3 h-3 text-white" />
                          </motion.div>
                          <span className="text-white/80 text-sm">{benefit.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Botón de Enviar */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="flex justify-center"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 text-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Enviando Solicitud...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-6 h-6" />
                      <span>Enviar Solicitud de Préstamo</span>
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