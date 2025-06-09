'use client';

import React, { useState } from 'react';
import { stripeService } from '../../../services/api';

// Usamos un ícono de check simple para replicar el de la imagen
const CheckIcon = () => (
    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const plans = [
    { name: 'Starter', price: '9', features: ['10 leads al mes', 'Acceso a la plataforma', 'Soporte por email'], priceId: 'price_1RXmTOGMLNY8JgDpxAl1QfGx', isPopular: false },
    { name: 'Pro', price: '29', features: ['50 leads al mes', 'Acceso a la plataforma', 'Soporte prioritario por email', 'Estadísticas básicas'], priceId: 'price_1RXmTdGMLNY8JgDptfVeN5bD', isPopular: true },
    { name: 'Pro Superior', price: '49', features: ['80 leads al mes', 'Soporte 24/7 con respuesta garantizada', 'Estadísticas avanzadas', 'Asesoramiento personalizado'], priceId: 'price_1RXmTnGMLNY8JgDp8yDvflG4', isPopular: false }
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
        <div className="bg-white text-gray-800 min-h-screen py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Un Plan Para Cada Necesidad
                    </h1>
                    <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                        Accede a leads de calidad y haz crecer tu cartera. Nuestros planes están diseñados para prestamistas serios y comprometidos.
                    </p>
                </div>

                <div className="text-center mb-12">
                    <button 
                        onClick={handleManageSubscription}
                        disabled={isManaging}
                        className="bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out hover:bg-gray-900 disabled:bg-gray-600 disabled:cursor-wait"
                    >
                        {isManaging ? 'Abriendo...' : 'Gestionar Mi Suscripción'}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">¿Ya tienes un plan? Cancela, actualiza tu plan o método de pago aquí.</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 max-w-3xl mx-auto" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Sección principal: Planes de Suscripción */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Planes de Suscripción Mensual</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        La mejor opción para prestamistas serios. Flujo constante de leads verificados con soporte completo.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-2xl shadow-lg p-8 transition-transform duration-300 transform hover:shadow-2xl ${
                                plan.isPopular ? 'border-2 border-blue-500' : 'border border-gray-200'
                            }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">Más Popular</span>
                                </div>
                            )}

                            <div className="text-center">
                                <h2 className="font-bold text-2xl text-gray-900">{plan.name}</h2>
                                <div className="my-6">
                                    <span className="text-5xl font-extrabold text-gray-900">€{plan.price}</span>
                                    <span className="ml-1 text-xl text-gray-500">/mes</span>
                                </div>
                            </div>
                            
                            <ul className="space-y-4 my-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <CheckIcon />
                                        <span className="ml-3 text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={isLoading && selectedPlan === plan.priceId}
                                className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out text-lg ${
                                    plan.isPopular
                                    ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                                    : 'bg-gray-800 text-white hover:bg-gray-900'
                                } ${
                                    isLoading && selectedPlan === plan.priceId ? 'opacity-70 cursor-wait' : ''
                                }`}
                            >
                                {isLoading && selectedPlan === plan.priceId ? 'Procesando...' : 'Suscribirme Ahora'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Separador visual */}
                <div className="my-20">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-6 bg-white text-gray-500 font-medium">¿Prefieres comprar leads individuales?</span>
                        </div>
                    </div>
                </div>

                {/* Sección secundaria: Compras de Leads */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Compras Individuales de Leads</h3>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Para necesidades puntuales o para probar nuestros servicios antes de suscribirte
                        </p>
                    </div>

                    {/* LEADS CON IA como opción destacada pero secundaria */}
                    <div className="mb-12">
                        <div className="text-center mb-6">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">🤖 Leads con Inteligencia Artificial</h4>
                            <p className="text-gray-600">
                                Datos verificados extraídos automáticamente de sitios paraguayos
                            </p>
                        </div>
                        
                        {aiLeadPackages.map((pkg) => (
                            <div key={pkg.name} className="max-w-xl mx-auto mb-8">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6 border border-blue-200">
                                    <div className="text-center mb-4">
                                        <h5 className="font-bold text-xl text-gray-900 mb-2">{pkg.name}</h5>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <span className="text-3xl font-extrabold text-blue-600">€{pkg.price}</span>
                                            <div className="text-left">
                                                <div className="text-sm text-gray-600">por {pkg.quantity} leads</div>
                                                <div className="text-xs text-green-600 font-semibold">€0.50 por lead</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 text-sm">
                                        {pkg.features.map((feature, index) => (
                                            <div key={index} className="flex items-center">
                                                <CheckIcon />
                                                <span className="ml-2 text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <button
                                            onClick={() => handleOneTimePurchase(pkg)}
                                            disabled={isBuyingPackage === pkg.priceId}
                                            className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out hover:from-blue-700 hover:to-green-700 disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            {isBuyingPackage === pkg.priceId ? '🔄 Procesando...' : '🛒 Comprar Leads con IA'}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">
                                            💳 Pago único • ⚡ Entrega inmediata • 🔒 Datos 100% reales
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Leads básicos sin IA */}
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-6">
                            <h4 className="text-lg font-semibold text-gray-800">📋 Leads Básicos (Sin IA)</h4>
                            <p className="text-gray-600 text-sm">
                                Leads básicos sin verificación automática - Para suscriptores existentes
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                {leadPackages.map((pkg) => (
                                    <div key={pkg.name} className="text-center p-4 bg-white rounded-lg border border-gray-300 flex-1 max-w-xs">
                                        <span className="font-semibold text-lg text-gray-800">{pkg.price} Lead{pkg.price > 1 ? 's' : ''}</span>
                                        <div className="text-sm text-gray-600 mb-3">€{pkg.price}</div>
                                        <button
                                            onClick={() => handleOneTimePurchase(pkg)}
                                            disabled={isBuyingPackage === pkg.priceId}
                                            className="w-full bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-wait text-sm"
                                        >
                                            {isBuyingPackage === pkg.priceId ? 'Procesando...' : 'Comprar'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                ⚠️ Estos leads no incluyen verificación con IA ni garantía de datos reales
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionsPage; 