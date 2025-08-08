/**
 * API Configuration and Base Service
 * Handles HTTP requests with authentication and error handling
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });

    // Try multiple token storage keys for compatibility
    const accessToken = localStorage.getItem('access_token');
    const legacyToken = localStorage.getItem('token');
    const authToken = localStorage.getItem('auth_token');

    const token = accessToken || legacyToken || authToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found in localStorage');
      console.log('Available keys:', Object.keys(localStorage));
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config?.url || 'unknown',
      data: response.data
    });
    return response.data;
  },
  async (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });

    const originalRequest = error.config;

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors with token refresh
      if (status === 401 && !originalRequest._retry) {
        console.log('🔒 Authentication error detected, attempting token refresh...');

        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh the token
            const refreshResponse = await api.post('/auth/refresh', {
              refresh_token: refreshToken
            });

            if (refreshResponse.success && refreshResponse.data?.tokens) {
              // Update stored tokens
              localStorage.setItem('access_token', refreshResponse.data.tokens.access_token);
              if (refreshResponse.data.tokens.refresh_token) {
                localStorage.setItem('refresh_token', refreshResponse.data.tokens.refresh_token);
              }

              // Update the authorization header and retry the request
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.tokens.access_token}`;
              console.log('🔄 Token refreshed, retrying original request...');
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            // Clear invalid tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');

            // Redirect to login or dispatch logout action
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        } else {
          // No refresh token available or refresh endpoint failed
          console.log('🚪 No refresh token available, redirecting to login...');
          localStorage.clear();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }

      // Handle server errors
      if (status >= 500) {
        console.error('🔥 Server error:', status, data);
        return Promise.reject(new Error('Server error. Please try again later.'));
      }

      // Return the error response for handling in components
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.request) {
      console.error('🌐 Network error:', error.request);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle other errors
    console.error('⚠️ Unknown error:', error);
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Generic HTTP methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  
  // File upload method
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    });
  },
  
  // Download method
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: 'blob',
    });
  },
};

// Helper functions for common API patterns
export const createApiEndpoints = (baseUrl) => ({
  getAll: (params = {}) => apiService.get(baseUrl, { params }),
  getById: (id) => apiService.get(`${baseUrl}/${id}`),
  create: (data) => apiService.post(baseUrl, data),
  update: (id, data) => apiService.put(`${baseUrl}/${id}`, data),
  delete: (id) => apiService.delete(`${baseUrl}/${id}`),
});

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Request/Response logging for development
if (import.meta.env.DEV) {
  api.interceptors.request.use(
    (config) => {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
      return config;
    }
  );
  
  api.interceptors.response.use(
    (response) => {
      console.log('API Response:', {
        status: response.status,
        url: response.config?.url || 'unknown',
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );
}

export default api;
