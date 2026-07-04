<<<<<<< HEAD
import axios from 'axios';

// Base URL configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';
=======
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
<<<<<<< HEAD
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
=======
})

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Add response interceptor for error handling
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
<<<<<<< HEAD
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
=======
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059
