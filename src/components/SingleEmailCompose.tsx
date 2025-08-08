import React, { useState, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, DocumentIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import singleEmailService from '../services/singleEmailService';
import smtpService from '../services/smtpService';

interface SMTPAccount {
  id: number;
  name: string;
  email: string;
  provider: string;
  smtp_server: string;
  smtp_port: number;
  username: string;
  use_tls: boolean;
  use_ssl: boolean;
  is_active: boolean;
}

interface SingleEmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  emailId?: number | null;
  onSuccess?: () => void;
}

const SingleEmailCompose: React.FC<SingleEmailComposeProps> = ({
  isOpen,
  onClose,
  emailId,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    recipient_email: '',
    recipient_name: '',
    subject: '',
    body: '',
    from_name: '',
    from_email: '',
    reply_to: '',
    smtp_account_id: null as number | null,
    priority: 'normal'
  });

  // Get SMTP accounts
  const { data: smtpAccounts, isLoading: smtpLoading, error: smtpError } = useQuery({
    queryKey: ['smtp-accounts'],
    queryFn: smtpService.getAccounts,
    enabled: isOpen,
    retry: 3,
    retryDelay: 1000
  });

  // Debug: log the fetched SMTP accounts
  React.useEffect(() => {
    console.log('SMTP Accounts fetched for compose:', smtpAccounts);
  }, [smtpAccounts]);

  // Get email data if editing
  const { data: emailData } = useQuery({
    queryKey: ['single-email', emailId],
    queryFn: () => emailId ? singleEmailService.getSingleEmail(emailId) : null,
    enabled: isOpen && !!emailId
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (emailId) {
        return singleEmailService.updateSingleEmail(emailId, data);
      } else {
        return singleEmailService.createSingleEmail(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['single-emails'] });
      onSuccess?.();
      onClose();
    }
  });

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: (data: any) => {
      if (emailId) {
        return singleEmailService.sendSingleEmail(emailId);
      } else {
        return singleEmailService.createAndSendEmail(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['single-emails'] });
      onSuccess?.();
      onClose();
    }
  });

  // Load email data when editing
  useEffect(() => {
    if (emailData?.data) {
      const email = emailData.data;
      setFormData({
        recipient_email: email.recipient_email || '',
        recipient_name: email.recipient_name || '',
        subject: email.subject || '',
        body: email.body || '',
        from_name: email.from_name || '',
        from_email: email.from_email || '',
        reply_to: email.reply_to || '',
        smtp_account_id: email.smtp_account_id || null,
        priority: email.priority || 'normal'
      });
    }
  }, [emailData]);

  // Set default SMTP account
  useEffect(() => {
    if (Array.isArray(smtpAccounts) && !emailId && !formData.smtp_account_id) {
      const accounts = smtpAccounts;
      const defaultAccount = accounts.find((acc: SMTPAccount) => acc.id) || accounts[0];
      if (defaultAccount) {
        setFormData(prev => ({
          ...prev,
          smtp_account_id: defaultAccount.id,
          from_name: defaultAccount.name || '',
          from_email: defaultAccount.email
        }));
      }
    }
  }, [smtpAccounts, emailId, formData.smtp_account_id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSMTPChange = (smtpId: number) => {
    const accounts = Array.isArray(smtpAccounts) ? smtpAccounts : [];
    const selectedAccount = accounts.find((acc: SMTPAccount) => acc.id === smtpId);
    if (selectedAccount) {
      setFormData(prev => ({
        ...prev,
        smtp_account_id: smtpId,
        from_name: selectedAccount.name || prev.from_name,
        from_email: selectedAccount.email
      }));
    }
  };

  const handleSave = () => {
    const errors = singleEmailService.validateEmailData(formData);
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleSend = () => {
    const errors = singleEmailService.validateEmailData(formData);
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }
    
    if (confirm('Are you sure you want to send this email?')) {
      sendMutation.mutate(formData);
    }
  };

  const preview = singleEmailService.generatePreview(formData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {emailId ? 'Edit Email' : 'Compose Email'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {showPreview ? (
            /* Preview Mode */
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Email Preview</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>From:</strong> {preview.from}</div>
                  <div><strong>To:</strong> {preview.to}</div>
                  <div><strong>Subject:</strong> {preview.subject}</div>
                  <div><strong>Priority:</strong> {preview.priority}</div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Message Body:</h4>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: preview.body.replace(/\n/g, '<br>') }}
                />
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-6">
              {/* SMTP Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Account *
                </label>
                {smtpLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Loading SMTP accounts...
                  </div>
                ) : smtpError ? (
                  <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600">
                    Error loading SMTP accounts: {smtpError?.message || 'Unknown error'}
                  </div>
                ) : (
                  <select
                    value={formData.smtp_account_id || ''}
                    onChange={(e) => handleSMTPChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">
                      {Array.isArray(smtpAccounts) && smtpAccounts.length === 0
                        ? 'No SMTP accounts available'
                        : 'Select SMTP Account'
                      }
                    </option>
                    {Array.isArray(smtpAccounts) && smtpAccounts.map((account: SMTPAccount) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.email}) - {account.provider}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={formData.recipient_email}
                    onChange={(e) => handleInputChange('recipient_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="recipient@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Sender Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name *
                  </label>
                  <input
                    type="text"
                    value={formData.from_name}
                    onChange={(e) => handleInputChange('from_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply To
                  </label>
                  <input
                    type="email"
                    value={formData.reply_to}
                    onChange={(e) => handleInputChange('reply_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="reply@example.com"
                  />
                </div>
              </div>

              {/* Subject and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email subject"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Body *
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message here..."
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-white rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {emailId ? 'Editing existing email' : 'Creating new email'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              {!showPreview && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    {sendMutation.isPending ? 'Sending...' : 'Send Now'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SingleEmailCompose };
