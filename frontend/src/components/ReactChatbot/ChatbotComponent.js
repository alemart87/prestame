'use client';

import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { aiService } from '../../services/api';

import config from './config';
import { createMessageParser } from './MessageParser';
import { createActionProvider } from './ActionProvider';

const ChatbotComponent = () => {
  const ActionProvider = createActionProvider();
  const MessageParser = createMessageParser();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  
  const handleAnalyzeConversation = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      const analysisResult = await aiService.analyzeConversation();
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error al analizar la conversación:', error);
      setError(error.message || 'No se pudo analizar la conversación. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBackgroundColor = (score) => {
    if (score >= 80) return "from-green-600 to-green-400";
    if (score >= 60) return "from-blue-600 to-blue-400";
    if (score >= 40) return "from-yellow-600 to-yellow-400";
    return "from-red-600 to-red-400";
  };
  
  const getScoreIcon = (score) => {
    if (score >= 60) return <FiCheckCircle className="text-xl" />;
    if (score >= 40) return <FiInfo className="text-xl" />;
    return <FiAlertTriangle className="text-xl" />;
  };
  
  return (
    <div className="flex flex-col">
      <div className="chatbot-container-glass">
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
        />
      </div>
      
      <div className="mt-4 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center px-6 py-3 rounded-lg 
            ${analyzing ? 'bg-gray-600 text-gray-300' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'} 
            font-medium shadow-md`}
          onClick={handleAnalyzeConversation}
          disabled={analyzing}
        >
          <FiBarChart2 className="mr-2 text-xl" />
          {analyzing ? 'Analizando...' : 'Analizar Conversación Completa'}
        </motion.button>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 backdrop-blur-md bg-red-900/20 rounded-lg border border-red-500/30"
        >
          <div className="flex items-start">
            <FiAlertTriangle className="text-red-400 text-xl mr-2 mt-1 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        </motion.div>
      )}
      
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-6 backdrop-blur-md bg-black/20 rounded-lg border border-white/10 shadow-lg"
        >
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-indigo-400" />
            Análisis de Fiabilidad
          </h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-gray-300">Puntuación:</span>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.linguistic_score)}`}>
                {analysis.linguistic_score}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
              <div 
                className={`bg-gradient-to-r ${getScoreBackgroundColor(analysis.linguistic_score)} h-3 rounded-full transition-all duration-500`} 
                style={{ width: `${analysis.linguistic_score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-2 flex items-center">
              {getScoreIcon(analysis.linguistic_score)}
              <span className="ml-2">Resumen del Análisis</span>
            </h4>
            <p className="text-gray-300 bg-black/30 p-4 rounded-lg border border-white/5">
              {analysis.analysis_summary}
            </p>
          </div>
          
          {analysis.key_indicators && analysis.key_indicators.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-white mb-2">Indicadores Clave:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.key_indicators.map((indicator, index) => (
                  <li key={index} className="flex items-start text-gray-300">
                    <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-white/10 text-sm text-gray-400">
            Este análisis se basa en patrones lingüísticos y no debe considerarse como una evaluación definitiva.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatbotComponent; 