'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiDollarSign, FiUsers, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('borrower');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { register: registerUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    
    const type = searchParams.get('type');
    if (type && (type === 'borrower' || type === 'lender')) {
      setUserType(type);
    }

    // ✅ Detectar mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isAuthenticated, router, searchParams]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const userData = {
        ...data,
        user_type: userType
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];

  return (
    <AnimatedBackground particleCount={isMobile ? 0 : 15}> {/* ✅ Sin partículas en mobile */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          <GlassCard className="relative overflow-hidden">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isMobile ? 0.1 : 0.2, duration: isMobile ? 0.3 : 0.6 }}
              className="text-center mb-8"
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6"
                whileHover={!isMobile ? { scale: 1.1, rotate: 5 } : {}} // ✅ Sin hover en mobile
                whileTap={{ scale: 0.95 }}
              >
                <FiUser className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Únete a Prestame
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                {userType === 'borrower' 
                  ? 'Regístrate para acceder a préstamos inteligentes y construir tu futuro financiero' 
                  : 'Regístrate para invertir y generar ingresos pasivos con tus ahorros'
                }
              </p>
            </motion.div>

            {/* User Type Selector */}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: isMobile ? 0.15 : 0.3, duration: isMobile ? 0.3 : 0.6 }}
              className="mb-8"
            >
              <div className="flex rounded-2xl bg-white/10 p-1 backdrop-blur-sm border border-white/20">
                <motion.button
                  type="button"
                  onClick={() => setUserType('borrower')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    userType === 'borrower'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={!isMobile ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiDollarSign className="mr-2 h-5 w-5" />
                  Quiero un préstamo
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setUserType('lender')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    userType === 'lender'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={!isMobile ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiUsers className="mr-2 h-5 w-5" />
                  Quiero dar préstamos
                </motion.button>
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isMobile ? 0.2 : 0.4, duration: isMobile ? 0.3 : 0.6 }}
            >
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0.25 : 0.5, duration: isMobile ? 0.3 : 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <motion.input
                      {...register('first_name', { required: 'El nombre es requerido' })}
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="Tu nombre"
                      whileFocus={!isMobile ? { scale: 1.02 } : {}}
                    />
                  </div>
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
                  initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0.3 : 0.6, duration: isMobile ? 0.3 : 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Apellido
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <motion.input
                      {...register('last_name', { required: 'El apellido es requerido' })}
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="Tu apellido"
                      whileFocus={!isMobile ? { scale: 1.02 } : {}}
                    />
                  </div>
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
              </div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: isMobile ? 0.35 : 0.7, duration: isMobile ? 0.3 : 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <motion.input
                    {...register('email', { 
                      required: 'El correo es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Correo electrónico inválido'
                      }
                    })}
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="tu@email.com"
                    whileFocus={!isMobile ? { scale: 1.02 } : {}}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                    >
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{errors.email.message}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Phone and City Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0.4 : 0.8, duration: isMobile ? 0.3 : 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <motion.input
                      {...register('phone', { required: 'El teléfono es requerido' })}
                      type="tel"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="0981 123 456"
                      whileFocus={!isMobile ? { scale: 1.02 } : {}}
                    />
                  </div>
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
                  initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0.45 : 0.9, duration: isMobile ? 0.3 : 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Ciudad
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <motion.input
                      {...register('city')}
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="Asunción"
                      whileFocus={!isMobile ? { scale: 1.02 } : {}}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0.5 : 1.0, duration: isMobile ? 0.3 : 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <motion.input
                      {...register('password', { 
                        required: 'La contraseña es requerida',
                        minLength: {
                          value: 8,
                          message: 'La contraseña debe tener al menos 8 caracteres'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                      whileFocus={!isMobile ? { scale: 1.02 } : {}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <div className="flex space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-white/70">
                        Seguridad: <span className="font-medium">{strengthLabels[passwordStrength - 1] || 'Muy débil'}</span>
                      </p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                      >
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{errors.password.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0.55 : 1.1, duration: isMobile ? 0.3 : 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <motion.input
                      {...register('confirmPassword', { 
                        required: 'Confirma tu contraseña',
                        validate: (value) => value === password || 'Las contraseñas no coinciden'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                      whileFocus={!isMobile ? { scale: 1.02 } : {}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <p className={`text-xs ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                        {password === confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                      </p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                      >
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isMobile ? 0.6 : 1.2, duration: isMobile ? 0.3 : 0.6 }}
              >
                {loading ? (
                  <motion.div
                    className="flex items-center justify-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Creando cuenta...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Crear Cuenta</span>
                    <FiArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.button>
            </motion.form>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center space-x-3"
                >
                  <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isMobile ? 0.65 : 1.3, duration: isMobile ? 0.3 : 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-white/70 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </AnimatedBackground>
  );
} 