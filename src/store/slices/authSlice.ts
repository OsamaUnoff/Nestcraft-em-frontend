/**
 * Authentication Redux Slice
 * Manages user authentication state and actions
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Async thunks for API calls
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', (response as any).token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', (response as any).token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_) => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (error: any) {
      // Even if logout fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get user');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (token: any, { rejectWithValue }) => {
    try {
      const response = await authService.verifyToken(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Token verification failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: any, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Password change failed');
    }
  }
);

const initialState: any = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state: any) => {
      state.error = null;
    },
    setInitialized: (state: any) => {
      state.isInitialized = true;
    },
    clearAuth: (state: any) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder: any) => {
    builder
      // Login
      .addCase(login.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state: any, action: any) => {
        console.log('✅ Login fulfilled, payload:', action.payload);
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Register
      .addCase(register.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state: any) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state: any) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      
      // Verify Token
      .addCase(verifyToken.pending, (state: any) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state: any, action: any) => {
        console.log('✅ Token verification fulfilled, payload:', action.payload);
        state.isLoading = false;
        // Handle different response formats
        state.user = action.payload.user || action.payload.data?.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(verifyToken.rejected, (state: any, action: any) => {
        console.log('❌ Token verification rejected, payload:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;
        // Clear invalid token
        localStorage.removeItem('token');
      })
      
      // Change Password
      .addCase(changePassword.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state: any) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setInitialized, clearAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state: any) => state.auth;
export const selectUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: any) => state.auth.isLoading;
export const selectAuthError = (state: any) => state.auth.error;
export const selectIsInitialized = (state: any) => state.auth.isInitialized;

export default authSlice.reducer;
