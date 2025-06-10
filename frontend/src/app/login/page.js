'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(data);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 200, -200, 0],
            y: [0, -200, 200, 0],
            scale: [1, 1.5, 0.5, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-8"
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUser className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Bienvenido de vuelta!
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                Accede a tu cuenta de Prestame y continúa construyendo tu futuro financiero.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
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
                    whileFocus={{ scale: 1.02 }}
                  />
                  {watchedEmail && (
                    <motion.div
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </motion.div>
                  )}
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

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <motion.input
                    {...register('password', { required: 'La contraseña es requerida' })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
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

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-white/70 text-sm">Recordarme</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
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
                    <span>Iniciando sesión...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Iniciar sesión</span>
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

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-white/70 text-sm">
                ¿No tienes una cuenta?{' '}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </motion.div>

            {/* Quick Registration Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-8 pt-6 border-t border-white/20"
            >
              <p className="text-center text-white/70 text-sm mb-4">
                ¿Primera vez en Prestame?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register?type=borrower"
                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl text-sm font-medium text-green-300 hover:bg-green-500/30 transition-all duration-300"
                  >
                    <FiDollarSign className="w-4 h-4 mr-2" />
                    Quiero un préstamo
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register?type=lender"
                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl text-sm font-medium text-purple-300 hover:bg-purple-500/30 transition-all duration-300"
                  >
                    <FiUser className="w-4 h-4 mr-2" />
                    Quiero dar préstamos
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 