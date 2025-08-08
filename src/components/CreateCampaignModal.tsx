import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RecipientList {
  id: number;
  name: string;
  description?: string;
  recipient_count: number;
}

interface SMTPAccount {
  id: number;
  email: string;
  provider: string;
  is_active: boolean;
}

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    recipient_list_id: number;
    smtp_account_id: number;
    from_name: string;
    from_email: string;
  }) => void;
  recipientLists: RecipientList[];
  smtpAccounts: SMTPAccount[];
  isLoading?: boolean;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  recipientLists,
  smtpAccounts,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    recipient_list_id: '',
    smtp_account_id: '',
    from_name: '',
    from_email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        recipient_list_id: '',
        smtp_account_id: '',
        from_name: '',
        from_email: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Auto-fill from_email when SMTP account is selected
  useEffect(() => {
    if (formData.smtp_account_id) {
      const selectedAccount = smtpAccounts.find(
        account => account.id === parseInt(formData.smtp_account_id)
      );
      if (selectedAccount) {
        setFormData(prev => ({
          ...prev,
          from_email: selectedAccount.email
        }));
      }
    }
  }, [formData.smtp_account_id, smtpAccounts]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.recipient_list_id) {
      newErrors.recipient_list_id = 'Please select a recipient list';
    }

    if (!formData.smtp_account_id) {
      newErrors.smtp_account_id = 'Please select an SMTP account';
    }

    if (!formData.from_name.trim()) {
      newErrors.from_name = 'From name is required';
    }

    if (!formData.from_email.trim()) {
      newErrors.from_email = 'From email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      recipient_list_id: parseInt(formData.recipient_list_id),
      smtp_account_id: parseInt(formData.smtp_account_id),
      from_name: formData.from_name.trim(),
      from_email: formData.from_email.trim()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Campaign Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter campaign name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Recipient List */}
          <div>
            <label htmlFor="recipient_list_id" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient List *
            </label>
            <select
              id="recipient_list_id"
              name="recipient_list_id"
              value={formData.recipient_list_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.recipient_list_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select recipient list</option>
              {recipientLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.recipient_count} recipients)
                </option>
              ))}
            </select>
            {errors.recipient_list_id && <p className="mt-1 text-sm text-red-600">{errors.recipient_list_id}</p>}
          </div>

          {/* SMTP Account */}
          <div>
            <label htmlFor="smtp_account_id" className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Account *
            </label>
            <select
              id="smtp_account_id"
              name="smtp_account_id"
              value={formData.smtp_account_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.smtp_account_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select SMTP account</option>
              {smtpAccounts.filter(account => account.is_active).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.email} ({account.provider})
                </option>
              ))}
            </select>
            {errors.smtp_account_id && <p className="mt-1 text-sm text-red-600">{errors.smtp_account_id}</p>}
          </div>

          {/* From Name */}
          <div>
            <label htmlFor="from_name" className="block text-sm font-medium text-gray-700 mb-1">
              From Name *
            </label>
            <input
              type="text"
              id="from_name"
              name="from_name"
              value={formData.from_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.from_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Your name or company name"
            />
            {errors.from_name && <p className="mt-1 text-sm text-red-600">{errors.from_name}</p>}
          </div>

          {/* From Email */}
          <div>
            <label htmlFor="from_email" className="block text-sm font-medium text-gray-700 mb-1">
              From Email *
            </label>
            <input
              type="email"
              id="from_email"
              name="from_email"
              value={formData.from_email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.from_email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="sender@example.com"
            />
            {errors.from_email && <p className="mt-1 text-sm text-red-600">{errors.from_email}</p>}
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700">
              After creating the campaign, click on it to add the subject, content, and send options.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
