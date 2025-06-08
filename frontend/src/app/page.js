'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaRobot } from 'react-icons/fa';

export default function WelcomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    router.push('/register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLearnMore = () => {
    router.push('/how-it-works');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Navbar mejorado */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-8 py-6 bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="font-bold text-2xl">Prestame</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLogin}
            className="hover:text-blue-300 transition-colors duration-300 px-6 py-2.5 rounded-lg hover:bg-white/10 font-medium"
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-500"
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className={`flex flex-col items-center justify-center min-h-[80vh] px-8 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-4xl">
            La plataforma de préstamos 
            <span className="text-blue-400"> peer-to-peer</span> más confiable de Paraguay
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Conectamos prestatarios con prestamistas de forma segura, rápida y transparente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button 
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              Comenzar Ahora
            </button>
            <button 
              onClick={handleLearnMore}
              className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
            >
              Cómo Funciona
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-2">+1,000</div>
              <div className="text-gray-300">Préstamos Exitosos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-2">₲50M+</div>
              <div className="text-gray-300">Capital Prestado</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-gray-300">Satisfacción</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              ¿Por qué elegir Prestame?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">100% Seguro</h3>
                <p className="text-gray-300">Tecnología de encriptación avanzada para proteger tus datos y transacciones.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Mejores Tasas</h3>
                <p className="text-gray-300">Tasas de interés competitivas para prestatarios y prestamistas.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Proceso Rápido</h3>
                <p className="text-gray-300">Aprobación en minutos con nuestro sistema automatizado.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Comunidad</h3>
                <p className="text-gray-300">Únete a una comunidad de paraguayos que se ayudan mutuamente.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Score Katupyry</h3>
                <p className="text-gray-300">Sistema de puntuación único que evalúa el riesgo de manera justa.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Soporte 24/7</h3>
                <p className="text-gray-300">Nuestro equipo está disponible para ayudarte cuando lo necesites.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nueva Sección de Búsqueda con IA */}
        <section className="py-20 px-8">
            <div className="max-w-4xl mx-auto text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
                <FaRobot className="mx-auto text-6xl text-blue-400 mb-6" />
                <h2 className="text-4xl font-extrabold mb-4">Encuentra Clientes con el Poder de la IA</h2>
                <p className="max-w-3xl mx-auto text-lg text-gray-300 mb-8">
                  ¿Cansado de buscar leads? Conviértete en prestamista y accede a nuestra herramienta exclusiva. 
                  Simplemente describe a tu cliente ideal y nuestra IA generará una lista de contactos potenciales para ti. Ahorra tiempo, maximiza tu alcance.
                </p>
                <Link href="/register">
                  <span className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                    Descubrir Clientes Ahora
                  </span>
                </Link>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a miles de paraguayos que ya confían en Prestame.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="bg-green-600 hover:bg-green-700 font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300"
              >
                Crear Cuenta Gratis
              </button>
              <button 
                onClick={handleLearnMore}
                className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
              >
                Ver Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 py-8 px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold">P</span>
            </div>
            <span className="font-bold text-xl">Prestame</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 Prestame. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}