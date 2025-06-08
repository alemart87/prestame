'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { borrowerService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreDisplay from '../../components/ScoreDisplay';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiFileText, 
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi';

export default function LoanRequestPage() {
  const { user, profile, isBorrower, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && !isBorrower) {
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, isBorrower, router]);

  const watchAmount = watch('amount');
  const watchPaymentFrequency = watch('payment_frequency');
  const watchTermMonths = watch('term_months');

  // Calcular cuota estimada
  const calculateEstimatedPayment = () => {
    if (!watchAmount || !watchTermMonths) return 0;
    
    const amount = parseFloat(watchAmount);
    const months = parseInt(watchTermMonths);
    const interestRate = 0.15; // 15% anual estimado
    
    if (watchPaymentFrequency === 'monthly') {
      const monthlyRate = interestRate / 12;
      const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                     (Math.pow(1 + monthlyRate, months) - 1);
      return payment;
    } else if (watchPaymentFrequency === 'weekly') {
      const weeklyRate = interestRate / 52;
      const weeks = months * 4.33;
      const payment = (amount * weeklyRate * Math.pow(1 + weeklyRate, weeks)) / 
                     (Math.pow(1 + weeklyRate, weeks) - 1);
      return payment;
    } else if (watchPaymentFrequency === 'daily') {
      const dailyRate = interestRate / 365;
      const days = months * 30;
      const payment = (amount * dailyRate * Math.pow(1 + dailyRate, days)) / 
                     (Math.pow(1 + dailyRate, days) - 1);
      return payment;
    }
    
    return 0;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const loanData = {
        amount: parseFloat(data.amount),
        purpose: data.purpose,
        payment_frequency: data.payment_frequency,
        term_months: parseInt(data.term_months),
        description: data.description,
        collateral: data.collateral
      };

      const response = await borrowerService.createLoanRequest(loanData);
      
      if (response.data) {
        setSuccess('¡Solicitud de préstamo creada exitosamente!');
        setTimeout(() => {
          router.push('/my-loans');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la solicitud de préstamo');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }

  if (!user || !isBorrower) {
    return null;
  }

  const estimatedPayment = calculateEstimatedPayment();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Solicitud de Préstamo</h1>
          <p className="text-gray-600">
            Completa la información para solicitar tu préstamo
          </p>
        </div>
        
        {profile && (
          <div className="mt-4 sm:mt-0">
            <ScoreDisplay score={profile.score || 0} showDetails={true} />
          </div>
        )}
      </div>

      {/* Información del Score */}
      {profile && profile.score < 50 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Mejora tu Score Katupyry
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Un score más alto aumenta tus posibilidades de obtener mejores condiciones. 
                <a href="/profile" className="font-medium underline">Completa tu perfil</a> para mejorar tu score.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl flex items-center">
            <FiCheckCircle className="mr-2" />
            {success}
          </div>
        )}

        {/* Información del Préstamo */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FiDollarSign className="mr-2" />
            Detalles del Préstamo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Solicitado (Gs.) *
              </label>
              <input
                {...register('amount', { 
                  required: 'El monto es requerido',
                  min: { value: 100000, message: 'El monto mínimo es Gs. 100.000' },
                  max: { value: 50000000, message: 'El monto máximo es Gs. 50.000.000' }
                })}
                type="number"
                className="input-field"
                placeholder="1000000"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
              {watchAmount && (
                <p className="mt-1 text-sm text-gray-600">
                  {formatCurrency(watchAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Propósito del Préstamo *
              </label>
              <select
                {...register('purpose', { required: 'El propósito es requerido' })}
                className="input-field"
              >
                <option value="">Seleccionar propósito</option>
                <option value="Negocio">Negocio</option>
                <option value="Educación">Educación</option>
                <option value="Salud">Salud</option>
                <option value="Vivienda">Vivienda</option>
                <option value="Vehículo">Vehículo</option>
                <option value="Consolidación de deudas">Consolidación de deudas</option>
                <option value="Emergencia">Emergencia</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia de Pago *
              </label>
              <select
                {...register('payment_frequency', { required: 'La frecuencia de pago es requerida' })}
                className="input-field"
              >
                <option value="">Seleccionar frecuencia</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
              {errors.payment_frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_frequency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plazo (meses) *
              </label>
              <select
                {...register('term_months', { required: 'El plazo es requerido' })}
                className="input-field"
              >
                <option value="">Seleccionar plazo</option>
                <option value="1">1 mes</option>
                <option value="2">2 meses</option>
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="18">18 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
              </select>
              {errors.term_months && (
                <p className="mt-1 text-sm text-red-600">{errors.term_months.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción Detallada
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="input-field"
                placeholder="Explica en detalle para qué necesitas el préstamo y cómo planeas pagarlo..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Garantía o Colateral (opcional)
              </label>
              <input
                {...register('collateral')}
                type="text"
                className="input-field"
                placeholder="Ej: Vehículo, propiedad, etc."
              />
            </div>
          </div>
        </div>

        {/* Calculadora de Cuotas */}
        {estimatedPayment > 0 && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <FiInfo className="mr-2" />
              Estimación de Cuota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-blue-700">Cuota Estimada</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(estimatedPayment)}
                </p>
                <p className="text-xs text-blue-600">
                  {watchPaymentFrequency === 'monthly' ? 'por mes' : 
                   watchPaymentFrequency === 'weekly' ? 'por semana' : 'por día'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-700">Total a Pagar</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(estimatedPayment * (
                    watchPaymentFrequency === 'monthly' ? watchTermMonths :
                    watchPaymentFrequency === 'weekly' ? watchTermMonths * 4.33 :
                    watchTermMonths * 30
                  ))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-700">Tasa Estimada</p>
                <p className="text-xl font-bold text-blue-900">15% anual</p>
                <p className="text-xs text-blue-600">Aproximada</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Esta es una estimación basada en una tasa promedio del 15% anual. 
                La tasa final dependerá de tu Score Katupyry y las condiciones del prestamista.
              </p>
            </div>
          </div>
        )}

        {/* Términos y Condiciones */}
        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Términos y Condiciones
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Al enviar esta solicitud, confirmas que toda la información proporcionada es veraz.</p>
            <p>• Tu solicitud será visible para prestamistas registrados en la plataforma.</p>
            <p>• Prestame actúa como intermediario y no otorga préstamos directamente.</p>
            <p>• Las condiciones finales (tasa, plazo, etc.) se negocian directamente con el prestamista.</p>
            <p>• Puedes cancelar tu solicitud en cualquier momento antes de ser financiada.</p>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <>
                <FiSave className="mr-2 h-4 w-4" />
                Enviar Solicitud
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 