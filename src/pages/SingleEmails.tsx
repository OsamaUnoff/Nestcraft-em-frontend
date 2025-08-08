import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import singleEmailService from '../services/singleEmailService.js';
import smtpService from '../services/smtpService.js';

const emailSchema = yup.object({
  recipient_email: yup.string().email('Invalid email').required('Recipient email is required'),
  recipient_name: yup.string().optional(),
  subject: yup.string().required('Subject is required').max(255, 'Subject too long'),
  body: yup.string().required('Email body is required'),
  from_name: yup.string().optional(),
  from_email: yup.string().email('Invalid email').optional(),
  reply_to: yup.string().email('Invalid email').optional(),
  smtp_account_id: yup.string().required('SMTP account is required'),
  priority: yup.string().oneOf(['low', 'normal', 'high']).default('normal'),
});



const SingleEmails = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<any>(null);
  const [viewingEmail, setViewingEmail] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    status: '', 
    priority: '', 
    dateFrom: '', 
    dateTo: '' 
  });
  const [sendingEmails, setSendingEmails] = useState<Set<number>>(new Set());
  const [itemsPerPage] = useState(20);

  const form = useForm({ 
    resolver: yupResolver(emailSchema),
    defaultValues: {
      recipient_email: '',
      recipient_name: '',
      subject: '',
      body: '',
      from_name: '',
      from_email: '',
      reply_to: '',
      smtp_account_id: '',
      priority: 'normal',
    }
  });

  const { data: emailsData, isLoading } = useQuery({
    queryKey: ['single-emails', currentPage, searchTerm, filters],
    queryFn: () => singleEmailService.getSingleEmails({
      page: currentPage,
      per_page: itemsPerPage,
      search: searchTerm,
      ...filters,
    }),
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  // Real-time status monitoring for sending emails
  useEffect(() => {
    const interval = setInterval(() => {
      if (sendingEmails.size > 0) {
        queryClient.invalidateQueries({ queryKey: ['single-emails'] });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sendingEmails, queryClient]);

  // Fetch SMTP accounts for the compose modal
  const { data: smtpAccounts, isLoading: smtpLoading, error: smtpError } = useQuery({
    queryKey: ['smtp-accounts'],
    queryFn: smtpService.getAccounts,
    retry: 3,
    retryDelay: 1000
  });

  // Debug: log SMTP accounts data
  console.log('🔍 SingleEmails - SMTP Accounts:', {
    smtpAccounts,
    smtpLoading,
    smtpError,
    accountsCount: Array.isArray(smtpAccounts) ? smtpAccounts.length : 'Not an array'
  });

  // Debug function to manually test SMTP accounts fetch
  const testSMTPFetch = async () => {
    try {
      console.log('🧪 Testing SMTP accounts fetch...');
      const result = await smtpService.getAccounts();
      console.log('✅ Manual SMTP fetch result:', result);
      toast.success(`SMTP accounts fetched: ${Array.isArray(result) ? result.length : 'Invalid response'}`);
    } catch (error) {
      console.error('❌ Manual SMTP fetch error:', error);
      toast.error(`SMTP fetch failed: ${(error as any)?.message || 'Unknown error'}`);
    }
  };

  // Test SMTP connection for a specific account
  const testSMTPConnection = async (accountId: number) => {
    try {
      console.log('🧪 Testing SMTP connection for account:', accountId);
      const loadingToast = toast.loading('Testing SMTP connection...');
      
      const result = await smtpService.testConnection(accountId);
      
      toast.dismiss(loadingToast);
      toast.success('SMTP connection test successful!');
      console.log('✅ SMTP connection test result:', result);
    } catch (error: any) {
      console.error('❌ SMTP connection test error:', error);
      toast.error(`SMTP connection failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Enhanced mutations
  const sendEmailMutation = useMutation({
    mutationFn: singleEmailService.sendSingleEmail,
    onSuccess: (_, emailId) => {
      setSendingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
      toast.success('Email sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['single-emails'] });
    },
    onError: (error: any, emailId) => {
      setSendingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
      toast.error(`Failed to send email: ${error.message}`);
    }
  });



  // Helper functions


  const getEmailStats = () => {
    const emails = emailsData?.data?.emails || emailsData || [];
    return {
      total: emails.length,
      draft: emails.filter((e: any) => e.status === 'draft').length,
      sent: emails.filter((e: any) => e.status === 'sent').length,
      failed: emails.filter((e: any) => e.status === 'failed').length,
      sending: emails.filter((e: any) => e.status === 'sending').length,
    };
  };

  // Handle SMTP error with toast notification
  React.useEffect(() => {
    if (smtpError) {
      console.error('❌ SMTP accounts query failed:', smtpError);
      toast.error('Failed to load SMTP accounts. You can still compose emails manually.');
    }
  }, [smtpError]);



  const handleOpenModal = (email: any = null) => {
    if (email) {
      setEditingEmail(email);
      form.reset({
        recipient_email: email.recipient_email,
        subject: email.subject,
        body: email.body,
        smtp_account_id: email.smtp_account_id,
      });
    } else {
      setEditingEmail(null);
      form.reset({
        recipient_email: '',
        subject: '',
        body: '',
        smtp_account_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmail(null);
    form.reset();
  };

  const handleEdit = (email: any) => {
    handleOpenModal(email);
  };

  const handleView = (email: any) => {
    setViewingEmail(email);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingEmail(null);
  };

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const handleSearch = (search: any) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingEmail) {
        await singleEmailService.updateSingleEmail(editingEmail.id, data);
        toast.success('Email updated successfully');
      } else {
        await singleEmailService.createSingleEmail(data);
        toast.success('Email created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save email');
    }
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        await singleEmailService.deleteSingleEmail(id);
        toast.success('Email deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete email');
      }
    }
  };

  const handleSend = async (id: any) => {
    try {
      setSendingEmails(prev => new Set([...prev, id]));
      
      console.log('🚀 Attempting to send email with ID:', id);
      
      await sendEmailMutation.mutateAsync(id);
      
      console.log('✅ Send email completed');
    } catch (error: any) {
      console.error('❌ Send email error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      // Provide more specific error messages for SMTP issues
      let errorMessage = error.message || 'Failed to send email';
      
      if (errorMessage.includes('SMTP authentication failed')) {
        errorMessage = 'SMTP authentication failed. Please check your SMTP account credentials in the SMTP Accounts page.';
      } else if (errorMessage.includes('authentication failed')) {
        errorMessage = 'Email authentication failed. Please verify your SMTP settings.';
      } else if (errorMessage.includes('connection')) {
        errorMessage = 'SMTP connection failed. Please check your internet connection and SMTP server settings.';
      } else if (error.response?.status === 500) {
        errorMessage = `Server error (500): ${error.response?.data?.error || errorMessage}`;
      } else if (error.response?.status === 404) {
        errorMessage = 'Email not found or endpoint not available.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleRetryAllFailed = async () => {
    const failedEmails = emails.filter((email: any) => email.status === 'failed');
    
    if (failedEmails.length === 0) {
      toast('No failed emails to retry');
      return;
    }

    if (!confirm(`Retry sending ${failedEmails.length} failed email(s)?`)) {
      return;
    }

    try {
      const loadingToast = toast.loading(`Retrying ${failedEmails.length} failed email(s)...`);
      
      // Send all failed emails
      const promises = failedEmails.map((email: any) => 
        singleEmailService.sendSingleEmail(email.id)
      );
      
      await Promise.all(promises);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Successfully retried ${failedEmails.length} email(s)`);
      
      // Refresh the emails list
      window.location.reload();
    } catch (error: any) {
      toast.error(`Failed to retry some emails: ${error.message}`);
    }
  };

  const emails = emailsData?.data?.emails || emailsData || [];
  const pagination = emailsData?.data?.pagination || { page: 1, pages: 1, total: 0, has_next: false, has_prev: false };
  const stats = getEmailStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Single Emails</h1>
          <p className="text-gray-600">Send individual emails to recipients</p>
        </div>
        <div className="flex items-center gap-2">
        <button
          onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Compose Email
        </button>
          
          {/* Retry All Failed button */}
          {stats.failed > 0 && (
            <button
              onClick={handleRetryAllFailed}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center gap-2 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Retry All Failed ({stats.failed})
            </button>
          )}
          
          {/* Debug button for SMTP accounts */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={testSMTPFetch}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center gap-2 transition-colors"
            >
              🧪 Test SMTP
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sent</p>
              <p className="text-lg font-semibold text-gray-900">{stats.sent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <p className="text-lg font-semibold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-lg font-semibold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails by recipient, subject, or content..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => handleFilter({ ...filters, status: e.target.value })}
                className="pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
                <option value="pending">Pending</option>
            </select>
            </div>
            <select
              value={filters.priority}
              onChange={(e) => handleFilter({ ...filters, priority: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilter({ ...filters, dateFrom: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="From"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilter({ ...filters, dateTo: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="To"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emails Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-12">
            <PaperAirplaneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600 mb-6">Get started by composing your first email.</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Compose Email
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emails.map((email: any) => (
                  <tr key={email.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.recipient_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          email.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : email.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : email.status === 'sending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {email.status}
                      </span>
                        {email.status === 'failed' && (
                          <span className="text-xs text-orange-600 font-medium">
                            (Can retry)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          email.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : email.priority === 'low'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {email.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(email.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(email)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(email)}
                          className="text-gray-600 hover:text-gray-700"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {(email.status === 'draft' || email.status === 'failed') && (
                          <button
                            onClick={() => handleSend(email.id)}
                            className={`${
                              email.status === 'failed' 
                                ? 'text-orange-600 hover:text-orange-700' 
                                : 'text-green-600 hover:text-green-700'
                            }`}
                            title={email.status === 'failed' ? 'Send Again' : 'Send'}
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Debug button for development */}
                        {import.meta.env.DEV && (
                          <button
                            onClick={() => console.log('Email details:', email)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Debug Email"
                          >
                            🐛
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(email.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_prev}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Compose/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={handleCloseModal}></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full z-[10000]">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingEmail ? 'Edit Email' : 'Compose Email'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipient Email *</label>
                      <input
                        {...form.register('recipient_email')}
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="recipient@example.com"
                      />
                      {form.formState.errors.recipient_email && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.recipient_email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject *</label>
                      <input
                        {...form.register('subject')}
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email subject"
                      />
                      {form.formState.errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">SMTP Account *</label>
                      {smtpLoading ? (
                        <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
                          Loading SMTP accounts...
                        </div>
                      ) : smtpError ? (
                        <div className="mt-1 block w-full border border-red-300 rounded-md px-3 py-2 bg-red-50 text-red-600">
                          Error loading SMTP accounts: {(smtpError as any)?.message || 'Unknown error'}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                      <select
                        {...form.register('smtp_account_id')}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">
                              {Array.isArray(smtpAccounts) && smtpAccounts.length === 0
                                ? 'No SMTP accounts available'
                                : 'Select SMTP Account'
                              }
                            </option>
                            {Array.isArray(smtpAccounts) && smtpAccounts.map((account: any) => (
                              <option key={account.id} value={account.id}>
                                {account.name} ({account.email || account.from_email}) - {account.provider || 'Custom'}
                              </option>
                            ))}
                      </select>
                          
                          {/* Test Connection Button */}
                          {form.watch('smtp_account_id') && (
                            <button
                              type="button"
                              onClick={() => testSMTPConnection(Number(form.watch('smtp_account_id')))}
                              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              Test
                            </button>
                          )}
                        </div>
                      )}
                      {form.formState.errors.smtp_account_id && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.smtp_account_id.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Body *</label>
                      <textarea
                        {...form.register('body')}
                        rows={10}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Write your email content here..."
                      />
                      {form.formState.errors.body && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.body.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 sm:ml-3 sm:w-auto w-full"
                  >
                    {form.formState.isSubmitting ? 'Saving...' : editingEmail ? 'Update' : 'Send'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 sm:mt-0 sm:w-auto w-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingEmail && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={handleCloseViewModal}></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">From</dt>
                    <dd className="mt-1 text-sm text-gray-900">{(viewingEmail as any).from_name} &lt;{(viewingEmail as any).from_email}&gt;</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">To</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {(viewingEmail as any).recipient_name
                        ? `${(viewingEmail as any).recipient_name} <${(viewingEmail as any).recipient_email}>`
                        : (viewingEmail as any).recipient_email}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Subject</dt>
                    <dd className="mt-1 text-sm text-gray-900">{(viewingEmail as any).subject}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (viewingEmail as any).status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : (viewingEmail as any).status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : (viewingEmail as any).status === 'sending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {(viewingEmail as any).status.charAt(0).toUpperCase() + (viewingEmail as any).status.slice(1)}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="mt-1 text-sm text-gray-900">{(viewingEmail as any).priority.charAt(0).toUpperCase() + (viewingEmail as any).priority.slice(1)}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date((viewingEmail as any).created_at).toLocaleString()}</dd>
                  </div>

                  {(viewingEmail as any).sent_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sent</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date((viewingEmail as any).sent_at).toLocaleString()}</dd>
                    </div>
                  )}

                  {(viewingEmail as any).has_opened && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Opened</dt>
                      <dd className="mt-1 text-sm text-gray-900">Yes</dd>
                    </div>
                  )}

                  {(viewingEmail as any).has_clicked && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Clicked</dt>
                      <dd className="mt-1 text-sm text-gray-900">Yes</dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Content</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{(viewingEmail as any).body}</dd>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {((viewingEmail as any).status === 'draft' || (viewingEmail as any).status === 'failed') && (
                  <button
                    onClick={() => handleSend((viewingEmail as any).id)}
                    className={`${
                      (viewingEmail as any).status === 'failed'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white px-4 py-2 rounded-md sm:ml-3 sm:w-auto w-full`}
                  >
                    {(viewingEmail as any).status === 'failed' ? 'Send Again' : 'Send Email'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 sm:mt-0 sm:w-auto w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleEmails;
