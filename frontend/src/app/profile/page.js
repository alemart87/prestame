'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreDisplay from '../../components/ScoreDisplay';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiDollarSign,
  FiUsers,
  FiSave,
  FiTrendingUp
} from 'react-icons/fi';

export default function ProfilePage() {
  const { user, profile, updateProfile, isBorrower, isLender, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && profile) {
      // Llenar el formulario con los datos existentes
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('email', user.email);
      setValue('phone', user.phone);
      setValue('address', user.address);
      setValue('city', user.city);
      setValue('department', user.department);

      if (isBorrower && profile) {
        setValue('monthly_income', profile.monthly_income);
        setValue('monthly_expenses', profile.monthly_expenses);
        setValue('dependents', profile.dependents);
        setValue('hobbies', profile.hobbies);
        setValue('employment_status', profile.employment_status);
        setValue('job_title', profile.job_title);
        setValue('employer', profile.employer);
      }

      if (isLender && profile) {
        setValue('min_amount', profile.min_amount);
        setValue('max_amount', profile.max_amount);
        setValue('interest_rate', profile.interest_rate);
        setValue('payment_frequency_preference', profile.payment_frequency_preference);
        setValue('risk_tolerance', profile.risk_tolerance);
      }
    }
  }, [user, profile, authLoading, router, setValue, isBorrower, isLender]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Omitir el email de los datos a enviar
      const { email, ...userData } = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        department: data.department,
      };

      const profileData = {};

      if (isBorrower) {
        profileData.monthly_income = parseFloat(data.monthly_income) || null;
        profileData.monthly_expenses = parseFloat(data.monthly_expenses) || null;
        profileData.dependents = parseInt(data.dependents) || 0;
        profileData.hobbies = data.hobbies;
        profileData.employment_status = data.employment_status;
        profileData.job_title = data.job_title;
        profileData.employer = data.employer;
        
        // Calcular ratio de deuda a ingresos
        if (profileData.monthly_income && profileData.monthly_expenses) {
          profileData.debt_to_income_ratio = profileData.monthly_expenses / profileData.monthly_income;
        }
      }

      if (isLender) {
        profileData.min_amount = parseFloat(data.min_amount) || null;
        profileData.max_amount = parseFloat(data.max_amount) || null;
        profileData.interest_rate = parseFloat(data.interest_rate) || null;
        profileData.payment_frequency_preference = data.payment_frequency_preference;
        profileData.risk_tolerance = data.risk_tolerance;
      }

      const result = await updateProfile({
        user: userData,
        profile: profileData
      });

      if (result.success) {
        setSuccess('Perfil actualizado exitosamente');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">
            {isBorrower ? 'Completa tu información para mejorar tu Score Katupyry' : 'Configura tus preferencias de préstamo'}
          </p>
        </div>
        
        {profile && isBorrower && (
          <div className="mt-4 sm:mt-0">
            <ScoreDisplay score={profile.score || 0} showDetails={true} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Información Personal */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FiUser className="mr-2" />
            Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                {...register('first_name', { required: 'El nombre es requerido' })}
                type="text"
                className="input-field"
                placeholder="Tu nombre"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                {...register('last_name', { required: 'El apellido es requerido' })}
                type="text"
                className="input-field"
                placeholder="Tu apellido"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-10 bg-gray-100 cursor-not-allowed"
                  placeholder="tu@email.com"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('phone', { required: 'El teléfono es requerido' })}
                  type="tel"
                  className="input-field pl-10"
                  placeholder="0981 123 456"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('address')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Tu dirección completa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                {...register('city')}
                type="text"
                className="input-field"
                placeholder="Asunción"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                {...register('department')}
                className="input-field"
              >
                <option value="">Seleccionar</option>
                <option value="Asunción">Asunción</option>
                <option value="Central">Central</option>
                <option value="Alto Paraná">Alto Paraná</option>
                <option value="Itapúa">Itapúa</option>
                <option value="Caaguazú">Caaguazú</option>
                <option value="Paraguarí">Paraguarí</option>
                <option value="San Pedro">San Pedro</option>
                <option value="Cordillera">Cordillera</option>
                <option value="Guairá">Guairá</option>
                <option value="Caazapá">Caazapá</option>
                <option value="Misiones">Misiones</option>
                <option value="Ñeembucú">Ñeembucú</option>
                <option value="Amambay">Amambay</option>
                <option value="Canindeyú">Canindeyú</option>
                <option value="Presidente Hayes">Presidente Hayes</option>
                <option value="Concepción">Concepción</option>
                <option value="Alto Paraguay">Alto Paraguay</option>
                <option value="Boquerón">Boquerón</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información Específica para Prestatarios */}
        {isBorrower && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiDollarSign className="mr-2" />
              Información Financiera
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingresos Mensuales (Gs.)
                </label>
                <input
                  {...register('monthly_income')}
                  type="number"
                  className="input-field"
                  placeholder="2000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos Mensuales (Gs.)
                </label>
                <input
                  {...register('monthly_expenses')}
                  type="number"
                  className="input-field"
                  placeholder="1500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Dependientes
                </label>
                <input
                  {...register('dependents')}
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Laboral
                </label>
                <select
                  {...register('employment_status')}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Independiente">Independiente</option>
                  <option value="Desempleado">Desempleado</option>
                  <option value="Jubilado">Jubilado</option>
                  <option value="Estudiante">Estudiante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo/Puesto
                </label>
                <input
                  {...register('job_title')}
                  type="text"
                  className="input-field"
                  placeholder="Desarrollador, Contador, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleador/Empresa
                </label>
                <input
                  {...register('employer')}
                  type="text"
                  className="input-field"
                  placeholder="Nombre de la empresa"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hobbies e Intereses
                </label>
                <input
                  {...register('hobbies')}
                  type="text"
                  className="input-field"
                  placeholder="Deportes, lectura, música, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Información Específica para Prestamistas */}
        {isLender && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiUsers className="mr-2" />
              Preferencias de Préstamo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Mínimo (Gs.)
                </label>
                <input
                  {...register('min_amount')}
                  type="number"
                  className="input-field"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Máximo (Gs.)
                </label>
                <input
                  {...register('max_amount')}
                  type="number"
                  className="input-field"
                  placeholder="10000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa de Interés Deseada (%)
                </label>
                <input
                  {...register('interest_rate')}
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="15.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia de Pago Preferida
                </label>
                <select
                  {...register('payment_frequency_preference')}
                  className="input-field"
                >
                  <option value="">Sin preferencia</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tolerancia al Riesgo
                </label>
                <select
                  {...register('risk_tolerance')}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  <option value="low">Bajo - Solo prestatarios con score alto</option>
                  <option value="medium">Medio - Balance entre riesgo y retorno</option>
                  <option value="high">Alto - Dispuesto a asumir más riesgo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Botón de guardar */}
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
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Información del Score para Prestatarios */}
      {isBorrower && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiTrendingUp className="mr-2" />
            Cómo Mejorar tu Score Katupyry
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Completa tu perfil:</strong> Proporciona información precisa sobre tus ingresos y gastos</p>
            <p>• <strong>Estabilidad laboral:</strong> Mantén un empleo estable y actualiza tu información</p>
            <p>• <strong>Reduce tu ratio de deuda:</strong> Mantén tus gastos por debajo del 50% de tus ingresos</p>
            <p>• <strong>Historial de pagos:</strong> Cumple con tus compromisos financieros puntualmente</p>
            <p>• <strong>Actividad en la plataforma:</strong> Mantén un comportamiento responsable</p>
          </div>
        </div>
      )}
    </div>
  );
} 