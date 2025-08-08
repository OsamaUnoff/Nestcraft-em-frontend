import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types/index.js';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Auth State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Auth Context Interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const legacyToken = localStorage.getItem('auth_token');

    if (!accessToken && !legacyToken) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.getCurrentUser();
      if ((response as any).success && (response as any).data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: (response as any).data });
      } else {
        // Try to refresh token if we have one
        if (refreshToken) {
          try {
            const refreshResponse = await authService.refreshToken(refreshToken);
            if ((refreshResponse as any).success && (refreshResponse as any).data?.tokens) {
              localStorage.setItem('access_token', (refreshResponse as any).data.tokens.access_token);
              // Retry getting user info
              const userResponse = await authService.getCurrentUser();
              if ((userResponse as any).success && (userResponse as any).data) {
                dispatch({ type: 'AUTH_SUCCESS', payload: (userResponse as any).data });
                return;
              }
            }
          } catch (refreshError) {
            // Refresh failed, logout
          }
        }

        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_token');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token');
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.login(credentials);
      if ((response as any).success && (response as any).data?.user) {
        // Store JWT tokens
        if ((response as any).data.tokens) {
          localStorage.setItem('access_token', (response as any).data.tokens.access_token);
          localStorage.setItem('refresh_token', (response as any).data.tokens.refresh_token);
        }

        dispatch({ type: 'AUTH_SUCCESS', payload: (response as any).data.user });
        toast.success('Login successful!');
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: (response as any).error || 'Login failed' });
        toast.error((response as any).error || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.error || 'Login failed' });
      toast.error(error.error || 'Login failed');
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.register(userData);
      if ((response as any).success) {
        toast.success('Registration successful! You can now sign in.');
        dispatch({ type: 'CLEAR_ERROR' });
        // Auto-login after successful registration
        if ((response as any).data?.user) {
          await login({ email: userData.username, password: userData.password });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: (response as any).error || 'Registration failed' });
        toast.error((response as any).error || 'Registration failed');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.error || 'Registration failed' });
      toast.error(error.error || 'Registration failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token'); // Legacy token

      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token');

      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await authService.updateProfile(userData);
      if ((response as any).success && (response as any).data) {
        dispatch({ type: 'UPDATE_USER', payload: (response as any).data });
        toast.success('Profile updated successfully');
      } else {
        toast.error((response as any).error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to update profile');
    }
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
