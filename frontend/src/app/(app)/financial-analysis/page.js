'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AnimatedBackground from '../../../components/AnimatedBackground';
import AppNavbar from '../../../components/AppNavbar';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiBarChart2, FiMessageCircle, FiShield } from 'react-icons/fi';

// Importación dinámica para el nuevo chatbot
const ChatbotComponent = dynamic(() => import('../../../components/ReactChatbot/ChatbotComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-black/30 backdrop-blur-md rounded-xl border border-white/10">
      <div className="w-16 h-16 mb-4 border-t-2 border-blue-500 border-opacity-80 rounded-full animate-spin"></div>
      <div className="text-blue-400 font-medium">Inicializando asistente...</div>
    </div>
  )
});

const FinancialAnalysisPage = () => {
    return (
        <>
            <AnimatedBackground />
            <AppNavbar />
            <div className="relative z-10 container mx-auto pt-20 pb-8 px-4 min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Columna izquierda - Información */}
                    <div className="lg:col-span-2 flex flex-col space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-left"
                        >
                            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                Análisis de Fiabilidad con IA
                            </h1>
                            <p className="text-gray-300 max-w-lg text-lg">
                                Conversa con <span className="font-semibold text-indigo-300">Katupyry-IA</span>, nuestro asistente que utiliza tecnología avanzada para entender mejor tu perfil financiero.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="backdrop-blur-md bg-black/20 p-6 rounded-xl border border-white/10 shadow-xl"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mr-4">
                                    <FiMessageCircle className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Conversación Natural</h3>
                            </div>
                            <p className="text-gray-300">
                                Nuestro asistente conversará contigo como lo haría una persona, adaptándose a tus respuestas para entender mejor tu situación.
                            </p>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="backdrop-blur-md bg-black/20 p-6 rounded-xl border border-white/10 shadow-xl"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg mr-4">
                                    <FiBarChart2 className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Análisis Avanzado</h3>
                            </div>
                            <p className="text-gray-300">
                                Analizamos patrones lingüísticos y respuestas para complementar tu perfil financiero con insights que los métodos tradicionales no pueden capturar.
                            </p>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="backdrop-blur-md bg-black/20 p-6 rounded-xl border border-white/10 shadow-xl"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-lg mr-4">
                                    <FiShield className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Datos Protegidos</h3>
                            </div>
                            <p className="text-gray-300">
                                Tu privacidad es nuestra prioridad. Toda la información compartida durante la conversación está protegida y se utiliza exclusivamente para el análisis.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="p-5 backdrop-blur-md bg-gradient-to-r from-amber-900/30 to-yellow-800/30 border border-amber-500/20 rounded-xl shadow-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                                        <FiAlertTriangle className="text-white text-xl" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-amber-300 mb-2">Importante</h3>
                                    <p className="text-amber-100">
                                        Este análisis es complementario a nuestros métodos tradicionales de evaluación. Te recomendamos ser honesto y detallado en tus respuestas.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Columna derecha - Chatbot */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="lg:col-span-3 h-full"
                    >
                       <ChatbotComponent /> 
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default FinancialAnalysisPage; 