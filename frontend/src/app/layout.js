import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import AppShell from './AppShell';
import { AIScoreButton, AIWowEffect } from '../components/AIComponents';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

// METADATA PARA SEO
export const metadata = {
  title: {
    template: '%s | Prestame - Educación Financiera',
    default: 'Prestame - Tu Guía Hacia el Bienestar Financiero en Paraguay',
  },
  description: 'Aprende a manejar tus finanzas, mejora tu score crediticio con IA y accede a las mejores oportunidades de inversión y préstamos en Paraguay.',
  metadataBase: new URL('https://prestame-frontend.onrender.com'),
  openGraph: {
    title: 'Prestame - Educación Financiera',
    description: 'Más que préstamos, te damos el conocimiento para que tomes el control de tu futuro financiero.',
    url: 'https://www.prestame.com.py',
    siteName: 'Prestame',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_PY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prestame - Tu Guía Financiera',
    description: 'Aprende, mejora tu score con IA y accede a las mejores oportunidades financieras en Paraguay.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'Prestame',
  url: 'https://www.prestame.com.py',
  logo: 'https://www.prestame.com.py/logo.png',
  description: 'Plataforma de Educación Financiera y Préstamos P2P en Paraguay.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PY',
    addressLocality: 'Asunción',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+595-XXX-XXXXXX',
    contactType: 'Customer Service',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>Prestame - Plataforma de Préstamos P2P</title>
        <meta name="description" content="Conectamos personas que necesitan préstamos con prestamistas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} />
        <AuthProvider>
          {/* ✅ EFECTO WOW DE IA */}
          <AIWowEffect />
          
          <AppShell>{children}</AppShell>
          
          {/* ✅ BOTÓN DE IA SCORING */}
          <AIScoreButton />
        </AuthProvider>
      </body>
    </html>
  );
} 