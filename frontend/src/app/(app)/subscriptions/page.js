'use client';

import React, { useState, useEffect } from 'react';
import { stripeService } from '../../../services/api';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
import AppNavbar from '../../../components/AppNavbar';
import AnimatedBackground from '../../../components/AnimatedBackground';
import GlassCard from '../../../components/GlassCard';

const SubscriptionsPage = () => {
    const [quantity, setQuantity] = useState(15); // Mínimo 15
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pricing, setPricing] = useState({
        price_per_lead: 1.0,
        currency: 'EUR',
        min_quantity: 15,
        max_quantity: 900
    });

    // Cargar información de precios al montar el componente
    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await stripeService.getLeadPricing();
                setPricing(response.data);
            } catch (error) {
                console.error('Error loading pricing:', error);
            }
        };
        fetchPricing();
    }, []);

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= pricing.min_quantity && newQuantity <= pricing.max_quantity) {
            setQuantity(newQuantity);
        }
    };

    const handlePurchase = async () => {
        setError(null);
        setIsLoading(true);
        
        try {
            const response = await stripeService.createLeadsCheckout(quantity);
            window.location.href = response.data.url;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'No se pudo iniciar el proceso de pago.';
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const totalPrice = quantity * pricing.price_per_lead;

    return (
        <div>
            <AppNavbar />
            <AnimatedBackground particleCount={25}>
                <div className="min-h-screen pt-20 px-4">
                    <div className="max-w-4xl mx-auto space-y-12">
                        
                        {/* Header */}
                        <motion.div 
                            className="text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-white">
                                Compra Leads Verificados
                    </h1>
                            <p className="text-lg text-white/70 mt-4 max-w-3xl mx-auto">
                                Accede a leads de calidad verificados. Pago único, sin suscripciones.
                                Solo pagas por lo que necesitas.
                    </p>
                        </motion.div>

                        {/* Error Message */}
                {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg relative max-w-3xl mx-auto"
                            >
                        <strong className="font-bold">Error: </strong>
                                <span>{error}</span>
                            </motion.div>
                )}

                        {/* Main Purchase Card */}
                                <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                                >
                            <GlassCard className="max-w-2xl mx-auto">
                                <div className="text-center p-8">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            Leads Prestame
                                        </h2>
                                        <p className="text-white/70">
                                            Leads verificados de empresas y personas reales
                                        </p>
                                    </div>

                                    {/* Pricing Display */}
                                    <div className="bg-white/10 rounded-2xl p-6 mb-8">
                                        <div className="text-center mb-6">
                                            <span className="text-5xl font-bold text-white">
                                                €{pricing.price_per_lead}
                                            </span>
                                            <span className="text-white/70 text-xl ml-2">por lead</span>
                                </div>

                                        {/* Quantity Selector */}
                                        <div className="mb-6">
                                            <label className="block text-white/80 text-sm font-medium mb-3">
                                                Cantidad de leads (mín. {pricing.min_quantity}, máx. {pricing.max_quantity})
                                            </label>
                                            
                                            <div className="flex items-center justify-center space-x-4">
                                                <motion.button
                                                    onClick={() => handleQuantityChange(quantity - 1)}
                                                    disabled={quantity <= pricing.min_quantity}
                                                    className="p-3 bg-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FiMinus className="w-5 h-5" />
                                                </motion.button>
                                                
                                                <div className="flex-1 max-w-xs">
                                                    <input
                                                        type="number"
                                                        value={quantity}
                                                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || pricing.min_quantity)}
                                                        min={pricing.min_quantity}
                                                        max={pricing.max_quantity}
                                                        className="w-full text-center text-2xl font-bold bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                </div>
                                                
                                            <motion.button
                                                    onClick={() => handleQuantityChange(quantity + 1)}
                                                    disabled={quantity >= pricing.max_quantity}
                                                    className="p-3 bg-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                            >
                                                    <FiPlus className="w-5 h-5" />
                                            </motion.button>
                        </div>
                        </div>
                        
                                        {/* Total Price */}
                                        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-6">
                                            <div className="flex justify-between items-center text-white">
                                                <span className="text-lg">Total a pagar:</span>
                                                <span className="text-3xl font-bold">€{totalPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="text-white/60 text-sm mt-1">
                                                {quantity} leads × €{pricing.price_per_lead} cada uno
                                            </div>
                                        </div>

                                        {/* Purchase Button */}
                                            <motion.button
                                            onClick={handlePurchase}
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-8 rounded-xl text-lg disabled:opacity-60 flex items-center justify-center space-x-2"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    <span>Procesando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiShoppingCart className="w-5 h-5" />
                                                    <span>Comprar {quantity} Leads</span>
                                                </>
                                            )}
                                            </motion.button>
                                    </div>

                                    {/* Features */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        {[
                                            'Leads verificados y reales',
                                            'Información de contacto completa',
                                            'Sin suscripciones mensuales',
                                            'Acceso inmediato tras el pago',
                                            'Soporte técnico incluido',
                                            'Datos actualizados'
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-2 text-white/80">
                                                <FiCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                            </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </AnimatedBackground>
        </div>
    );
};

export default SubscriptionsPage; 