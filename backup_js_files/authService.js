/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiService } from './api';

const authService = {
  // User authentication
  login: async (credentials) => {
    const response = await apiService.post('/auth/login', credentials);
    return response;
  },

  register: async (userData) => {
    const response = await apiService.post('/auth/register', userData);
    return response;
  },

  logout: async () => {
    const response = await apiService.post('/auth/logout');
    return response;
  },

  // Token management
  verifyToken: async (token) => {
    const response = await apiService.post('/auth/verify-token', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },

  refreshToken: async (refreshToken) => {
    const response = await apiService.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response;
  },

  // User profile
  getCurrentUser: async () => {
    const response = await apiService.get('/auth/me');
    return response;
  },

  updateProfile: async (profileData) => {
    const response = await apiService.put('/users/profile', profileData);
    return response;
  },

  // Password management
  changePassword: async (passwordData) => {
    const response = await apiService.post('/auth/change-password', passwordData);
    return response;
  },

  requestPasswordReset: async (email) => {
    const response = await apiService.post('/auth/forgot-password', { email });
    return response;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiService.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
    return response;
  },

  // Account verification
  verifyEmail: async (token) => {
    const response = await apiService.post('/auth/verify-email', { token });
    return response;
  },

  resendVerification: async (email) => {
    const response = await apiService.post('/auth/resend-verification', { email });
    return response;
  },

  // Session management
  checkSession: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { valid: false };
      }

      const response = await authService.verifyToken(token);
      return { valid: true, user: response.user };
    } catch (error) {
      localStorage.removeItem('token');
      return { valid: false };
    }
  },

  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  // User preferences
  updatePreferences: async (preferences) => {
    const response = await apiService.put('/users/preferences', preferences);
    return response;
  },

  getPreferences: async () => {
    const response = await apiService.get('/users/preferences');
    return response;
  },
};

export default authService;
