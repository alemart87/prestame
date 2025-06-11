'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiHome, 
  FiGrid,
  FiSend,
  FiClock,
  FiStar,
  FiCpu,
  FiBriefcase,
  FiCreditCard,
  FiHelpCircle,
  FiChevronDown,
  FiSettings,
  FiShield
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isBorrower, isLender, isSuperAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Navegación principal según tipo de usuario
  const getNavItems = () => {
    if (isSuperAdmin) {
      return [
        { href: '/admin/dashboard', label: 'Admin Panel', icon: FiShield },
      ];
    }

    const commonItems = [
      { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
      { href: '/profile', label: 'Mi Perfil', icon: FiUser },
    ];

    if (isBorrower) {
      return [
        ...commonItems,
        { href: '/loan-request', label: 'Solicitar Préstamo', icon: FiSend },
        { href: '/my-loans', label: 'Mis Préstamos', icon: FiClock },
        { href: '/financial-analysis', label: 'Análisis de Fiabilidad', icon: FiShield },
        { href: '/how-it-works', label: '¿Cómo funciona?', icon: FiHelpCircle },
      ];
    }

    if (isLender) {
      return [
        ...commonItems,
        { href: '/leads', label: 'Ver Leads', icon: FiStar },
        { href: '/ai-lead-finder', label: 'Buscar con IA', icon: FiCpu },
        { href: '/financial-analysis', label: 'Análisis de Fiabilidad', icon: FiShield },
        { href: '/loans', label: 'Préstamos Activos', icon: FiBriefcase },
        { href: '/subscriptions', label: 'Planes', icon: FiCreditCard },
        { href: '/how-it-works', label: '¿Cómo funciona?', icon: FiHelpCircle },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg' 
          : 'backdrop-blur-md bg-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3"
          >
            <Link href="/dashboard" className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-white font-bold text-xl">P</span>
              </motion.div>
              <span className="font-bold text-2xl text-white">Prestame</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.slice(0, 4).map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      pathname === item.href
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
            
            {/* Más opciones si hay más de 4 items */}
            {navItems.length > 4 && (
              <div className="relative">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-medium text-sm">Más</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl py-2"
                    >
                      {navItems.slice(4).map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-300 ${
                              pathname === item.href
                                ? 'bg-white/20 text-white'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* User Menu Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <motion.button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-white/60 text-xs">
                    {isSuperAdmin ? 'Admin' : isBorrower ? 'Prestatario' : 'Prestamista'}
                  </p>
                </div>
                <FiChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl py-2"
                  >
                    <div className="px-4 py-3 border-b border-white/20">
                      <p className="text-white font-medium">{user?.first_name} {user?.last_name}</p>
                      <p className="text-white/60 text-sm">{user?.email}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span className="text-sm">Configuración</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-300 w-full text-left"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span className="text-sm">Cerrar Sesión</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-xl bg-white/10 border-t border-white/20"
          >
            <div className="px-4 py-6 space-y-4">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 px-4 py-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-white/60 text-sm">
                    {isSuperAdmin ? 'Admin' : isBorrower ? 'Prestatario' : 'Prestamista'}
                  </p>
                </div>
              </div>

              {/* Navigation Items Mobile */}
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                        pathname === item.href
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Logout Mobile */}
              <div className="pt-4 border-t border-white/20">
                <motion.button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-all duration-300 w-full text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Cerrar Sesión</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default AppNavbar; 