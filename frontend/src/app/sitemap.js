export default function sitemap() {
  const baseUrl = 'https://www.prestame.com.py'; // Reemplaza con tu dominio

  // Aquí agregarías rutas dinámicas (ej: posts de un blog) en el futuro
  const staticRoutes = [
    '',
    '/how-it-works',
    '/login',
    '/register',
    '/loans',
    '/forgot-password',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [
    ...staticRoutes,
    // ...tus rutas dinámicas aquí
  ];
} 