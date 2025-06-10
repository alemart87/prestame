'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiShield } from 'react-icons/fi';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setError('No se proporcionó un token.');
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`);
        if (!response.ok) {
          throw new Error('Token inválido o expirado.');
        }
        setIsTokenValid(true);
      } catch (err) {
        setIsTokenValid(false);
        setError(err.message);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal.');
      }

      setMessage(data.message);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
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

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white text-lg">Verificando token...</p>
        </motion.div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <motion.div
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <FiAlertCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Token inválido</h2>
            <p className="text-white/70">{error}</p>
          </div>
        </motion.div>
      </div>
    );
  }

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
      {[...Array(15)].map((_, i) => (
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
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiShield className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Nueva Contraseña
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                Crea una contraseña segura para proteger tu cuenta.
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
                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="••••••••"
                        required
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
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                      <motion.input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                        placeholder="••••••••"
                        required
                        whileFocus={{ scale: 1.02 }}
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
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || password !== confirmPassword || password.length < 8}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
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
                        <span>Actualizando...</span>
                      </motion.div>
                    ) : (
                      'Actualizar Contraseña'
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
                  <h3 className="text-xl font-semibold text-white mb-2">¡Contraseña actualizada!</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Tu contraseña ha sido cambiada exitosamente.
                  </p>
                  <p className="text-white/50 text-xs">
                    Redirigiendo al inicio de sesión...
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 