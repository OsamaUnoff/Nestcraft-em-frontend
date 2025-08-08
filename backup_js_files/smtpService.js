/**
 * SMTP Service
 * Handles all SMTP account-related API calls
 */

import { apiService } from './api';

const smtpService = {
  // SMTP Account CRUD operations
  getAccounts: async (params = {}) => {
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

    try {
      const response = await apiService.get('/smtp/accounts', { params: defaultParams });
      console.log('✅ SMTP Service - getAccounts response:', response);
      return response;
    } catch (error) {
      console.error('❌ SMTP Service - getAccounts error:', error);
      throw error;
    }
  },

  // Alias for consistency
  getSMTPAccounts: async () => {
    return smtpService.getAccounts();
  },

  getAccount: async (accountId) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}`);
    return response;
  },

  createAccount: async (accountData) => {
    const response = await apiService.post('/smtp/accounts', accountData);
    return response;
  },

  updateAccount: async (accountId, accountData) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}`, accountData);
    return response;
  },

  deleteAccount: async (accountId) => {
    const response = await apiService.delete(`/smtp/accounts/${accountId}`);
    return response;
  },

  // SMTP Connection testing
  testConnection: async (accountId) => {
    const response = await apiService.post(`/smtp/accounts/${accountId}/test`);
    return response;
  },

  testConnectionWithData: async (accountData) => {
    const response = await apiService.post('/smtp/test-connection', accountData);
    return response;
  },

  // SMTP Providers
  getProviders: async () => {
    const response = await apiService.get('/smtp/providers');
    return response;
  },

  getProviderSettings: async (providerName) => {
    const response = await apiService.get(`/smtp/providers/${providerName}/settings`);
    return response;
  },

  // SMTP Account validation
  validateAccount: async (accountData) => {
    const response = await apiService.post('/smtp/validate', accountData);
    return response;
  },

  // SMTP Account status
  getAccountStatus: async (accountId) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/status`);
    return response;
  },

  toggleAccountStatus: async (accountId, isActive) => {
    const response = await apiService.patch(`/smtp/accounts/${accountId}/status`, {
      is_active: isActive,
    });
    return response;
  },

  // SMTP Account usage statistics
  getAccountUsage: async (accountId, timeRange = '30d') => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/usage`, {
      params: { range: timeRange },
    });
    return response;
  },

  getAllAccountsUsage: async (timeRange = '30d') => {
    const response = await apiService.get('/smtp/accounts/usage', {
      params: { range: timeRange },
    });
    return response;
  },

  // SMTP Account limits
  getAccountLimits: async (accountId) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/limits`);
    return response;
  },

  updateAccountLimits: async (accountId, limits) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}/limits`, limits);
    return response;
  },

  // SMTP Account authentication
  refreshAccountAuth: async (accountId) => {
    const response = await apiService.post(`/smtp/accounts/${accountId}/refresh-auth`);
    return response;
  },

  updateAccountCredentials: async (accountId, credentials) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}/credentials`, credentials);
    return response;
  },

  // SMTP Account configuration
  getAccountConfig: async (accountId) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/config`);
    return response;
  },

  updateAccountConfig: async (accountId, config) => {
    const response = await apiService.put(`/smtp/accounts/${accountId}/config`, config);
    return response;
  },

  // SMTP Account backup/restore
  exportAccount: async (accountId) => {
    const response = await apiService.download(`/smtp/accounts/${accountId}/export`);
    return response;
  },

  importAccount: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.upload('/smtp/accounts/import', formData);
    return response;
  },

  // SMTP Account monitoring
  getAccountHealth: async (accountId) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/health`);
    return response;
  },

  getAccountLogs: async (accountId, params = {}) => {
    const response = await apiService.get(`/smtp/accounts/${accountId}/logs`, { params });
    return response;
  },

  // Bulk operations
  bulkTestConnections: async (accountIds) => {
    const response = await apiService.post('/smtp/accounts/bulk-test', {
      account_ids: accountIds,
    });
    return response;
  },

  bulkUpdateAccounts: async (accountIds, updateData) => {
    const response = await apiService.post('/smtp/accounts/bulk-update', {
      account_ids: accountIds,
      ...updateData,
    });
    return response;
  },

  bulkDeleteAccounts: async (accountIds) => {
    const response = await apiService.post('/smtp/accounts/bulk-delete', {
      account_ids: accountIds,
    });
    return response;
  },

  // SMTP Account search
  searchAccounts: async (query, filters = {}) => {
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

  createAccountFromTemplate: async (templateId, customData = {}) => {
    const response = await apiService.post('/smtp/accounts/from-template', {
      template_id: templateId,
      ...customData,
    });
    return response;
  },
};

export default smtpService;
