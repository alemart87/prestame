import HomePageClient from './HomePageClient';

// ✅ METADATA EN EL COMPONENTE DE SERVIDOR
export const metadata = {
  title: 'Prestame - Educación Financiera para un Futuro Sólido',
  description: 'Toma el control de tus finanzas. Aprende con nuestras herramientas, mejora tu score crediticio con IA y accede a las mejores oportunidades en Paraguay.',
};

export default function Page() {
  return <HomePageClient />;
}