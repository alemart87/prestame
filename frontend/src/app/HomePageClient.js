'use client';

import { motion } from 'framer-motion';
import { FiBookOpen, FiActivity, FiTrendingUp, FiStar, FiArrowRight, FiCheck, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import Navbar from '../components/Navbar';

export default function HomePageClient() {

  const processSteps = [
    {
      icon: FiBookOpen,
      title: "1. Aprende y Crece",
      description: "Accede a cursos, herramientas y un asistente IA que te ayudarán a entender y mejorar tu salud financiera.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: FiActivity,
      title: "2. Conoce tu Score Real",
      description: "Nuestro Score Final IA te da una visión clara y justa de tu perfil, basada en tu conocimiento y estabilidad.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: FiTrendingUp,
      title: "3. Accede a Oportunidades",
      description: "Con un perfil sólido y conocimiento real, accede a préstamos con mejores condiciones o invierte con confianza.",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const testimonials = [
    {
      name: "Laura Jiménez",
      role: "Profesional Independiente",
      content: "Más que un préstamo, encontré una guía. Prestame me enseñó a organizar mis finanzas y, como resultado, pude acceder a un crédito que antes me negaban.",
      rating: 5
    },
    {
      name: "Marcos Vera",
      role: "Inversionista Novato",
      content: "Quería invertir pero no sabía cómo. La plataforma me educó sobre riesgos y oportunidades, permitiéndome tomar decisiones inteligentes y rentables.",
      rating: 5
    },
    {
      name: "Sofía Gómez",
      role: "Estudiante Universitaria",
      content: "Me sentía abrumada por mis finanzas. El asistente IA y los cursos me dieron la confianza para crear mi primer presupuesto. ¡Totalmente recomendado!",
      rating: 5
    }
  ];

  return (
    <div>
      <Navbar />
      
      <AnimatedBackground particleCount={30}>
        {/* Hero Section */}
        <section 
          className="min-h-screen flex items-center justify-center px-4 pt-16"
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Toma el Control de
                <motion.span 
                  className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Tus Finanzas
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Más que préstamos, te damos el conocimiento y las herramientas para que construyas un futuro financiero sólido y próspero.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <FiBookOpen className="w-5 h-5" />
                    <span>Empieza a Aprender Gratis</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/loans"
                    className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <FiDollarSign className="w-5 h-5" />
                    <span>Explorar Préstamos</span>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AnimatedBackground>

        {/* Process Section */}
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
              Tu Camino hacia la Claridad Financiera
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Nuestro proceso está diseñado para empoderarte en cada paso.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
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
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {step.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
                </div>
              </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Historias de Éxito Financiero
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Personas como tú ya están transformando su relación con el dinero.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-white/80 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
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
              ¿Listo para dar el primer paso?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Únete a nuestra comunidad. Crea tu cuenta en menos de 2 minutos y comienza tu viaje hacia el bienestar financiero.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="group px-10 py-5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3 text-lg"
                >
                  <FiCheck className="w-6 h-6" />
                  <span>Crear Mi Cuenta</span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/how-it-works"
                  className="group px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-300 flex items-center space-x-3 text-lg"
                >
                  <span>¿Cómo funciona?</span>
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