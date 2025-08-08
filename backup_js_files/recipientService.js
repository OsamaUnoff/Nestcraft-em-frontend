/**
 * Recipient Service
 * Handles all recipient and recipient list-related API calls
 */

import { apiService } from './api';

const recipientService = {
  // Recipient List CRUD operations
  getLists: async (params = {}) => {
    const response = await apiService.get('/recipients/lists', { params });
    return response;
  },

  getList: async (listId, params = {}) => {
    const response = await apiService.get(`/recipients/lists/${listId}`, { params });
    return response;
  },

  createList: async (listData) => {
    const response = await apiService.post('/recipients/lists', listData);
    return response;
  },

  updateList: async (listId, listData) => {
    const response = await apiService.put(`/recipients/lists/${listId}`, listData);
    return response;
  },

  deleteList: async (listId) => {
    const response = await apiService.delete(`/recipients/lists/${listId}`);
    return response;
  },

  // Individual Recipient operations
  getRecipients: async (listId, params = {}) => {
    const response = await apiService.get(`/recipients/lists/${listId}/recipients`, { params });
    return response;
  },

  addRecipient: async (listId, recipientData) => {
    const response = await apiService.post(`/recipients/lists/${listId}/recipients`, recipientData);
    return response;
  },

  updateRecipient: async (listId, recipientId, recipientData) => {
    const response = await apiService.put(`/recipients/lists/${listId}/recipients/${recipientId}`, recipientData);
    return response;
  },

  deleteRecipient: async (listId, recipientId) => {
    const response = await apiService.delete(`/recipients/lists/${listId}/recipients/${recipientId}`);
    return response;
  },

  getRecipient: async (listId, recipientId) => {
    const response = await apiService.get(`/recipients/lists/${listId}/recipients/${recipientId}`);
    return response;
  },

  // Bulk recipient operations
  addMultipleRecipients: async (listId, recipients) => {
    const response = await apiService.post(`/recipients/lists/${listId}/recipients/bulk`, {
      recipients,
    });
    return response;
  },

  updateMultipleRecipients: async (listId, updates) => {
    const response = await apiService.put(`/recipients/lists/${listId}/recipients/bulk`, updates);
    return response;
  },

  deleteMultipleRecipients: async (listId, recipientIds) => {
    const response = await apiService.post(`/recipients/lists/${listId}/recipients/bulk-delete`, {
      recipient_ids: recipientIds,
    });
    return response;
  },

  // File upload operations
  uploadFile: async (listId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.upload(`/recipients/lists/${listId}/upload`, formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      },
    });
    return response;
  },

  uploadRecipients: async (file, listId = null, listName = null, description = '') => {
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
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // You can dispatch this to Redux store if needed
        console.log('Upload progress:', percentCompleted);
      },
    });
    return response;
  },

  validateUploadFile: async (file) => {
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
  exportRecipients: async (listId) => {
    const response = await apiService.download(`/uploads/export/${listId}`);
    return response;
  },

  exportAllLists: async () => {
    const response = await apiService.download('/recipients/export-all');
    return response;
  },

  // Recipient search and filtering
  searchRecipients: async (listId, query, filters = {}) => {
    const response = await apiService.get(`/recipients/lists/${listId}/search`, {
      params: { q: query, ...filters },
    });
    return response;
  },

  searchAllRecipients: async (query, filters = {}) => {
    const response = await apiService.get('/recipients/search', {
      params: { q: query, ...filters },
    });
    return response;
  },

  // Recipient list statistics
  getListStats: async (listId) => {
    const response = await apiService.get(`/recipients/lists/${listId}/stats`);
    return response;
  },

  getAllListsStats: async () => {
    const response = await apiService.get('/recipients/lists/stats');
    return response;
  },

  // Recipient validation
  validateRecipients: async (listId) => {
    const response = await apiService.post(`/recipients/lists/${listId}/validate`);
    return response;
  },

  validateEmail: async (email) => {
    const response = await apiService.post('/recipients/validate-email', { email });
    return response;
  },

  // Recipient segmentation
  createSegment: async (listId, segmentData) => {
    const response = await apiService.post(`/recipients/lists/${listId}/segments`, segmentData);
    return response;
  },

  getSegments: async (listId) => {
    const response = await apiService.get(`/recipients/lists/${listId}/segments`);
    return response;
  },

  updateSegment: async (listId, segmentId, segmentData) => {
    const response = await apiService.put(`/recipients/lists/${listId}/segments/${segmentId}`, segmentData);
    return response;
  },

  deleteSegment: async (listId, segmentId) => {
    const response = await apiService.delete(`/recipients/lists/${listId}/segments/${segmentId}`);
    return response;
  },

  // Recipient list duplication
  duplicateList: async (listId, newName) => {
    const response = await apiService.post(`/recipients/lists/${listId}/duplicate`, {
      name: newName,
    });
    return response;
  },

  // Recipient list merging
  mergeLists: async (sourceListIds, targetListId, options = {}) => {
    const response = await apiService.post('/recipients/lists/merge', {
      source_list_ids: sourceListIds,
      target_list_id: targetListId,
      ...options,
    });
    return response;
  },

  // Recipient cleanup
  cleanupList: async (listId, options = {}) => {
    const response = await apiService.post(`/recipients/lists/${listId}/cleanup`, options);
    return response;
  },

  removeDuplicates: async (listId) => {
    const response = await apiService.post(`/recipients/lists/${listId}/remove-duplicates`);
    return response;
  },

  removeInvalidEmails: async (listId) => {
    const response = await apiService.post(`/recipients/lists/${listId}/remove-invalid`);
    return response;
  },

  // Recipient preferences
  updateRecipientPreferences: async (listId, recipientId, preferences) => {
    const response = await apiService.put(`/recipients/lists/${listId}/recipients/${recipientId}/preferences`, preferences);
    return response;
  },

  getRecipientPreferences: async (listId, recipientId) => {
    const response = await apiService.get(`/recipients/lists/${listId}/recipients/${recipientId}/preferences`);
    return response;
  },
};

export default recipientService;
