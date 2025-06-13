'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const isBorrower = user?.user_type === 'borrower';
  const isLender = user?.user_type === 'lender';
  const isSuperAdmin = user?.user_type === 'superadmin';

  const fetchUserProfile = useCallback(async () => {
    try {
      console.log('🔄 Cargando perfil de usuario...');
      const { data } = await authService.getProfile();
      console.log('👤 Usuario cargado:', data.user);
      console.log('📋 Perfil base cargado:', data.profile);
      
      setUser(data.user);
      setProfile(data.profile);
      
      // Si es prestamista, cargar información adicional de créditos
      if (data.user?.user_type === 'lender') {
        console.log('💳 Usuario es prestamista, cargando créditos...');
        try {
          const token = localStorage.getItem('token');
          console.log('🔑 Token disponible:', !!token);
          
          const lenderResponse = await fetch('/api/lenders/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('📡 Respuesta del servidor:', lenderResponse.status);
          
          if (lenderResponse.ok) {
            const lenderData = await lenderResponse.json();
            console.log('💰 Datos de prestamista recibidos:', lenderData);
            
            setProfile(prev => {
              const newProfile = {
                ...prev,
                ...lenderData.profile
              };
              console.log('📊 Perfil actualizado:', newProfile);
              return newProfile;
            });
          } else {
            const errorText = await lenderResponse.text();
            console.error('❌ Error en respuesta del servidor:', errorText);
          }
        } catch (lenderError) {
          console.error('❌ Error cargando perfil de prestamista:', lenderError);
        }
      }
      
      return data.user;
    } catch (error) {
      console.error('No se pudo obtener el perfil del usuario, cerrando sesión.', error);
      logout();
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        await fetchUserProfile();
      }
      setLoading(false);
    };
    initializeAuth();
  }, [fetchUserProfile]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await authService.login(credentials);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      await fetchUserProfile();
      
      toast.success('¡Bienvenido de nuevo!');
      
      // Redirigir al dashboard correspondiente
      if (data.user.role === 'superadmin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error("Error en login:", error);
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
      logout(); // Limpiar estado en caso de error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Paso 1: Registrar al usuario
      await authService.register(userData);
      
      toast.success('¡Registro exitoso! Iniciando sesión...');
      
      // ✅ PASO CLAVE: Iniciar sesión automáticamente después del registro
      await login({ email: userData.email, password: userData.password });

      // La redirección ya la maneja la función login()

    } catch (error) {
      console.error("Error en registro:", error);
      toast.error(error.response?.data?.error || 'Error al registrarse. Intenta con otro email.');
      logout(); // Limpiar por si acaso
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(data);
      
      if (response.status === 200) {
        // Actualizar el estado local con los nuevos datos
        setUser(response.data.user);
        setProfile(response.data.profile);
        
        // Actualizar localStorage para persistencia
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('profile', JSON.stringify(response.data.profile));

        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Error al conectar con el servidor.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setUser(null);
    setProfile(null);
    setToken(null);
    router.push('/login');
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 Refrescando perfil manualmente...');
      await fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  const value = {
    user,
    profile,
    token,
    loading,
    isBorrower,
    isLender,
    isSuperAdmin,
    login,
    register,
    logout,
    updateProfile,
    fetchUserProfile,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 