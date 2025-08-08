import React, { useState, useEffect } from 'react';
import { XMarkIcon, UsersIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import recipientService from '../services/recipientService';

interface Recipient {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status?: string;
  created_at: string;
}

interface RecipientPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientListId: number | null;
  recipientListName?: string;
}

export const RecipientPreviewModal: React.FC<RecipientPreviewModalProps> = ({
  isOpen,
  onClose,
  recipientListId,
  recipientListName
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch recipients for the selected list
  const { data: recipientsData, isLoading, error } = useQuery({
    queryKey: ['recipients', recipientListId, currentPage, searchTerm],
    queryFn: () => {
      if (!recipientListId) return null;
      return recipientService.getRecipients(recipientListId, {
        page: currentPage,
        per_page: 20,
        search: searchTerm
      });
    },
    enabled: isOpen && !!recipientListId
  });

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const recipients = recipientsData?.data || [];
  const pagination = (recipientsData as any)?.pagination || {};
  const totalRecipients = pagination.total || 0;

  const formatName = (recipient: Recipient) => {
    const firstName = recipient.first_name || '';
    const lastName = recipient.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'No name';
  };

  const getStatusColor = (status?: string) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800';
    }

    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'unsubscribed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Campaign Recipients
              </h2>
              <p className="text-sm text-gray-600">
                {recipientListName && `List: ${recipientListName}`}
                {totalRecipients > 0 && ` • ${totalRecipients} recipients`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipients by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading recipients...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 mb-2">
                  <EnvelopeIcon className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600">Failed to load recipients</p>
              </div>
            </div>
          ) : recipients.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching recipients' : 'No recipients found'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'This recipient list is empty'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              <div className="divide-y divide-gray-200">
                {recipients.map((recipient: any) => (
                  <div key={recipient.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {formatName(recipient)}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recipient.status)}`}>
                              {recipient.status || 'unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {recipient.email}
                          </p>
                          {recipient.phone && (
                            <p className="text-xs text-gray-500">
                              {recipient.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Added {new Date(recipient.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalRecipients > 20 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalRecipients)} of {totalRecipients} recipients
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {pagination.pages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages || 1))}
                  disabled={currentPage >= (pagination.pages || 1)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              These recipients will receive your campaign when sent.
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
