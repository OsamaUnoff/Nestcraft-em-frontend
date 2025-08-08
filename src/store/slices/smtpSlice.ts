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
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch SMTP accounts');
    }
  }
);

export const createSMTPAccount = createAsyncThunk(
  'smtp/createAccount',
  async (accountData: any, { rejectWithValue }) => {
    try {
      const response = await smtpService.createAccount(accountData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create SMTP account');
    }
  }
);

export const updateSMTPAccount = createAsyncThunk(
  'smtp/updateAccount',
  async ({ accountId, accountData }: any, { rejectWithValue }) => {
    try {
      const response = await smtpService.updateAccount(accountId, accountData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update SMTP account');
    }
  }
);

export const deleteSMTPAccount = createAsyncThunk(
  'smtp/deleteAccount',
  async (accountId: any, { rejectWithValue }) => {
    try {
      await smtpService.deleteAccount(accountId);
      return accountId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete SMTP account');
    }
  }
);

export const testSMTPConnection = createAsyncThunk(
  'smtp/testConnection',
  async (accountId: any, { rejectWithValue }) => {
    try {
      const response = await smtpService.testConnection(accountId);
      return { accountId, ...response };
    } catch (error: any) {
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
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch SMTP providers');
    }
  }
);

// Compatibility async thunks with different names
export const fetchAccounts = createAsyncThunk(
  'smtp/fetchAccountsCompat',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await smtpService.getAccounts(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch SMTP accounts');
    }
  }
);

export const createAccount = createAsyncThunk(
  'smtp/createAccountCompat',
  async (accountData: any, { rejectWithValue }) => {
    try {
      const response = await smtpService.createAccount(accountData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create SMTP account');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'smtp/updateAccountCompat',
  async ({ id, data }: any, { rejectWithValue }) => {
    try {
      const response = await smtpService.updateAccount(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update SMTP account');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'smtp/deleteAccountCompat',
  async (accountId: any, { rejectWithValue }) => {
    try {
      await smtpService.deleteAccount(accountId);
      return accountId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete SMTP account');
    }
  }
);

export const testConnection = createAsyncThunk(
  'smtp/testConnectionCompat',
  async (accountId: any, { rejectWithValue }) => {
    try {
      const response = await smtpService.testConnection(accountId);
      return { accountId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Connection test failed');
    }
  }
);

const initialState: any = {
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
    clearError: (state: any) => {
      state.error = null;
    },
    setCurrentAccount: (state: any, action: any) => {
      state.currentAccount = action.payload;
    },
    clearCurrentAccount: (state: any) => {
      state.currentAccount = null;
    },
    clearTestResults: (state: any) => {
      state.testResults = {};
    },
    setTestResult: (state: any, action: any) => {
      const { accountId, result } = action.payload;
      state.testResults[accountId] = result;
    },
    addDummyAccount: (state: any) => {
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
    removeDummyAccount: (state: any) => {
      if (state.accounts.length > 0) {
        state.accounts.pop();
      }
    },
    setSearchTerm: (state: any, action: any) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setFilterProvider: (state: any, action: any) => {
      state.filterProvider = action.payload;
      state.currentPage = 1;
    },
    setShowActiveOnly: (state: any, action: any) => {
      state.showActiveOnly = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state: any, action: any) => {
      state.currentPage = action.payload;
    },
    setDefaultAccount: (state: any, action: any) => {
      const accountId = action.payload;
      state.accounts = state.accounts.map((account: any) => ({
        ...account,
        is_default: account.id === accountId
      }));
    },
    toggleAccountStatus: (state: any, action: any) => {
      const accountId = action.payload;
      const account = state.accounts.find((acc: any) => acc.id === accountId);
      if (account) {
        account.is_active = !account.is_active;
      }
    },
  },
  extraReducers: (builder: any) => {
    builder
      // Original async thunks
      .addCase(fetchSMTPAccounts.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSMTPAccounts.fulfilled, (state: any, action: any) => {
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
      .addCase(fetchSMTPAccounts.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createSMTPAccount.pending, (state: any) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSMTPAccount.fulfilled, (state: any, action: any) => {
        state.isCreating = false;
        state.accounts.push(action.payload.account);
        state.error = null;
      })
      .addCase(createSMTPAccount.rejected, (state: any, action: any) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateSMTPAccount.pending, (state: any) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSMTPAccount.fulfilled, (state: any, action: any) => {
        state.isUpdating = false;
        const index = state.accounts.findIndex((acc: any) => acc.id === action.payload.account.id);
        if (index !== -1) {
          state.accounts[index] = { ...state.accounts[index], ...action.payload.account };
        }
        state.error = null;
      })
      .addCase(updateSMTPAccount.rejected, (state: any, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteSMTPAccount.pending, (state: any) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSMTPAccount.fulfilled, (state: any, action: any) => {
        state.isDeleting = false;
        state.accounts = state.accounts.filter((acc: any) => acc.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSMTPAccount.rejected, (state: any, action: any) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      .addCase(testSMTPConnection.pending, (state: any) => {
        state.isTesting = true;
        state.error = null;
      })
      .addCase(testSMTPConnection.fulfilled, (state: any, action: any) => {
        state.isTesting = false;
        const { accountId, success, message } = action.payload;
        state.testResults[accountId] = { success, message, timestamp: Date.now() };
        state.error = null;
      })
      .addCase(testSMTPConnection.rejected, (state: any, action: any) => {
        state.isTesting = false;
        state.error = action.payload;
      })
      
      .addCase(fetchSMTPProviders.pending, (state: any) => {
        state.isLoading = true;
      })
      .addCase(fetchSMTPProviders.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.providers = action.payload.providers;
      })
      .addCase(fetchSMTPProviders.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Compatibility async thunks
      .addCase(fetchAccounts.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state: any, action: any) => {
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
      .addCase(fetchAccounts.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createAccount.pending, (state: any) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state: any, action: any) => {
        state.isCreating = false;
        state.accounts.push(action.payload.account || action.payload);
        state.error = null;
      })
      .addCase(createAccount.rejected, (state: any, action: any) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateAccount.pending, (state: any) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state: any, action: any) => {
        state.isUpdating = false;
        const updatedAccount = action.payload.account || action.payload;
        const index = state.accounts.findIndex((acc: any) => acc.id === updatedAccount.id);
        if (index !== -1) {
          state.accounts[index] = { ...state.accounts[index], ...updatedAccount };
        }
        state.error = null;
      })
      .addCase(updateAccount.rejected, (state: any, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteAccount.pending, (state: any) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state: any, action: any) => {
        state.isDeleting = false;
        state.accounts = state.accounts.filter((acc: any) => acc.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state: any, action: any) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      .addCase(testConnection.pending, (state: any) => {
        state.isTesting = true;
        state.testingId = null;
        state.error = null;
      })
      .addCase(testConnection.fulfilled, (state: any, action: any) => {
        state.isTesting = false;
        const { accountId, success, message } = action.payload;
        state.testResults[accountId] = { success, message, timestamp: Date.now() };
        state.testingId = null;
        state.error = null;
      })
      .addCase(testConnection.rejected, (state: any, action: any) => {
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
export const selectSMTPAccounts = (state: any) => state.smtp.accounts;
export const selectSMTPProviders = (state: any) => state.smtp.providers;
export const selectCurrentSMTPAccount = (state: any) => state.smtp.currentAccount;
export const selectSMTPLoading = (state: any) => state.smtp.isLoading;
export const selectSMTPError = (state: any) => state.smtp.error;
export const selectSMTPTestResults = (state: any) => state.smtp.testResults;
export const selectSMTPTesting = (state: any) => state.smtp.isTesting;
export const selectSMTPCurrentPage = (state: any) => state.smtp.currentPage;
export const selectSMTPSearchTerm = (state: any) => state.smtp.searchTerm;
export const selectSMTPFilterProvider = (state: any) => state.smtp.filterProvider;
export const selectSMTPShowActiveOnly = (state: any) => state.smtp.showActiveOnly;
export const selectSMTPTestingId = (state: any) => state.smtp.testingId;
export const selectSMTPStats = (state: any) => state.smtp.stats;

export default smtpSlice.reducer; 