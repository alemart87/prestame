'use client';

import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiCheckCircle, FiDollarSign, FiZap, FiTarget, FiShield, FiStar, FiArrowRight, FiBarChart, FiUsers, FiClock, FiBrain } from 'react-icons/fi';
import Link from 'next/link';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import AppNavbar from '../../components/AppNavbar';

export default function HowItWorksPage() {
  const scoreFactors = [
    {
      icon: FiDollarSign,
      title: "Información Financiera",
      description: "Ingresos, gastos y tu capacidad de ahorro demuestran tu estabilidad económica.",
      color: "from-green-500 to-emerald-600",
      weight: "40%"
    },
    {
      icon: FiClock,
      title: "Estabilidad Laboral",
      description: "Tu tipo de empleo y antigüedad reflejan tu consistencia profesional.",
      color: "from-blue-500 to-cyan-600",
      weight: "20%"
    },
    {
      icon: FiBarChart,
      title: "Historial en la Plataforma",
      description: "Tu comportamiento con préstamos anteriores construye tu reputación.",
      color: "from-purple-500 to-pink-600",
      weight: "10%"
    },
    {
      icon: FiBrain,
      title: "Análisis Lingüístico IA",
      description: "Nuestro asistente IA evalúa tu comunicación y comportamiento financiero.",
      color: "from-indigo-500 to-purple-600",
      weight: "30%"
    }
  ];

  const improvementTips = [
    {
      icon: FiCheckCircle,
      title: "Completa tu Perfil al 100%",
      description: "Asegúrate de que toda tu información personal, laboral y financiera esté actualizada y sea precisa."
    },
    {
      icon: FiShield,
      title: "Demuestra Estabilidad",
      description: "Un empleo estable y una relación saludable entre tus ingresos y gastos son señales muy positivas."
    },
    {
      icon: FiTarget,
      title: "Sé Transparente",
      description: "No infles tus ingresos ni ocultes gastos. La honestidad construye confianza a largo plazo."
    },
    {
      icon: FiStar,
      title: "Construye un Historial",
      description: "Pagar tus préstamos a tiempo será el factor más importante para disparar tu score en el futuro."
    }
  ];

  const benefits = [
    "Acceso a un mayor número de prestamistas",
    "Posibilidad de solicitar montos más altos",
    "Ofertas con tasas de interés más bajas",
    "Mayor confianza y visibilidad en la plataforma",
    "Procesos de aprobación más rápidos",
    "Condiciones preferenciales y flexibles"
  ];

  return (
    <div>
      <AppNavbar />
      
      <AnimatedBackground particleCount={20}>
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl mb-8 relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiAward className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FiBrain className="w-3 h-3 text-white" />
                </div>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Tu Score
                <motion.span 
                  className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Final IA
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Tu Score Final combina datos financieros tradicionales con análisis de inteligencia artificial 
                para crear la evaluación más completa y precisa de tu perfil crediticio.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.div 
                  className="inline-flex items-center space-x-4 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiZap className="w-6 h-6 text-yellow-400" />
                  <span className="text-white font-semibold text-lg">Score Katupyry (70%)</span>
                </motion.div>
                
                <motion.div 
                  className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiBrain className="w-6 h-6 text-purple-400" />
                  <span className="text-white font-semibold text-lg">Análisis IA (30%)</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AnimatedBackground>

      {/* Score Factors Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Cómo se calcula tu Score Final?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Nuestro algoritmo de IA combina múltiples fuentes de datos para crear 
              la evaluación más precisa y justa de tu perfil crediticio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {scoreFactors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <GlassCard className="h-full text-center group-hover:bg-white/15 transition-all duration-300">
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${factor.color} rounded-2xl mb-6 relative`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <factor.icon className="w-8 h-8 text-white" />
                    <div className="absolute -top-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-white text-xs font-bold">{factor.weight}</span>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {factor.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {factor.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Improvement Tips Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <FiTrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¡Sube de Nivel!
          </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Mejorar tu score es un proceso activo. Aquí tienes las claves para potenciar tu perfil y acceder a mejores oportunidades.
          </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {improvementTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-start space-x-4">
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <tip.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {tip.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {tip.description}
                      </p>
              </div>
            </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <FiDollarSign className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Los Beneficios de un Score Alto
          </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Un score elevado te abre las puertas a un mundo de oportunidades financieras exclusivas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <FiCheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-white/90 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para mejorar tu Score?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Comienza hoy mismo a construir tu perfil financiero y accede a las mejores oportunidades de préstamo.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="group px-10 py-5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3 text-lg"
                >
                  <span>Crear Mi Perfil</span>
                  <FiArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="group px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-300 flex items-center space-x-3 text-lg"
                >
                  <span>Ver Mi Score</span>
                  <FiArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>
              </motion.div>
            </div>
          </motion.div>
      </div>
      </section>
    </div>
  );
} 