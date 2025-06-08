import api from './api';

const authService = {
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },
  getProfile: () => {
    return api.get('/auth/profile');
  },
  updateProfile: (data) => {
    return api.put('/auth/profile', data);
  }
};

export default authService; 