/**
 * Template Service
 * Handles all email template-related API calls
 */

import { apiService } from './api';

const templateService = {
  // Template CRUD operations
  getTemplates: async (params = {}) => {
    const response = await apiService.get('/templates', { params });
    return response;
  },

  getTemplate: async (templateId) => {
    const response = await apiService.get(`/templates/${templateId}`);
    return response;
  },

  createTemplate: async (templateData) => {
    const response = await apiService.post('/templates', templateData);
    return response;
  },

  updateTemplate: async (templateId, templateData) => {
    const response = await apiService.put(`/templates/${templateId}`, templateData);
    return response;
  },

  deleteTemplate: async (templateId) => {
    const response = await apiService.delete(`/templates/${templateId}`);
    return response;
  },

  // Template duplication
  duplicateTemplate: async (templateId) => {
    const response = await apiService.post(`/templates/${templateId}/duplicate`);
    return response;
  },

  // Default templates
  getDefaultTemplates: async () => {
    const response = await apiService.get('/templates/defaults');
    return response;
  },

  createFromDefault: async (defaultTemplateData, customData = {}) => {
    const response = await apiService.post('/templates/from-default', {
      ...defaultTemplateData,
      ...customData,
    });
    return response;
  },

  // Template preview
  previewTemplate: async (templateId, recipientData = {}) => {
    const response = await apiService.post(`/templates/${templateId}/preview`, recipientData);
    return response;
  },

  previewTemplateContent: async (templateContent, recipientData = {}) => {
    const response = await apiService.post('/templates/preview-content', {
      ...templateContent,
      recipient_data: recipientData,
    });
    return response;
  },

  // Template validation
  validateTemplate: async (templateData) => {
    const response = await apiService.post('/templates/validate', templateData);
    return response;
  },

  validateTemplateContent: async (content) => {
    const response = await apiService.post('/templates/validate-content', { content });
    return response;
  },

  // Template testing
  sendTestEmail: async (templateId, testData) => {
    const response = await apiService.post(`/templates/${templateId}/test`, testData);
    return response;
  },

  // Template categories
  getCategories: async () => {
    const response = await apiService.get('/templates/categories');
    return response;
  },

  createCategory: async (categoryData) => {
    const response = await apiService.post('/templates/categories', categoryData);
    return response;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await apiService.put(`/templates/categories/${categoryId}`, categoryData);
    return response;
  },

  deleteCategory: async (categoryId) => {
    const response = await apiService.delete(`/templates/categories/${categoryId}`);
    return response;
  },

  // Template search and filtering
  searchTemplates: async (query, filters = {}) => {
    const response = await apiService.get('/templates/search', {
      params: { q: query, ...filters },
    });
    return response;
  },

  getTemplatesByCategory: async (categoryId, params = {}) => {
    const response = await apiService.get(`/templates/category/${categoryId}`, { params });
    return response;
  },

  // Template export/import
  exportTemplate: async (templateId) => {
    const response = await apiService.download(`/templates/${templateId}/export`);
    return response;
  },

  importTemplate: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.upload('/templates/import', formData);
    return response;
  },

  exportMultipleTemplates: async (templateIds) => {
    const response = await apiService.download('/templates/export-multiple', {
      params: { template_ids: templateIds.join(',') },
    });
    return response;
  },

  // Template sharing
  shareTemplate: async (templateId, shareData) => {
    const response = await apiService.post(`/templates/${templateId}/share`, shareData);
    return response;
  },

  getSharedTemplates: async () => {
    const response = await apiService.get('/templates/shared');
    return response;
  },

  acceptSharedTemplate: async (shareToken) => {
    const response = await apiService.post('/templates/accept-shared', { token: shareToken });
    return response;
  },

  // Template versioning
  getTemplateVersions: async (templateId) => {
    const response = await apiService.get(`/templates/${templateId}/versions`);
    return response;
  },

  createTemplateVersion: async (templateId, versionData) => {
    const response = await apiService.post(`/templates/${templateId}/versions`, versionData);
    return response;
  },

  restoreTemplateVersion: async (templateId, versionId) => {
    const response = await apiService.post(`/templates/${templateId}/versions/${versionId}/restore`);
    return response;
  },

  deleteTemplateVersion: async (templateId, versionId) => {
    const response = await apiService.delete(`/templates/${templateId}/versions/${versionId}`);
    return response;
  },

  // Template analytics
  getTemplateUsage: async (templateId, timeRange = '30d') => {
    const response = await apiService.get(`/templates/${templateId}/usage`, {
      params: { range: timeRange },
    });
    return response;
  },

  getTemplatePerformance: async (templateId, timeRange = '30d') => {
    const response = await apiService.get(`/templates/${templateId}/performance`, {
      params: { range: timeRange },
    });
    return response;
  },

  // Bulk operations
  bulkDeleteTemplates: async (templateIds) => {
    const response = await apiService.post('/templates/bulk-delete', {
      template_ids: templateIds,
    });
    return response;
  },

  bulkUpdateTemplates: async (templateIds, updateData) => {
    const response = await apiService.post('/templates/bulk-update', {
      template_ids: templateIds,
      ...updateData,
    });
    return response;
  },

  bulkCategorizeTemplates: async (templateIds, categoryId) => {
    const response = await apiService.post('/templates/bulk-categorize', {
      template_ids: templateIds,
      category_id: categoryId,
    });
    return response;
  },

  // Template variables and placeholders
  getTemplateVariables: async (templateId) => {
    const response = await apiService.get(`/templates/${templateId}/variables`);
    return response;
  },

  getAvailablePlaceholders: async () => {
    const response = await apiService.get('/templates/placeholders');
    return response;
  },

  validatePlaceholders: async (content) => {
    const response = await apiService.post('/templates/validate-placeholders', { content });
    return response;
  },
};

export default templateService;
