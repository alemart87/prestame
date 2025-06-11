'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCpu, FiUser, FiBarChart2, FiCheckCircle, FiAlertTriangle, FiInfo, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';
import { aiService } from '../../services/api';

const CustomChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy Katupyry-IA, tu asistente financiero inteligente. Estoy aquí para conocerte mejor y ayudarte con tu análisis de fiabilidad. ¿Comenzamos?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiService.sendMessage(inputValue);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Disculpa, estoy teniendo problemas técnicos. Por favor, inténtalo de nuevo.",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleAnalyzeConversation = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      console.log('🔍 Iniciando análisis del thread de OpenAI...');
      
      const analysisResult = await aiService.analyzeConversation();
      console.log('✅ Análisis completado:', analysisResult);
      
      // Verificar que tenemos los datos necesarios
      if (analysisResult && typeof analysisResult.linguistic_score !== 'undefined') {
        setAnalysis(analysisResult);
        console.log('💾 Análisis guardado en estado local');
      } else {
        console.error('❌ Formato de análisis inválido:', analysisResult);
        setError('El análisis no tiene el formato esperado');
      }
    } catch (error) {
      console.error('❌ Error al analizar:', error);
      setError(error.message || 'No se pudo analizar la conversación del thread. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBackgroundColor = (score) => {
    if (score >= 80) return "from-emerald-500 to-green-400";
    if (score >= 60) return "from-blue-500 to-cyan-400";
    if (score >= 40) return "from-amber-500 to-yellow-400";
    return "from-red-500 to-pink-400";
  };
  
  const getScoreIcon = (score) => {
    if (score >= 60) return <FiCheckCircle className="text-xl" />;
    if (score >= 40) return <FiInfo className="text-xl" />;
    return <FiAlertTriangle className="text-xl" />;
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shadow-lg">
                <FiCpu className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Asistente IA</h3>
                <p className="text-indigo-200 text-xs">Análisis financiero inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">En línea</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-end gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <FiCpu className="text-white text-sm" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border ${
                    message.isBot
                      ? 'bg-indigo-600/30 border-indigo-500/20 text-white rounded-bl-md'
                      : 'bg-gray-700/50 border-gray-600/20 text-white rounded-br-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>

                {!message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <FiUser className="text-white text-sm" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-end gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FiCpu className="text-white text-sm" />
              </div>
              <div className="bg-indigo-600/30 border border-indigo-500/20 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 bg-black/30 border border-white/20 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all duration-200"
              disabled={isTyping}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!inputValue.trim() || isTyping}
              className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <FiSend className="text-white text-lg" />
            </motion.button>
          </form>
        </div>
      </div>

      {/* Analyze Button - SIEMPRE HABILITADO */}
      <div className="flex justify-center mt-4">
        <motion.button
          whileHover={{ scale: !analyzing ? 1.02 : 1 }}
          whileTap={{ scale: !analyzing ? 0.98 : 1 }}
          onClick={handleAnalyzeConversation}
          disabled={analyzing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
            !analyzing
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/25'
              : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
          }`}
        >
          {analyzing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiBarChart2 className="text-lg" />
          )}
          <span className="text-sm">
            {analyzing ? 'Analizando Thread de OpenAI...' : 'Analizar Conversación del Thread'}
          </span>
        </motion.button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mt-4 p-4 backdrop-blur-md bg-red-900/20 rounded-xl border border-red-500/30 shadow-xl"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="text-red-400 text-sm" />
              </div>
              <div>
                <h4 className="text-red-300 font-semibold text-sm mb-1">Error en el análisis</h4>
                <p className="text-red-200 text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-red-300 hover:text-red-200 text-xs underline"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="mt-4 p-6 backdrop-blur-md bg-black/30 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg">
                    <FiTrendingUp className="text-white text-lg" />
                  </div>
                  Análisis de Fiabilidad
                </h3>
                <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                  <FiShield className="text-green-400 text-sm" />
                  <span className="text-green-300 text-xs font-medium">Guardado en BD</span>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-black/20 to-black/10 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg text-gray-300 font-medium">Puntuación</span>
                  <div className="flex items-center space-x-2">
                    <div className={`${getScoreColor(analysis.linguistic_score)}`}>
                      {getScoreIcon(analysis.linguistic_score)}
                    </div>
                    <span className={`text-3xl font-bold ${getScoreColor(analysis.linguistic_score)}`}>
                      {analysis.linguistic_score}%
                    </span>
                  </div>
                </div>
                
                <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.linguistic_score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`bg-gradient-to-r ${getScoreBackgroundColor(analysis.linguistic_score)} h-3 rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                  </motion.div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FiZap className="text-yellow-400 mr-2" />
                  Resumen del Análisis
                </h4>
                <div className="p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-500/20">
                  <p className="text-gray-200 leading-relaxed">
                    {analysis.analysis_summary}
                  </p>
                </div>
              </div>
              
              {analysis.key_indicators && analysis.key_indicators.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FiInfo className="text-blue-400 mr-2" />
                    Indicadores Clave
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {analysis.key_indicators.map((indicator, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-300 text-sm">{indicator}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
                  <FiShield className="text-green-400" />
                  <span>Análisis importado del Thread de OpenAI y guardado en base de datos</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomChatbot; 