'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiDollarSign, FiUsers } from 'react-icons/fi';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('borrower');
  const { register: registerUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    
    const type = searchParams.get('type');
    if (type && (type === 'borrower' || type === 'lender')) {
      setUserType(type);
    }
  }, [isAuthenticated, router, searchParams]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const userData = {
        ...data,
        user_type: userType
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const password = watch('password');

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Crear cuenta en Prestame
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {userType === 'borrower' 
              ? 'Regístrate para solicitar préstamos' 
              : 'Regístrate para ofrecer préstamos'
            }
          </p>
        </div>

        {/* Selector de tipo de usuario */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setUserType('borrower')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              userType === 'borrower'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiDollarSign className="mr-2 h-4 w-4" />
            Quiero un préstamo
          </button>
          <button
            type="button"
            onClick={() => setUserType('lender')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              userType === 'lender'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiUsers className="mr-2 h-4 w-4" />
            Quiero dar préstamos
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('first_name', { required: 'El nombre es requerido' })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Tu nombre"
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('last_name', { required: 'El apellido es requerido' })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Tu apellido"
                />
              </div>
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('email', { 
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido'
                  }
                })}
                type="email"
                className="input-field pl-10"
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('city')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Asunción"
                />
              </div>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('password', { 
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 8,
                    message: 'La contraseña debe tener al menos 8 caracteres'
                  }
                })}
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('confirmPassword', { 
                  required: 'Confirma tu contraseña',
                  validate: value => value === password || 'Las contraseñas no coinciden'
                })}
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 