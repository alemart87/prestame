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

                <div className="mt-20 max-w-3xl mx-auto p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">¿Necesitas un impulso extra?</h3>
                    <p className="text-gray-600 mt-2 max-w-md mx-auto">
                        Si ya tienes una suscripción activa, puedes comprar paquetes de leads adicionales.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                        {leadPackages.map((pkg) => (
                            <div key={pkg.name} className="text-center p-4">
                                <span className="font-bold text-2xl text-gray-800">{pkg.price} Lead{pkg.price > 1 ? 's' : ''} por €{pkg.price}</span>
                                <button
                                    onClick={() => handleOneTimePurchase(pkg)}
                                    disabled={isBuyingPackage === pkg.priceId}
                                    className="mt-2 w-full sm:w-auto bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out hover:bg-green-700 disabled:bg-green-400 disabled:cursor-wait"
                                >
                                    {isBuyingPackage === pkg.priceId ? 'Procesando...' : 'Comprar'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionsPage; 