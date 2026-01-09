import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://powerhouse-stokvel-backend.onrender.com/api';
const API_BASE_URL = import.meta.env.VITE_API_URL;



// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Members API
export const membersAPI = {
  getAll: () => api.get('/members'),
  getOne: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

// Contributions API
export const contributionsAPI = {
  getAll: () => api.get('/contributions'),
  create: (data) => api.post('/contributions', data),
  updateStatus: (id, status) => api.put(`/contributions/${id}`, { status }),
};

// Announcements API
export const announcementsAPI = {
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Stats API
export const statsAPI = {
  getMemberStats: (memberId) => api.get(`/stats/${memberId}`),
};

export default api;