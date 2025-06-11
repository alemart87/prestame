'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCpu, FiUser, FiBarChart2 } from 'react-icons/fi';
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
      const analysisResult = await aiService.analyzeConversation();
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error al analizar:', error);
    } finally {
      setAnalyzing(false);
    }
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

      {/* Analyze Button */}
      <div className="flex justify-center mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyzeConversation}
          disabled={analyzing || messages.length <= 1}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {analyzing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiBarChart2 className="text-lg" />
          )}
          <span className="text-sm">
            {analyzing ? 'Analizando...' : 'Analizar Conversación'}
          </span>
        </motion.button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-6 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-indigo-400" />
            Análisis de Fiabilidad
          </h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Puntuación:</span>
              <span className="text-2xl font-bold text-indigo-400">{analysis.linguistic_score}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.linguistic_score}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-white font-semibold mb-2">Resumen:</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{analysis.analysis_summary}</p>
            </div>

            {analysis.key_indicators && analysis.key_indicators.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-2">Indicadores Clave:</h4>
                <ul className="space-y-1">
                  {analysis.key_indicators.map((indicator, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomChatbot; 