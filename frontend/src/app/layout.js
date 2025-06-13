import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import AppShell from './AppShell';
import { AIScoreButton, AIWowEffect } from '../components/AIComponents';
import '../styles/globals.css';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import OfflineIndicator from '../components/OfflineIndicator';

const inter = Inter({ subsets: ['latin'] });

// METADATA PARA SEO
export const metadata = {
  title: 'Prestame - Plataforma de Préstamos P2P',
  description: 'Plataforma de préstamos entre particulares con IA para scoring crediticio',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Prestame'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Prestame',
    'application-name': 'Prestame',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml'
  }
};

// Nuevo export para viewport (Next.js 14+)
export const viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <OfflineIndicator />
        <Toaster position="top-center" reverseOrder={false} />
        <AuthProvider>
          {/* ✅ EFECTO WOW DE IA */}
          <AIWowEffect />
          
          <AppShell>{children}</AppShell>
          
          {/* ✅ BOTÓN DE IA SCORING */}
          <AIScoreButton />
        </AuthProvider>
        <PWAInstallPrompt />
      </body>
    </html>
  );
} 