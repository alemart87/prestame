import { AuthProvider } from '../context/AuthContext';
import AppShell from './AppShell';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>Prestame - Plataforma de Préstamos P2P</title>
        <meta name="description" content="Conectamos personas que necesitan préstamos con prestamistas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
} 