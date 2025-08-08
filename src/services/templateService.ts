/**
 * Template Service
 * Handles all email template-related API calls
 */

import { apiService } from './api';

const templateService = {
  // Template CRUD operations
  getTemplates: async (params: any = {}) => {
    const response = await apiService.get('/templates', { params });
    return response;
  },

  getTemplate: async (templateId: any) => {
    const response = await apiService.get(`/templates/${templateId}`);
    return response;
  },

  createTemplate: async (templateData: any) => {
    const response = await apiService.post('/templates', templateData);
    return response;
  },

  updateTemplate: async (templateId: any, templateData: any) => {
    const response = await apiService.put(`/templates/${templateId}`, templateData);
    return response;
  },

  deleteTemplate: async (templateId: any) => {
    const response = await apiService.delete(`/templates/${templateId}`);
    return response;
  },

  // Template duplication
  duplicateTemplate: async (templateId: any) => {
    const response = await apiService.post(`/templates/${templateId}/duplicate`);
    return response;
  },

  // Default templates
  getDefaultTemplates: async () => {
    const response = await apiService.get('/templates/defaults');
    return response;
  },

  createFromDefault: async (defaultTemplateData: any, customData: any = {}) => {
    const response = await apiService.post('/templates/from-default', {
      ...defaultTemplateData,
      ...customData,
    });
    return response;
  },

  // Template preview
  previewTemplate: async (templateId: any, recipientData: any = {}) => {
    const response = await apiService.post(`/templates/${templateId}/preview`, recipientData);
    return response;
  },

  previewTemplateContent: async (templateContent: any, recipientData: any = {}) => {
    const response = await apiService.post('/templates/preview-content', {
      ...templateContent,
      recipient_data: recipientData,
    });
    return response;
  },

  // Template validation
  validateTemplate: async (templateData: any) => {
    const response = await apiService.post('/templates/validate', templateData);
    return response;
  },

  validateTemplateContent: async (content: any) => {
    const response = await apiService.post('/templates/validate-content', { content });
    return response;
  },

  // Template testing
  sendTestEmail: async (templateId: any, testData: any) => {
    const response = await apiService.post(`/templates/${templateId}/test`, testData);
    return response;
  },

  // Template categories
  getCategories: async () => {
    const response = await apiService.get('/templates/categories');
    return response;
  },

  createCategory: async (categoryData: any) => {
    const response = await apiService.post('/templates/categories', categoryData);
    return response;
  },

  updateCategory: async (categoryId: any, categoryData: any) => {
    const response = await apiService.put(`/templates/categories/${categoryId}`, categoryData);
    return response;
  },

  deleteCategory: async (categoryId: any) => {
    const response = await apiService.delete(`/templates/categories/${categoryId}`);
    return response;
  },

  // Template search and filtering
  searchTemplates: async (query: any, filters: any = {}) => {
    const response = await apiService.get('/templates/search', {
      params: { q: query, ...filters },
    });
    return response;
  },

  getTemplatesByCategory: async (categoryId: any, params: any = {}) => {
    const response = await apiService.get(`/templates/category/${categoryId}`, { params });
    return response;
  },

  // Template export/import
  exportTemplate: async (templateId: any) => {
    const response = await apiService.download(`/templates/${templateId}/export`);
    return response;
  },

  importTemplate: async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.upload('/templates/import', formData);
    return response;
  },

  exportMultipleTemplates: async (templateIds: any) => {
    const response = await apiService.download('/templates/export-multiple', {
      params: { template_ids: templateIds.join(',') },
    });
    return response;
  },

  // Template sharing
  shareTemplate: async (templateId: any, shareData: any) => {
    const response = await apiService.post(`/templates/${templateId}/share`, shareData);
    return response;
  },

  getSharedTemplates: async () => {
    const response = await apiService.get('/templates/shared');
    return response;
  },

  acceptSharedTemplate: async (shareToken: any) => {
    const response = await apiService.post('/templates/accept-shared', { token: shareToken });
    return response;
  },

  // Template versioning
  getTemplateVersions: async (templateId: any) => {
    const response = await apiService.get(`/templates/${templateId}/versions`);
    return response;
  },

  createTemplateVersion: async (templateId: any, versionData: any) => {
    const response = await apiService.post(`/templates/${templateId}/versions`, versionData);
    return response;
  },

  restoreTemplateVersion: async (templateId: any, versionId: any) => {
    const response = await apiService.post(`/templates/${templateId}/versions/${versionId}/restore`);
    return response;
  },

  deleteTemplateVersion: async (templateId: any, versionId: any) => {
    const response = await apiService.delete(`/templates/${templateId}/versions/${versionId}`);
    return response;
  },

  // Template analytics
  getTemplateUsage: async (templateId: any, timeRange: any = '30d') => {
    const response = await apiService.get(`/templates/${templateId}/usage`, {
      params: { range: timeRange },
    });
    return response;
  },

  getTemplatePerformance: async (templateId: any, timeRange: any = '30d') => {
    const response = await apiService.get(`/templates/${templateId}/performance`, {
      params: { range: timeRange },
    });
    return response;
  },

  // Bulk operations
  bulkDeleteTemplates: async (templateIds: any) => {
    const response = await apiService.post('/templates/bulk-delete', {
      template_ids: templateIds,
    });
    return response;
  },

  bulkUpdateTemplates: async (templateIds: any, updateData: any) => {
    const response = await apiService.post('/templates/bulk-update', {
      template_ids: templateIds,
      ...updateData,
    });
    return response;
  },

  bulkCategorizeTemplates: async (templateIds: any, categoryId: any) => {
    const response = await apiService.post('/templates/bulk-categorize', {
      template_ids: templateIds,
      category_id: categoryId,
    });
    return response;
  },

  // Template variables and placeholders
  getTemplateVariables: async (templateId: any) => {
    const response = await apiService.get(`/templates/${templateId}/variables`);
    return response;
  },

  getAvailablePlaceholders: async () => {
    const response = await apiService.get('/templates/placeholders');
    return response;
  },

  validatePlaceholders: async (content: any) => {
    const response = await apiService.post('/templates/validate-placeholders', { content });
    return response;
  },
};

export default templateService;
