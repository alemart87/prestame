'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { FiDollarSign, FiShield, FiZap, FiUsers, FiTrendingUp, FiStar, FiArrowRight, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { useRef } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const features = [
    {
      icon: FiDollarSign,
      title: "Préstamos Inteligentes",
      description: "Conectamos prestamistas y prestatarios con tecnología de vanguardia y tasas competitivas.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: FiShield,
      title: "Seguridad Total",
      description: "Protección avanzada de datos y transacciones seguras con encriptación de nivel bancario.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: FiZap,
      title: "Proceso Rápido",
      description: "Aprobación en minutos, no en días. Tecnología que acelera tu futuro financiero.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: FiUsers,
      title: "Comunidad Confiable",
      description: "Miles de usuarios satisfechos construyendo juntos un ecosistema financiero sólido.",
      color: "from-orange-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Emprendedora",
      content: "Prestame me ayudó a conseguir el capital que necesitaba para mi negocio. El proceso fue increíblemente rápido y transparente.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Inversionista",
      content: "Como prestamista, he encontrado en Prestame la plataforma perfecta para diversificar mis inversiones con excelentes retornos.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Profesional",
      content: "La interfaz es intuitiva y el soporte al cliente excepcional. Definitivamente la mejor plataforma de préstamos P2P.",
      rating: 5
    }
  ];

  return (
    <div ref={ref}>
      <Navbar />
      
      <AnimatedBackground particleCount={30}>
        {/* Hero Section */}
        <motion.section 
          style={{ y, opacity }}
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
                El Futuro de los
                <motion.span 
                  className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Préstamos
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Conectamos personas que necesitan capital con inversionistas inteligentes. 
                Tecnología blockchain, seguridad bancaria, y la mejor experiencia de usuario.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register?type=borrower"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <FiDollarSign className="w-5 h-5" />
                    <span>Solicitar Préstamo</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register?type=lender"
                    className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <FiTrendingUp className="w-5 h-5" />
                    <span>Invertir Ahora</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </AnimatedBackground>

        {/* Features Section */}
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
              ¿Por qué elegir Prestame?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Revolucionamos el mundo de los préstamos con tecnología de vanguardia y un enfoque centrado en el usuario.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
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
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
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
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Miles de personas ya confían en Prestame para sus necesidades financieras.
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
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Únete a la revolución financiera. Crea tu cuenta en menos de 2 minutos y accede a un mundo de oportunidades.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="group px-10 py-5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3 text-lg"
                >
                  <FiCheck className="w-6 h-6" />
                  <span>Crear Cuenta Gratis</span>
                  <FiArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="group px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-300 flex items-center space-x-3 text-lg"
                >
                  <span>Ya tengo cuenta</span>
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