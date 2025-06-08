'use client';

import { FiAward, FiTrendingUp, FiCheckCircle, FiDollarSign, FiZap } from 'react-icons/fi';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <FiAward className="mx-auto h-12 w-12 text-blue-600" />
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Entiende tu Score Katupyry
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Tu Score Katupyry es la clave para acceder a mejores préstamos. Es un puntaje dinámico que refleja tu confiabilidad como prestatario en nuestra comunidad.
        </p>
      </div>

      <div className="space-y-10">
        {/* Sección 1: ¿Qué es? */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FiZap className="mr-3 text-yellow-500" />
            ¿Qué es y cómo se calcula?
          </h2>
          <p className="text-gray-600 mb-4">
            El Score Katupyry es un número del 1 al 100 que evalúa tu perfil financiero y personal. Un score más alto te da acceso a más ofertas de préstamos, con mejores tasas y condiciones.
          </p>
          <p className="text-gray-600">
            Se calcula usando varios factores clave de tu perfil:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
            <li><strong>Información Financiera:</strong> Ingresos, gastos y tu capacidad de ahorro.</li>
            <li><strong>Estabilidad Laboral:</strong> Tu tipo de empleo y antigüedad.</li>
            <li><strong>Historial en la Plataforma:</strong> (Próximamente) Tu comportamiento con préstamos anteriores.</li>
            <li><strong>Perfil Completo:</strong> La cantidad y calidad de la información que proporcionas.</li>
          </ul>
        </div>

        {/* Sección 2: ¿Cómo mejorarlo? */}
        <div className="card bg-blue-50 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FiTrendingUp className="mr-3 text-green-500" />
            ¡Sube de Nivel! Cómo Mejorar tu Score
          </h2>
          <p className="text-gray-600 mb-4">
            Mejorar tu score es un proceso activo. Aquí tienes las claves para potenciar tu perfil:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <FiCheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">Completa tu Perfil al 100%</h3>
                <p className="text-gray-600">Asegúrate de que toda tu información personal, laboral y financiera esté actualizada y sea precisa.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">Demuestra Estabilidad</h3>
                <p className="text-gray-600">Un empleo estable y una relación saludable entre tus ingresos y gastos son señales muy positivas.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">Sé Transparente</h3>
                <p className="text-gray-600">No infles tus ingresos ni ocultes gastos. La honestidad construye confianza a largo plazo.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">Construye un Historial (Próximamente)</h3>
                <p className="text-gray-600">Pagar tus préstamos a tiempo será el factor más importante para disparar tu score en el futuro.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Beneficios */}
        <div className="card">
           <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FiDollarSign className="mr-3 text-blue-500" />
            Los Beneficios de un Score Alto
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Acceso a un mayor número de prestamistas.</li>
            <li>Posibilidad de solicitar montos más altos.</li>
            <li>Ofertas con tasas de interés más bajas.</li>
            <li>Mayor confianza y visibilidad en la plataforma.</li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-12">
        <Link href="/dashboard" className="btn btn-primary">
            Volver a mi Dashboard
        </Link>
      </div>
    </div>
  );
} 