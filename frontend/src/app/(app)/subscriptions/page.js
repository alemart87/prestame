'use client';

import React, { useState } from 'react';
import { stripeService } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiStar, FiZap, FiShield, FiCreditCard, FiArrowRight, FiRotateCw, FiSettings } from 'react-icons/fi';
import AppNavbar from '../../../components/AppNavbar';
import AnimatedBackground from '../../../components/AnimatedBackground';
import GlassCard from '../../../components/GlassCard';

const plans = [
    { name: 'Starter', price: '9', features: ['10 leads al mes', 'Acceso a la plataforma', 'Soporte por email'], priceId: 'price_1RXmTOGMLNY8JgDpxAl1QfGx', isPopular: false, gradient: 'from-gray-700 to-gray-800' },
    { name: 'Pro', price: '29', features: ['50 leads al mes', 'Acceso a la plataforma', 'Soporte prioritario por email', 'Estadísticas básicas'], priceId: 'price_1RXmTdGMLNY8JgDptfVeN5bD', isPopular: true, gradient: 'from-blue-600 to-purple-600' },
    { name: 'Pro Superior', price: '49', features: ['80 leads al mes', 'Soporte 24/7 con respuesta garantizada', 'Estadísticas avanzadas', 'Asesoramiento personalizado'], priceId: 'price_1RXmTnGMLNY8JgDp8yDvflG4', isPopular: false, gradient: 'from-pink-600 to-red-600' }
];

const leadPackages = [
    { name: 'Paquete de 1 Lead', price: '1', priceId: 'price_1RXmUmGMLNY8JgDp5sCOotR9' },
    { name: 'Paquete de 10 Leads', price: '10', priceId: 'price_1RXmNNGMLNY8JgDpZnx29GPN' }
];

const aiLeadPackages = [
    { 
        name: 'LEADS CON IA', 
        price: '5', 
        quantity: '10',
        priceId: 'price_1RXv0UGMLNY8JgDphalXJuz2',
        description: 'Leads reales extraídos con IA de sitios paraguayos',
        features: [
            'Datos verificados de empresas reales',
            'Teléfonos paraguayos válidos (+595)',
            'Emails de contacto verificados',
            'Información de ubicación y negocio',
            'Extraídos de LinkedIn, Facebook, MercadoLibre'
        ],
        isPopular: true
    }
];

const SubscriptionsPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [error, setError] = useState(null);
    const [isBuyingPackage, setIsBuyingPackage] = useState(false);
    const [isManaging, setIsManaging] = useState(false);

    const handleSubscribe = async (plan) => {
        setError(null);
        setIsLoading(true);
        setSelectedPlan(plan.priceId);
        try {
            const response = await stripeService.createCheckoutSession(plan.priceId);
            window.location.href = response.data.url;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'No se pudo iniciar el proceso de pago.';
            setError(errorMessage);
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    const handleOneTimePurchase = async (pkg) => {
        setError(null);
        setIsBuyingPackage(pkg.priceId);
        try {
            const response = await stripeService.createOneTimeCheckout(pkg.priceId);
            window.location.href = response.data.url;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'No se pudo iniciar el proceso de compra.';
            setError(errorMessage);
        } finally {
            setIsBuyingPackage(false);
        }
    };

    const handleManageSubscription = async () => {
        setError(null);
        setIsManaging(true);
        try {
            const response = await stripeService.createPortalSession();
            window.location.href = response.data.url;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'No se pudo abrir el portal de gestión.';
            setError(errorMessage);
        } finally {
            setIsManaging(false);
        }
    };

    return (
        <div>
            <AppNavbar />
            <AnimatedBackground particleCount={25}>
                <div className="min-h-screen pt-20 px-4">
                    <div className="max-w-7xl mx-auto space-y-12">
                        <motion.div 
                            className="text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-white">
                                Un Plan Para Cada Necesidad
                            </h1>
                            <p className="text-lg text-white/70 mt-4 max-w-3xl mx-auto">
                                Accede a leads de calidad y haz crecer tu cartera. Nuestros planes están diseñados para prestamistas serios y comprometidos.
                            </p>
                        </motion.div>

                        <motion.div
                             initial={{ opacity: 0, y: 30 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <GlassCard className="text-center">
                                <h2 className="text-xl font-semibold text-white mb-2">Gestiona tu Suscripción</h2>
                                <p className="text-white/60 mb-4">¿Ya tienes un plan? Cancela, actualiza tu plan o método de pago aquí.</p>
                                <motion.button 
                                    onClick={handleManageSubscription}
                                    disabled={isManaging}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg transition duration-300 ease-in-out disabled:opacity-60"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isManaging ? (
                                        <span className="flex items-center"><FiRotateCw className="animate-spin mr-2" /> Abriendo...</span>
                                    ) : (
                                        <span className="flex items-center"><FiSettings className="mr-2" /> Portal de Cliente</span>
                                    )}
                                </motion.button>
                            </GlassCard>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg relative max-w-3xl mx-auto" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </motion.div>
                        )}

                        {/* Planes de Suscripción */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                    <GlassCard className={`relative overflow-hidden border-2 ${plan.isPopular ? 'border-blue-500' : 'border-white/20'}`}>
                                        {plan.isPopular && (
                                            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                                <span className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">Más Popular</span>
                                            </div>
                                        )}
                                        <div className="p-8 text-center">
                                            <h2 className="font-bold text-2xl text-white">{plan.name}</h2>
                                            <div className="my-6">
                                                <span className="text-5xl font-extrabold text-white">€{plan.price}</span>
                                                <span className="ml-1 text-xl text-white/70">/mes</span>
                                            </div>
                                            <ul className="space-y-4 my-8 text-left">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center text-white/90">
                                                        <FiCheckCircle className="w-5 h-5 text-green-400 mr-3" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <motion.button
                                                onClick={() => handleSubscribe(plan)}
                                                disabled={isLoading && selectedPlan === plan.priceId}
                                                className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out text-lg bg-gradient-to-r ${plan.gradient} text-white disabled:opacity-60`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isLoading && selectedPlan === plan.priceId ? 'Procesando...' : 'Suscribirme Ahora'}
                                            </motion.button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>

                        {/* Compras One-Time */}
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                            <GlassCard>
                                <h3 className="text-2xl font-bold text-white text-center mb-6">Compras Individuales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {aiLeadPackages.map((pkg) => (
                                        <div key={pkg.name} className="bg-white/10 p-6 rounded-xl border border-white/20">
                                            <h4 className="font-bold text-xl text-white mb-2">{pkg.name}</h4>
                                            <p className="text-white/70 mb-4">{pkg.description}</p>
                                            <div className="flex items-baseline mb-4">
                                                <span className="text-4xl font-extrabold text-white">€{pkg.price}</span>
                                                <span className="ml-2 text-white/70">/ {pkg.quantity} leads</span>
                                            </div>
                                            <motion.button
                                                onClick={() => handleOneTimePurchase(pkg)}
                                                disabled={isBuyingPackage === pkg.priceId}
                                                className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {isBuyingPackage === pkg.priceId ? 'Procesando...' : 'Comprar Paquete'}
                                            </motion.button>
                                        </div>
                                    ))}
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                        <h4 className="font-bold text-xl text-white mb-2">Paquetes Básicos</h4>
                                        <p className="text-white/70 mb-4">Para necesidades puntuales sin IA.</p>
                                        <div className="space-y-4">
                                            {leadPackages.map(pkg => (
                                                <div key={pkg.name} className="flex justify-between items-center">
                                                    <span className="text-white/80">{pkg.name}</span>
                                                    <motion.button
                                                        onClick={() => handleOneTimePurchase(pkg)}
                                                        disabled={isBuyingPackage === pkg.priceId}
                                                        className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg disabled:opacity-60"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                         €{pkg.price}
                                                    </motion.button>
                                                </div>
                                            ))}
                                        </div>
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