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
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 6000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
} 