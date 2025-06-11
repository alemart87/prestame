import axios from 'axios';

// URL base del API desde variables de entorno
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar token de autenticación a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido.
      // Forzar un reload a login es una estrategia simple y efectiva.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Servicios para prestatarios
export const borrowerService = {
  createLoanRequest: (loanData) => api.post('/borrowers/loan-requests', loanData),
  getLoanRequests: () => api.get('/borrowers/loan-requests'),
  getLoanRequest: (id) => api.get(`/borrowers/loan-requests/${id}`),
  updateLoanRequest: (id, loanData) => api.put(`/borrowers/loan-requests/${id}`, loanData),
  deleteLoanRequest: (id) => api.delete(`/borrowers/loan-requests/${id}`),
  cancelLoanRequest: (id) => api.put(`/borrowers/loan-requests/${id}/cancel`),
};

// Servicios para prestamistas
export const lenderService = {
  getLeads: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/lenders/leads?${params}`);
  },
  getLead: (id) => api.get(`/lenders/leads/${id}`),
  purchaseLead: (loanRequestId) => api.post('/lenders/leads/purchase', { loan_request_id: loanRequestId }),
  contactLead: (id) => api.post(`/lenders/leads/${id}/contact`),
  getPackages: () => api.get('/lenders/packages'),
  purchasePackage: (packageType) => api.post('/lenders/packages/purchase', { package_type: packageType }),
  updateLeadStatus: (id, status, followUpDate = null) => {
    const data = { status };
    if (followUpDate) {
      data.follow_up_date = followUpDate;
    }
    return api.put(`/lenders/leads/${id}/update-status`, data);
  },
  addLeadComment: (id, comment) => api.post(`/lenders/leads/${id}/add-comment`, { comment }),
  getMyLeads: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/lenders/my-leads?${params}`);
  }
};

export const getLeadsForLender = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/lenders/leads?${params}`);
    return response.data.leads;
};

// Servicios para préstamos públicos
export const loanService = {
  getPublicLoans: (page = 1, perPage = 10) => 
    api.get(`/loans/public?page=${page}&per_page=${perPage}`),
  getLoanStats: () => api.get('/loans/stats'),
  searchLoans: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/loans/search?${params}`);
  },
};

// Servicios de Stripe
export const stripeService = {
  createCheckoutSession: (priceId) => api.post('/stripe/create-checkout-session', { priceId }),
  createOneTimeCheckout: (priceId) => api.post('/stripe/create-one-time-checkout', { priceId }),
  verifyCheckoutSession: (sessionId) => api.post('/stripe/verify-checkout-session', { session_id: sessionId }),
  createPortalSession: () => api.post('/stripe/create-portal-session'),
};

export const verifyCheckoutSession = async (sessionId) => {
    const response = await api.post('/stripe/verify-checkout-session', { session_id: sessionId });
    return response.data;
};

export const createPortalSession = async () => {
    const response = await api.post('/stripe/create-portal-session');
    return response.data;
};

// --- AI Services ---
export const findLeadsWithAI = async (data) => {
    const response = await api.post('/ai/find-leads', data);
    return response.data;
};

export const getSearchStatus = async () => {
    const response = await api.get('/ai/search-status');
    return response.data;
};

// --- Servicios de IA Conversacional ---
export const aiService = {
  // Enviar mensaje al asistente y obtener respuesta
  sendMessage: async (message) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        // Si el error es 401, es un problema de autenticación
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada, por favor inicia sesión de nuevo');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al comunicarse con el asistente');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Error en aiService.sendMessage:', error);
      throw error;
    }
  },

  // Analizar la conversación completa y obtener una puntuación
  async analyzeConversation() {
    try {
      console.log('Enviando solicitud de análisis...');
      const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Respuesta recibida:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.error || 'Error al analizar la conversación');
      }

      const data = await response.json();
      console.log('Datos del análisis:', data);

      // El backend devuelve la estructura: { message: "...", analysis: { ... } }
      // Necesitamos extraer solo la parte del analysis
      if (data.analysis) {
        return data.analysis;
      } else {
        throw new Error('Respuesta del análisis no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error en analyzeConversation:', error);
      throw error;
    }
  },

  // Obtener el historial de la conversación y el análisis si existe
  getConversationHistory: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/ai/conversation`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada, por favor inicia sesión de nuevo');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener el historial de conversación');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en aiService.getConversationHistory:', error);
      throw error;
    }
  },

  async calculateFinalScore() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/calculate-final-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error calculando Score Final');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async getScoreBreakdown() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/score-breakdown`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo desglose de score');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

export default api; 