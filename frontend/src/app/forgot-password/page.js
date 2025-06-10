'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // DEBUG: Imprimir la variable de entorno
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal');
      }

      setMessage(data.message);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedBackground particleCount={20}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <GlassCard>
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
                <FiMail className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                No te preocupes. Ingresa tu correo electrónico y te enviaremos un enlace mágico para restablecer tu contraseña.
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                      <motion.input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="tu@email.com"
                        required
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {isLoading ? (
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
                        <span>Enviando...</span>
                      </motion.div>
                    ) : (
                      'Enviar enlace mágico'
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <FiCheck className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">¡Correo enviado!</h3>
                  <p className="text-white/70 text-sm">
                    Revisa tu bandeja de entrada y sigue las instrucciones.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Success Message */}
            <AnimatePresence>
              {message && !isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center space-x-3"
                >
                  <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-200 text-sm">{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-300 text-sm"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Volver al inicio de sesión</span>
              </Link>
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default ForgotPasswordPage; 