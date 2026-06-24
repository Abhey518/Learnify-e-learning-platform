import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('auth_token')
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token')
  },
}
