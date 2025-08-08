/**
 * SMTP Redux Slice
 * Manages SMTP account state and actions
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import smtpService from '../../services/smtpService';

// Async thunks for API calls
export const fetchSMTPAccounts = createAsyncThunk(
  'smtp/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await smtpService.getAccounts();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch SMTP accounts');
    }
  }
);

export const createSMTPAccount = createAsyncThunk(
  'smtp/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await smtpService.createAccount(accountData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create SMTP account');
    }
  }
);

export const updateSMTPAccount = createAsyncThunk(
  'smtp/updateAccount',
  async ({ accountId, accountData }, { rejectWithValue }) => {
    try {
      const response = await smtpService.updateAccount(accountId, accountData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update SMTP account');
    }
  }
);

export const deleteSMTPAccount = createAsyncThunk(
  'smtp/deleteAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      await smtpService.deleteAccount(accountId);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete SMTP account');
    }
  }
);

export const testSMTPConnection = createAsyncThunk(
  'smtp/testConnection',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await smtpService.testConnection(accountId);
      return { accountId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Connection test failed');
    }
  }
);

export const fetchSMTPProviders = createAsyncThunk(
  'smtp/fetchProviders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await smtpService.getProviders();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch SMTP providers');
    }
  }
);

// Compatibility async thunks with different names
export const fetchAccounts = createAsyncThunk(
  'smtp/fetchAccountsCompat',
  async (params, { rejectWithValue }) => {
    try {
      const response = await smtpService.getAccounts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch SMTP accounts');
    }
  }
);

export const createAccount = createAsyncThunk(
  'smtp/createAccountCompat',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await smtpService.createAccount(accountData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create SMTP account');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'smtp/updateAccountCompat',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await smtpService.updateAccount(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update SMTP account');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'smtp/deleteAccountCompat',
  async (accountId, { rejectWithValue }) => {
    try {
      await smtpService.deleteAccount(accountId);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete SMTP account');
    }
  }
);

export const testConnection = createAsyncThunk(
  'smtp/testConnectionCompat',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await smtpService.testConnection(accountId);
      return { accountId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Connection test failed');
    }
  }
);

const initialState = {
  accounts: [],
  providers: [],
  currentAccount: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isTesting: false,
  testResults: {},
  error: null,
  // UI state
  currentPage: 1,
  searchTerm: '',
  filterProvider: '',
  showActiveOnly: false,
  testingId: null,
  stats: {
    totalAccounts: 0,
    activeAccounts: 0,
    totalEmailsSent: 0
  }
};

const smtpSlice = createSlice({
  name: 'smtp',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload;
    },
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    },
    clearTestResults: (state) => {
      state.testResults = {};
    },
    setTestResult: (state, action) => {
      const { accountId, result } = action.payload;
      state.testResults[accountId] = result;
    },
    addDummyAccount: (state) => {
      const dummyAccount = {
        id: Date.now(),
        name: `Test Account ${state.accounts.length + 1}`,
        provider: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        username: 'test@example.com',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      state.accounts.push(dummyAccount);
    },
    removeDummyAccount: (state) => {
      if (state.accounts.length > 0) {
        state.accounts.pop();
      }
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setFilterProvider: (state, action) => {
      state.filterProvider = action.payload;
      state.currentPage = 1;
    },
    setShowActiveOnly: (state, action) => {
      state.showActiveOnly = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setDefaultAccount: (state, action) => {
      const accountId = action.payload;
      state.accounts = state.accounts.map(account => ({
        ...account,
        is_default: account.id === accountId
      }));
    },
    toggleAccountStatus: (state, action) => {
      const accountId = action.payload;
      const account = state.accounts.find(acc => acc.id === accountId);
      if (account) {
        account.is_active = !account.is_active;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Original async thunks
      .addCase(fetchSMTPAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSMTPAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle nested API response structure
        if (action.payload && action.payload.data && Array.isArray(action.payload.data.accounts)) {
          state.accounts = action.payload.data.accounts;
        } else if (Array.isArray(action.payload.accounts)) {
          state.accounts = action.payload.accounts;
        } else if (Array.isArray(action.payload)) {
          state.accounts = action.payload;
        } else {
          state.accounts = [];
        }
        state.error = null;
      })
      .addCase(fetchSMTPAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createSMTPAccount.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSMTPAccount.fulfilled, (state, action) => {
        state.isCreating = false;
        state.accounts.push(action.payload.account);
        state.error = null;
      })
      .addCase(createSMTPAccount.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateSMTPAccount.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSMTPAccount.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.accounts.findIndex(acc => acc.id === action.payload.account.id);
        if (index !== -1) {
          state.accounts[index] = { ...state.accounts[index], ...action.payload.account };
        }
        state.error = null;
      })
      .addCase(updateSMTPAccount.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteSMTPAccount.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSMTPAccount.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.accounts = state.accounts.filter(acc => acc.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSMTPAccount.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      .addCase(testSMTPConnection.pending, (state) => {
        state.isTesting = true;
        state.error = null;
      })
      .addCase(testSMTPConnection.fulfilled, (state, action) => {
        state.isTesting = false;
        const { accountId, success, message } = action.payload;
        state.testResults[accountId] = { success, message, timestamp: Date.now() };
        state.error = null;
      })
      .addCase(testSMTPConnection.rejected, (state, action) => {
        state.isTesting = false;
        state.error = action.payload;
      })
      
      .addCase(fetchSMTPProviders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSMTPProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload.providers;
      })
      .addCase(fetchSMTPProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Compatibility async thunks
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle nested API response structure
        if (action.payload && action.payload.data && Array.isArray(action.payload.data.accounts)) {
          state.accounts = action.payload.data.accounts;
        } else if (Array.isArray(action.payload.accounts)) {
          state.accounts = action.payload.accounts;
        } else if (Array.isArray(action.payload)) {
          state.accounts = action.payload;
        } else {
          state.accounts = [];
        }
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createAccount.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isCreating = false;
        state.accounts.push(action.payload.account || action.payload);
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateAccount.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedAccount = action.payload.account || action.payload;
        const index = state.accounts.findIndex(acc => acc.id === updatedAccount.id);
        if (index !== -1) {
          state.accounts[index] = { ...state.accounts[index], ...updatedAccount };
        }
        state.error = null;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteAccount.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.accounts = state.accounts.filter(acc => acc.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      .addCase(testConnection.pending, (state) => {
        state.isTesting = true;
        state.testingId = null;
        state.error = null;
      })
      .addCase(testConnection.fulfilled, (state, action) => {
        state.isTesting = false;
        const { accountId, success, message } = action.payload;
        state.testResults[accountId] = { success, message, timestamp: Date.now() };
        state.testingId = null;
        state.error = null;
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.isTesting = false;
        state.testingId = null;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setCurrentAccount, 
  clearCurrentAccount, 
  clearTestResults,
  setTestResult,
  addDummyAccount,
  removeDummyAccount,
  setSearchTerm,
  setFilterProvider,
  setShowActiveOnly,
  setCurrentPage,
  setDefaultAccount,
  toggleAccountStatus
} = smtpSlice.actions;

// Selectors
export const selectSMTPAccounts = (state) => state.smtp.accounts;
export const selectSMTPProviders = (state) => state.smtp.providers;
export const selectCurrentSMTPAccount = (state) => state.smtp.currentAccount;
export const selectSMTPLoading = (state) => state.smtp.isLoading;
export const selectSMTPError = (state) => state.smtp.error;
export const selectSMTPTestResults = (state) => state.smtp.testResults;
export const selectSMTPTesting = (state) => state.smtp.isTesting;
export const selectSMTPCurrentPage = (state) => state.smtp.currentPage;
export const selectSMTPSearchTerm = (state) => state.smtp.searchTerm;
export const selectSMTPFilterProvider = (state) => state.smtp.filterProvider;
export const selectSMTPShowActiveOnly = (state) => state.smtp.showActiveOnly;
export const selectSMTPTestingId = (state) => state.smtp.testingId;
export const selectSMTPStats = (state) => state.smtp.stats;

export default smtpSlice.reducer; 