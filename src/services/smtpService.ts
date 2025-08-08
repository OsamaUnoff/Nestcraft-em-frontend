/**
 * SMTP Service
 * Handles all SMTP account-related API calls
 */

import { apiService } from './api';

const smtpService = {
  // SMTP Account CRUD operations
  getAccounts: async (params: any = {}) => {
    // Set default parameters for the paginated endpoint
    const defaultParams = {
      page: 1,
      limit: 100, // Get all accounts for compose modal
      search: '',
      provider: '',
      active_only: false,
      ...params
    };

    console.log('🔍 SMTP Service - getAccounts called with params:', defaultParams);
    console.log('🔍 SMTP Service - Full URL will be:', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/smtp/accounts`);

    try {
      const response = await apiService.get('/smtp/accounts', { params: defaultParams });
      console.log('✅ SMTP Service - getAccounts response:', response);
      // Support both { data: { accounts: [...] } } and { accounts: [...] } and flat array
      if (response && response.data && Array.isArray(response.data.accounts)) {
        return response.data.accounts;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('⚠️ SMTP Service - Unexpected response format:', response);
        return [];
      }
    } catch (error: any) {
      console.error('❌ SMTP Service - getAccounts error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      // Provide more specific error messages
      if (error.response?.status === 500) {
        throw new Error(`SMTP accounts server error (500): ${error.response?.data?.message || 'Internal server error'}`);
      } else if (error.response?.status === 404) {
        throw new Error('SMTP accounts endpoint not found. Please check if the backend is running.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You may not have permission to view SMTP accounts.');
      } else {
        throw new Error(`SMTP accounts fetch failed: ${error.message}`);
      }
    }
  },

  // Alias for consistency
  getSMTPAccounts: async () => {
    return smtpService.getAccounts();
  },

  getAccount: async (accountId: any) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}`);
    return response;
  },

  createAccount: async (accountData: any) => {
    const response = await apiService.post('/smtp/accounts', accountData);
    return response;
  },

  updateAccount: async (accountId: any, accountData: any) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}`, accountData);
    return response;
  },

  deleteAccount: async (accountId: any) => {
    const response = await apiService.delete(`/smtp/accounts/${accountId}`);
    return response;
  },

  // SMTP Connection testing
  testConnection: async (accountId: any) => {
    const response = await apiService.post(`/smtp/accounts/${accountId}/test`);
    return response;
  },

  testConnectionWithData: async (accountData: any) => {
    const response = await apiService.post('/smtp/test-connection', accountData);
    return response;
  },

  // SMTP Providers
  getProviders: async () => {
    const response = await apiService.get('/smtp/providers');
    return response;
  },

  getProviderSettings: async (providerName: any) => {
    const response = await apiService.get(`/smtp/providers/${providerName}/settings`);
    return response;
  },

  // SMTP Account validation
  validateAccount: async (accountData: any) => {
    const response = await apiService.post('/smtp/validate', accountData);
    return response;
  },

  // SMTP Account status
  getAccountStatus: async (accountId: any) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/status`);
    return response;
  },

  toggleAccountStatus: async (accountId: any, isActive: any) => {
    const response = await apiService.patch(`/smtp/accounts/${accountId}/status`, {
      is_active: isActive,
    });
    return response;
  },

  // SMTP Account usage statistics
  getAccountUsage: async (accountId: any, timeRange: any = '30d') => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/usage`, {
      params: { range: timeRange },
    });
    return response;
  },

  getAllAccountsUsage: async (timeRange: any = '30d') => {
    const response = await apiService.get('/smtp/accounts/usage', {
      params: { range: timeRange },
    });
    return response;
  },

  // SMTP Account limits
  getAccountLimits: async (accountId: any) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/limits`);
    return response;
  },

  updateAccountLimits: async (accountId: any, limits: any) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}/limits`, limits);
    return response;
  },

  // SMTP Account authentication
  refreshAccountAuth: async (accountId: any) => {
    const response = await apiService.post(`/smtp/accounts/${accountId}/refresh-auth`);
    return response;
  },

  updateAccountCredentials: async (accountId: any, credentials: any) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}/credentials`, credentials);
    return response;
  },

  // SMTP Account configuration
  getAccountConfig: async (accountId: any) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/config`);
    return response;
  },

  updateAccountConfig: async (accountId: any, config: any) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}/config`, config);
    return response;
  },

  // SMTP Account backup/restore
  exportAccount: async (accountId: any) => {
    const response = await apiService.download(`/smtp/accounts/${accountId}/export`);
    return response;
  },

  importAccount: async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.upload('/smtp/accounts/import', formData);
    return response;
  },

  // SMTP Account monitoring
  getAccountHealth: async (accountId: any) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/health`);
    return response;
  },

  getAccountLogs: async (accountId: any, params: any = {}) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/logs`, { params });
    return response;
  },

  // Bulk operations
  bulkTestConnections: async (accountIds: any) => {
    const response = await apiService.post('/smtp/accounts/bulk-test', {
      account_ids: accountIds,
    });
    return response;
  },

  bulkUpdateAccounts: async (accountIds: any, updateData: any) => {
    const response = await apiService.post('/smtp/accounts/bulk-update', {
      account_ids: accountIds,
      ...updateData,
    });
    return response;
  },

  bulkDeleteAccounts: async (accountIds: any) => {
    const response = await apiService.post('/smtp/accounts/bulk-delete', {
      account_ids: accountIds,
    });
    return response;
  },

  // SMTP Account search
  searchAccounts: async (query: any, filters: any = {}) => {
    const response = await apiService.get('/smtp/accounts/search', {
      params: { q: query, ...filters },
    });
    return response;
  },

  // SMTP Account templates
  getAccountTemplates: async () => {
    const response = await apiService.get('/smtp/account-templates');
    return response;
  },

  createAccountFromTemplate: async (templateId: any, customData: any = {}) => {
    const response = await apiService.post('/smtp/accounts/from-template', {
      template_id: templateId,
      ...customData,
    });
    return response;
  },
};

export default smtpService;
