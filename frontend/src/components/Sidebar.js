'use client'

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaUser, FaFileContract, FaUsers, FaCoins, FaQuestionCircle, FaSignInAlt, FaUserPlus, FaRobot, FaHandshake } from 'react-icons/fa';

const MenuItem = ({ icon, href, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <li>
            <Link href={href}>
                <span className={`flex items-center p-3 text-base font-normal rounded-lg transition duration-75 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-900 hover:bg-gray-100'}`}>
                    <div className={`w-6 h-6 transition duration-75 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                        {icon}
                    </div>
                    <span className="ml-3">{children}</span>
                </span>
            </Link>
        </li>
    );
};


const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const publicRoutes = ['/login', '/register', '/how-it-works'];

    if (publicRoutes.includes(pathname)) {
        return null;
    }

    return (
        <>
            <aside id="sidebar-multi-level-sidebar" className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`} aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r border-gray-200">
                    <Link href="/" className="flex items-center pl-2.5 mb-5">
                        <span className="self-center text-2xl font-extrabold text-blue-600 whitespace-nowrap">Prestame</span>
                    </Link>
                    <ul className="space-y-2">
                        {user ? (
                            <>
                                <MenuItem icon={<FaTachometerAlt />} href="/dashboard">Dashboard</MenuItem>
                                <MenuItem icon={<FaUser />} href="/profile">Mi Perfil</MenuItem>

                                {user.user_type === 'lender' && (
                                    <>
                                        <MenuItem icon={<FaFileContract />} href="/loan-request">Crear Préstamo</MenuItem>
                                        <MenuItem icon={<FaCoins />} href="/subscriptions">Planes y Precios</MenuItem>
                                        <MenuItem icon={<FaUsers />} href="/leads">Mis Leads</MenuItem>
                                        <MenuItem icon={<FaRobot />} href="/ai-lead-finder">Buscar Leads con IA</MenuItem>
                                    </>
                                )}

                                {user.user_type === 'borrower' && (
                                    <>
                                        <MenuItem icon={<FaHandshake />} href="/loans">Ver Préstamos</MenuItem>
                                        <MenuItem icon={<FaUsers />} href="/my-loans">Mis Solicitudes</MenuItem>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <MenuItem icon={<FaSignInAlt />} href="/login">Iniciar Sesión</MenuItem>
                                <MenuItem icon={<FaUserPlus />} href="/register">Registro</MenuItem>
                                <MenuItem icon={<FaQuestionCircle />} href="/how-it-works">¿Cómo funciona?</MenuItem>
                            </>
                        )}
                    </ul>
                </div>
            </aside>
            {isOpen && <div className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50" onClick={toggleSidebar}></div>}
        </>
    );
};

export default Sidebar;