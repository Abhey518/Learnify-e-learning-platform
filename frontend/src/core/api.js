import axios from 'axios';

// Base URL configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =======================
// Quiz API Functions
// =======================

export const getAllQuizzes = () => api.get('/quizzes');

export const getQuizById = (id) => api.get(`/quizzes/${id}`);

// Changed this function to accept quizId separately
export const submitQuiz = (quizId, answers) => {
  // Ensure the URL matches your backend route exactly
  return api.post(`/quizzes/${quizId}/submit`, { answers });
};

export default api;