'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { stripeService } from '../../../services/api';
import { FiCheckCircle, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from '../../../components/LoadingSpinner';

const PaymentStatus = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Verificando tu pago, por favor espera...');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setMessage('No se encontró un ID de sesión de pago.');
            return;
        }

        const verifySession = async () => {
            try {
                const response = await stripeService.verifyCheckoutSession(sessionId);
                if (response.data.status === 'success') {
                    setStatus('success');
                    setMessage(response.data.message);
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Hubo un problema al verificar el pago.');
                }
            } catch (error) {
                setStatus('error');
                const errorMessage = error.response?.data?.error || 'No se pudo contactar al servidor para verificar el pago.';
                setMessage(errorMessage);
            }
        };

        verifySession();
    }, [sessionId]);

    const renderIcon = () => {
        switch (status) {
            case 'loading':
                return <FiLoader className="animate-spin text-4xl text-blue-500" />;
            case 'success':
                return <FiCheckCircle className="text-4xl text-green-500" />;
            case 'error':
                return <FiAlertTriangle className="text-4xl text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl text-center">
                <div className="flex justify-center">
                    {renderIcon()}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {status === 'loading' && 'Procesando Pago'}
                    {status === 'success' && '¡Pago Exitoso!'}
                    {status === 'error' && 'Error en el Pago'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    {message}
                </p>
                {status !== 'loading' && (
                    <Link href="/dashboard" className="inline-block w-full px-4 py-2 mt-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Ir al Dashboard
                    </Link>
                )}
            </div>
        </div>
    );
};

// Next.js 13+ App Router requiere un componente Suspense para usar searchParams
const PaymentSuccessPage = () => (
    <Suspense fallback={<LoadingSpinner />}>
        <PaymentStatus />
    </Suspense>
);

export default PaymentSuccessPage; 