'use client';

import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import Layout from '../components/Layout';

// Componente "inteligente" que decide qué layout usar
export default function AppShell({ children }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Páginas públicas que NO usan el layout principal
  const publicPages = ['/', '/login', '/register'];

  const isPublicPage = publicPages.includes(pathname);

  // Si es una página pública, no se muestra el Layout principal.
  // Si está autenticado, se muestra el Layout principal.
  // Si no está autenticado y no es una página pública, se muestra el Layout (la lógica de redirección se encargará)
  if (isAuthenticated && !isPublicPage) {
    return <Layout>{children}</Layout>;
  }
  
  // Para páginas públicas o para el proceso de carga/redirección, solo mostramos el contenido.
  return <>{children}</>;
} 