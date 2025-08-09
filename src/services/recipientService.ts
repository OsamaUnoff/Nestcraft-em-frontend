/**
 * Recipient Service
 * Handles all recipient and recipient list-related API calls
 */

import { apiService } from './api';

const recipientService = {
  // Recipient List CRUD operations
  getLists: async (params: any = {}) => {
    // Ensure correct default params per backend contract
    const defaultParams = { page: 1, per_page: 50, search: '', ...params };
    const response = await apiService.get('/recipients/lists', { params: defaultParams });
    return response;
  },

  getList: async (listId: any, params: any = {}) => {
    const response = await apiService.get(`/recipients/lists/${listId}`, { params });
    return response;
  },

  createList: async (listData: any) => {
    const response = await apiService.post('/recipients/lists', listData);
    return response;
  },

  updateList: async (listId: any, listData: any) => {
    const response = await apiService.put(`/recipients/lists/${listId}`, listData);
    return response;
  },

  deleteList: async (listId: any) => {
    const response = await apiService.delete(`/recipients/lists/${listId}`);
    return response;
  },

  // Individual Recipient operations
  getRecipients: async (listId: any, params: any = {}) => {
    const response = await apiService.get(`/recipients/lists/${listId}/recipients`, { params });
    return response;
  },

  addRecipient: async (listId: any, recipientData: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/recipients`, recipientData);
    return response;
  },

  updateRecipient: async (listId: any, recipientId: any, recipientData: any) => {
    const response = await apiService.put(`/recipients/lists/${listId}/recipients/${recipientId}`, recipientData);
    return response;
  },

  deleteRecipient: async (listId: any, recipientId: any) => {
    const response = await apiService.delete(`/recipients/lists/${listId}/recipients/${recipientId}`);
    return response;
  },

  getRecipient: async (listId: any, recipientId: any) => {
    const response = await apiService.get(`/recipients/lists/${listId}/recipients/${recipientId}`);
    return response;
  },

  // Bulk recipient operations
  addMultipleRecipients: async (listId: any, recipients: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/recipients/bulk`, {
      recipients,
    });
    return response;
  },

  updateMultipleRecipients: async (listId: any, updates: any) => {
    const response = await apiService.put(`/recipients/lists/${listId}/recipients/bulk`, updates);
    return response;
  },

  deleteMultipleRecipients: async (listId: any, recipientIds: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/recipients/bulk-delete`, {
      recipient_ids: recipientIds,
    });
    return response;
  },

  // File upload operations
  uploadFile: async (listId: any, file: any) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.upload(`/recipients/lists/${listId}/upload`, formData, {
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      },
    });
    return response;
  },

  uploadRecipients: async (file: any, listId: any = null, listName: any = null, description: any = '') => {
    const formData = new FormData();
    formData.append('file', file);

    if (listId) {
      formData.append('list_id', listId);
    }

    if (listName) {
      formData.append('list_name', listName);
    }

    if (description) {
      formData.append('description', description);
    }

    const response = await apiService.upload('/uploads/recipients', formData, {
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // You can dispatch this to Redux store if needed
        console.log('Upload progress:', percentCompleted);
      },
    });
    return response;
  },

  validateUploadFile: async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.upload('/uploads/validate', formData);
    return response;
  },

  getUploadTemplate: async () => {
    const response = await apiService.download('/uploads/template');
    return response;
  },

  getUploadHistory: async () => {
    const response = await apiService.get('/uploads/history');
    return response;
  },

  getSupportedFormats: async () => {
    const response = await apiService.get('/uploads/formats');
    return response;
  },

  // Export operations
  exportRecipients: async (listId: any) => {
    const response = await apiService.download(`/uploads/export/${listId}`);
    return response;
  },

  exportAllLists: async () => {
    const response = await apiService.download('/recipients/export-all');
    return response;
  },

  // Recipient search and filtering
  searchRecipients: async (listId: any, query: any, filters: any = {}) => {
    const response = await apiService.get(`/recipients/lists/${listId}/search`, {
      params: { q: query, ...filters },
    });
    return response;
  },

  searchAllRecipients: async (query: any, filters: any = {}) => {
    const response = await apiService.get('/recipients/search', {
      params: { q: query, ...filters },
    });
    return response;
  },

  // Recipient list statistics
  getListStats: async (listId: any) => {
    const response = await apiService.get(`/recipients/lists/${listId}/stats`);
    return response;
  },

  getAllListsStats: async () => {
    const response = await apiService.get('/recipients/lists/stats');
    return response;
  },

  // Recipient validation
  validateRecipients: async (listId: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/validate`);
    return response;
  },

  validateEmail: async (email: any) => {
    const response = await apiService.post('/recipients/validate-email', { email });
    return response;
  },

  // Recipient segmentation
  createSegment: async (listId: any, segmentData: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/segments`, segmentData);
    return response;
  },

  getSegments: async (listId: any) => {
    const response = await apiService.get(`/recipients/lists/${listId}/segments`);
    return response;
  },

  updateSegment: async (listId: any, segmentId: any, segmentData: any) => {
    const response = await apiService.put(`/recipients/lists/${listId}/segments/${segmentId}`, segmentData);
    return response;
  },

  deleteSegment: async (listId: any, segmentId: any) => {
    const response = await apiService.delete(`/recipients/lists/${listId}/segments/${segmentId}`);
    return response;
  },

  // Recipient list duplication
  duplicateList: async (listId: any, newName: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/duplicate`, {
      name: newName,
    });
    return response;
  },

  // Recipient list merging
  mergeLists: async (sourceListIds: any, targetListId: any, options: any = {}) => {
    const response = await apiService.post('/recipients/lists/merge', {
      source_list_ids: sourceListIds,
      target_list_id: targetListId,
      ...options,
    });
    return response;
  },

  // Recipient cleanup
  cleanupList: async (listId: any, options: any = {}) => {
    const response = await apiService.post(`/recipients/lists/${listId}/cleanup`, options);
    return response;
  },

  removeDuplicates: async (listId: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/remove-duplicates`);
    return response;
  },

  removeInvalidEmails: async (listId: any) => {
    const response = await apiService.post(`/recipients/lists/${listId}/remove-invalid`);
    return response;
  },

  // Recipient preferences
  updateRecipientPreferences: async (listId: any, recipientId: any, preferences: any) => {
    const response = await apiService.put(`/recipients/lists/${listId}/recipients/${recipientId}/preferences`, preferences);
    return response;
  },

  getRecipientPreferences: async (listId: any, recipientId: any) => {
    const response = await apiService.get(`/recipients/lists/${listId}/recipients/${recipientId}/preferences`);
    return response;
  },
};

export default recipientService;
