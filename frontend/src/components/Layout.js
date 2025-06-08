'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import {
  FiMenu, FiX, FiUser, FiLogOut, FiHelpCircle, FiSend, FiClock,
  FiStar, FiBriefcase, FiGrid, FiShield, FiHome, FiCreditCard, FiCpu
} from 'react-icons/fi';

function SidebarLink({ href, icon: Icon, children, closeSidebar }) {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuth();
  const isActive = pathname === href;

  const baseClasses = 'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg';
  const activeClass = isSuperAdmin ? 'bg-red-700 text-white' : 'bg-primary-600 text-white';
  const inactiveClass = isSuperAdmin ? 'text-red-100 hover:bg-red-800' : 'text-gray-300 hover:bg-gray-700';

  return (
    <Link
      href={href}
      onClick={closeSidebar}
      className={`${baseClasses} ${isActive ? activeClass : inactiveClass}`}
    >
      <Icon className="mr-3 h-5 w-5" />
      {children}
    </Link>
  );
}

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isBorrower, isLender, isSuperAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  const closeSidebar = () => setSidebarOpen(false);

  const navigationContent = (
    <>
      <div className="flex-1 space-y-2">
        {isSuperAdmin ? (
          <SidebarLink href="/admin/dashboard" icon={FiShield} closeSidebar={closeSidebar}>Admin</SidebarLink>
        ) : (
          <>
            <SidebarLink href="/dashboard" icon={FiGrid} closeSidebar={closeSidebar}>Dashboard</SidebarLink>
            <SidebarLink href="/profile" icon={FiUser} closeSidebar={closeSidebar}>Mi Perfil</SidebarLink>
            {isBorrower && (
              <>
                <SidebarLink href="/loan-request" icon={FiSend} closeSidebar={closeSidebar}>Solicitar Préstamo</SidebarLink>
                <SidebarLink href="/my-loans" icon={FiClock} closeSidebar={closeSidebar}>Mis Préstamos</SidebarLink>
              </>
            )}
            {isLender && (
              <>
                <SidebarLink href="/leads" icon={FiStar} closeSidebar={closeSidebar}>Ver Leads</SidebarLink>
                <SidebarLink href="/ai-lead-finder" icon={FiCpu} closeSidebar={closeSidebar}>Buscar con IA</SidebarLink>
                <SidebarLink href="/loans" icon={FiBriefcase} closeSidebar={closeSidebar}>Préstamos Activos</SidebarLink>
                <SidebarLink href="/subscriptions" icon={FiCreditCard} closeSidebar={closeSidebar}>Planes y Precios</SidebarLink>
              </>
            )}
            <SidebarLink href="/how-it-works" icon={FiHelpCircle} closeSidebar={closeSidebar}>¿Cómo funciona?</SidebarLink>
          </>
        )}
      </div>
      
      {/* User menu and Logout */}
      <div className="pt-4 border-t border-gray-700">
        <div className="px-3 py-2 space-y-2">
          <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <FiLogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <FiX className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex flex-shrink-0 items-center px-4">
                  <Link href="/" className="text-2xl font-bold text-white text-gradient">
                    Prestame
                  </Link>
                </div>
                <nav className="mt-8 flex-1 px-3 flex flex-col justify-between">
                  {navigationContent}
                </nav>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-800 pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="text-2xl font-bold text-white text-gradient">
              Prestame
            </Link>
          </div>
          <nav className="mt-8 flex-1 px-3 flex flex-col justify-between">
            {navigationContent}
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <FiMenu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 