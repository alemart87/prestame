'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiCpu, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { aiService } from '@/services/api';

const AIAssistantChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showInitialMessage, setShowInitialMessage] = useState(true);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversation = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await aiService.getConversationHistory();
            
            if (response.data.history && response.data.history.length > 0) {
                setMessages(response.data.history);
                setShowInitialMessage(false);
            } else {
                setShowInitialMessage(true);
            }
        } catch (err) {
            console.error("Error al cargar la conversación:", err);
            setError('Error al cargar la conversación. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Enfoque en el input cuando se carga el componente
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const sendMessage = useCallback(async () => {
        if (!input.trim()) return;
        
        const userMessage = input.trim();
        setInput('');
        setShowInitialMessage(false);
        
        // Añadir mensaje del usuario
        const newMessages = [...messages, { 
          id: Date.now(), 
          text: userMessage, 
          sender: 'user' 
        }];
        setMessages(newMessages);
        
        // Activar el indicador de carga
        setIsLoading(true);
        setError(null);
        
        try {
          // Llamar a la API
          const reply = await aiService.sendMessage(userMessage);
          
          // Añadir respuesta del asistente
          setMessages(prev => [...prev, { 
            id: Date.now(), 
            text: reply, 
            sender: 'assistant' 
          }]);
          
          // Resetear contador de reintentos
          setRetryCount(0);
        } catch (error) {
          console.error('Error al enviar mensaje:', error);
          setError(error.message || 'Error al comunicarse con el asistente');
        } finally {
          setIsLoading(false);
        }
    }, [input, messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (isLoading) return;
        sendMessage();
    };

    const handleRetry = () => {
        if (retryCount >= 3) {
            setError("Parece que hay un problema persistente. Por favor, intenta más tarde.");
            return;
        }
        
        setRetryCount(prev => prev + 1);
        loadConversation();
    };
    
    const Message = ({ msg }) => {
        const isUser = msg.sender === 'user';
        const Icon = isUser ? FiUser : FiCpu;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                        <Icon size={20} />
                    </div>
                )}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`max-w-md p-3 rounded-lg shadow-md ${
                        isUser
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                            : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 rounded-bl-none backdrop-blur-lg'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </motion.div>
                {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                        <Icon size={20} />
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {showInitialMessage && !isLoading && messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-start gap-3 my-4 justify-start"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                            <FiCpu size={20} />
                        </div>
                        <div className="max-w-md p-3 rounded-lg shadow-md bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 rounded-bl-none">
                            <p className="text-sm">
                                ¡Hola! Soy Katupyry-IA, tu asistente en Prestame. Estoy aquí para conversar un poco contigo y conocerte mejor. ¿Cómo estás hoy?
                            </p>
                        </div>
                    </motion.div>
                )}
                
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <Message key={index} msg={msg} />
                    ))}
                </AnimatePresence>
                
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-3 my-4 justify-start"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                           <FiCpu size={20} />
                        </div>
                        <div className="max-w-md p-3 rounded-lg shadow-md bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 rounded-bl-none backdrop-blur-lg">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                <div ref={chatEndRef} />
            </div>
            
            {error && (
                <div className="bg-red-900/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-red-400 text-xs mb-1">
                        <FiAlertCircle />
                        <p>{error}</p>
                    </div>
                    <button 
                        onClick={handleRetry}
                        className="text-xs flex items-center justify-center gap-1 mx-auto text-blue-400 hover:text-blue-300"
                    >
                        <FiRefreshCw size={12} />
                        Intentar nuevamente
                    </button>
                </div>
            )}
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/30">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="w-full p-4 pr-12 rounded-lg bg-black/40 text-white border border-white/10 focus:border-white/30 focus:outline-none"
                        disabled={isLoading}
                        ref={inputRef}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIAssistantChat; 