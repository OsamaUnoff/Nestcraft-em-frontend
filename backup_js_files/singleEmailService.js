/**
 * Single Email Service
 * Handles all single email-related API calls
 */

import { apiService } from './api';

const singleEmailService = {
  // Get all single emails with pagination and filtering
  getSingleEmails: async (params = {}) => {
    const response = await apiService.get('/single-emails', { params });
    return response;
  },

  // Get a specific single email
  getSingleEmail: async (emailId) => {
    const response = await apiService.get(`/single-emails/${emailId}`);
    return response;
  },

  // Create a new single email
  createSingleEmail: async (emailData) => {
    const response = await apiService.post('/single-emails', emailData);
    return response;
  },

  // Update a single email
  updateSingleEmail: async (emailId, emailData) => {
    const response = await apiService.put(`/single-emails/${emailId}`, emailData);
    return response;
  },

  // Delete a single email
  deleteSingleEmail: async (emailId) => {
    const response = await apiService.delete(`/single-emails/${emailId}`);
    return response;
  },

  // Send a single email
  sendSingleEmail: async (emailId) => {
    const response = await apiService.post(`/single-emails/${emailId}/send`);
    return response;
  },

  // Create and send email immediately
  createAndSendEmail: async (emailData) => {
    const response = await apiService.post('/single-emails/send-now', emailData);
    return response;
  },

  // Validate email data
  validateEmailData: (data) => {
    const errors = [];

    // Required fields
    if (!data.recipient_email) {
      errors.push('Recipient email is required');
    }
    if (!data.subject) {
      errors.push('Subject is required');
    }
    if (!data.body) {
      errors.push('Email body is required');
    }
    if (!data.smtp_account_id) {
      errors.push('SMTP account is required');
    }

    // Email format validation
    if (data.recipient_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.recipient_email)) {
        errors.push('Invalid email format');
      }
    }

    // Subject length
    if (data.subject && data.subject.length > 255) {
      errors.push('Subject too long (max 255 characters)');
    }

    return errors;
  },

  // Get email statistics
  getEmailStats: async () => {
    const response = await apiService.get('/single-emails?page=1&per_page=1');
    return response.data?.stats || {};
  },

  // Search emails
  searchEmails: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    const response = await apiService.get('/single-emails', { params });
    return response;
  },

  // Get emails by status
  getEmailsByStatus: async (status, page = 1, perPage = 20) => {
    const params = {
      status,
      page,
      per_page: perPage
    };
    const response = await apiService.get('/single-emails', { params });
    return response;
  },

  // Format email data for display
  formatEmailForDisplay: (email) => {
    return {
      ...email,
      sent_at_formatted: email.sent_at ? new Date(email.sent_at).toLocaleString() : null,
      created_at_formatted: email.created_at ? new Date(email.created_at).toLocaleString() : null,
      status_display: email.status.charAt(0).toUpperCase() + email.status.slice(1),
      priority_display: email.priority ? email.priority.charAt(0).toUpperCase() + email.priority.slice(1) : 'Normal'
    };
  },

  // Get status color for UI
  getStatusColor: (status) => {
    const colors = {
      draft: 'gray',
      sending: 'blue',
      sent: 'green',
      failed: 'red'
    };
    return colors[status] || 'gray';
  },

  // Get priority color for UI
  getPriorityColor: (priority) => {
    const colors = {
      low: 'gray',
      normal: 'blue',
      high: 'red'
    };
    return colors[priority] || 'blue';
  },

  // Export emails data
  exportEmails: async (filters = {}) => {
    const params = {
      ...filters,
      per_page: 1000 // Get more records for export
    };
    const response = await apiService.get('/single-emails', { params });
    return response.data?.emails || [];
  },

  // Get email templates (if available)
  getEmailTemplates: async () => {
    try {
      const response = await apiService.get('/templates');
      return response.data || [];
    } catch (error) {
      // Templates might not be implemented yet
      return [];
    }
  },

  // Bulk operations
  bulkDelete: async (emailIds) => {
    const promises = emailIds.map(id => singleEmailService.deleteSingleEmail(id));
    return Promise.allSettled(promises);
  },

  bulkUpdateStatus: async (emailIds, status) => {
    const promises = emailIds.map(id => 
      singleEmailService.updateSingleEmail(id, { status })
    );
    return Promise.allSettled(promises);
  },

  // Email composition helpers
  getDefaultEmailData: (smtpAccount) => {
    return {
      recipient_email: '',
      recipient_name: '',
      subject: '',
      body: '',
      from_name: smtpAccount?.from_name || '',
      from_email: smtpAccount?.email || '',
      reply_to: '',
      smtp_account_id: smtpAccount?.id || null,
      priority: 'normal'
    };
  },

  // Rich text editor helpers
  insertTemplate: (currentBody, template) => {
    return currentBody + '\n\n' + template;
  },

  // Email preview
  generatePreview: (emailData) => {
    return {
      subject: emailData.subject || 'No Subject',
      from: `${emailData.from_name || 'Unknown'} <${emailData.from_email || 'unknown@example.com'}>`,
      to: `${emailData.recipient_name || ''} <${emailData.recipient_email || 'recipient@example.com'}>`,
      body: emailData.body || 'No content',
      priority: emailData.priority || 'normal'
    };
  }
};

export default singleEmailService;
