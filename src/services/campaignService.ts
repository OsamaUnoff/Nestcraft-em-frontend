/**
 * Campaign Service
 * Handles all campaign-related API calls
 */

import { apiService } from './api';

const campaignService = {
  // Enhanced Campaign CRUD operations
  getCampaigns: async (params: any = {}) => {
    const response = await apiService.get('/campaigns', { params });
    return response;
  },

  getCampaign: async (campaignId: any) => {
    const response = await apiService.get(`/campaigns/${campaignId}`);
    return response;
  },

  createCampaign: async (campaignData: any) => {
    const response = await apiService.post('/campaigns', campaignData);
    return response;
  },

  updateCampaign: async (campaignId: any, campaignData: any) => {
    const response = await apiService.put(`/campaigns/${campaignId}`, campaignData);
    return response;
  },

  deleteCampaign: async (campaignId: any) => {
    const response = await apiService.delete(`/campaigns/${campaignId}`);
    return response;
  },

  // Campaign management actions
  duplicateCampaign: async (campaignId: any, newName: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/duplicate`, {
      name: newName,
    });
    return response;
  },

  // Enhanced Campaign execution
  sendCampaign: async (campaignId: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/send`);
    return response;
  },

  pauseCampaign: async (campaignId: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/pause`);
    return response;
  },

  resumeCampaign: async (campaignId: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/resume`);
    return response;
  },

  cancelCampaign: async (campaignId: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/cancel`);
    return response;
  },

  // Campaign analytics and stats
  getCampaignStats: async (campaignId: any) => {
    const response = await apiService.get(`/campaigns/${campaignId}/stats`);
    return response;
  },

  getCampaignLogs: async (campaignId: any, params: any = {}) => {
    const response = await apiService.get(`/campaigns/${campaignId}/logs`, { params });
    return response;
  },

  getCampaignRecipients: async (campaignId: any, params: any = {}) => {
    const response = await apiService.get(`/campaigns/${campaignId}/recipients`, { params });
    return response;
  },

  // Campaign scheduling
  scheduleCampaign: async (campaignId: any, scheduleData: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/schedule`, scheduleData);
    return response;
  },

  unscheduleCampaign: async (campaignId: any) => {
    const response = await apiService.delete(`/campaigns/${campaignId}/schedule`);
    return response;
  },

  // Campaign testing
  sendTestEmail: async (campaignId: any, testData: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/test`, testData);
    return response;
  },

  previewCampaign: async (campaignId: any, recipientData: any = {}) => {
    const response = await apiService.post(`/campaigns/${campaignId}/preview`, recipientData);
    return response;
  },

  // Campaign templates
  saveCampaignAsTemplate: async (campaignId: any, templateData: any) => {
    const response = await apiService.post(`/campaigns/${campaignId}/save-as-template`, templateData);
    return response;
  },

  // Bulk operations
  bulkDeleteCampaigns: async (campaignIds: any) => {
    const response = await apiService.post('/campaigns/bulk-delete', {
      campaign_ids: campaignIds,
    });
    return response;
  },

  bulkUpdateCampaigns: async (campaignIds: any, updateData: any) => {
    const response = await apiService.post('/campaigns/bulk-update', {
      campaign_ids: campaignIds,
      ...updateData,
    });
    return response;
  },

  // Campaign export/import
  exportCampaign: async (campaignId: any) => {
    const response = await apiService.download(`/campaigns/${campaignId}/export`);
    return response;
  },

  importCampaign: async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.upload('/campaigns/import', formData);
    return response;
  },

  // Campaign validation
  validateCampaign: async (campaignData: any) => {
    const response = await apiService.post('/campaigns/validate', campaignData);
    return response;
  },

  // Campaign search and filtering
  searchCampaigns: async (query: any, filters: any = {}) => {
    const response = await apiService.get('/campaigns/search', {
      params: { q: query, ...filters },
    });
    return response;
  },

  // Campaign performance metrics
  getCampaignMetrics: async (campaignId: any, timeRange: any = '7d') => {
    const response = await apiService.get(`/campaigns/${campaignId}/metrics`, {
      params: { range: timeRange },
    });
    return response;
  },

  getOverallMetrics: async (timeRange: any = '30d') => {
    const response = await apiService.get('/campaigns/metrics/overview', {
      params: { range: timeRange },
    });
    return response;
  },
};

export default campaignService;
