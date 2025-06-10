'use client';

// Este componente de Layout ahora es un 'pass-through'.
// La responsabilidad del layout, incluyendo el navbar y el fondo,
// se ha movido a cada página individual para permitir diseños únicos
// y consistentes con el nuevo sistema de diseño (AppNavbar, AnimatedBackground).
const Layout = ({ children }) => {
  return <>{children}</>;
};

export default Layout; 