import React, { useState } from 'react';
import { XMarkIcon, PaperAirplaneIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import recipientService from '../services/recipientService';

interface Recipient {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  status?: string;
}

interface Campaign {
  id: number;
  name: string;
  subject: string;
  recipient_list_id: number;
  analytics: {
    total_recipients: number;
  };
}

interface SendConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaign: Campaign | null;
  recipientListName?: string;
  isLoading?: boolean;
}

export const SendConfirmationModal: React.FC<SendConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  campaign,
  recipientListName,
  isLoading = false
}) => {
  const [showAllRecipients, setShowAllRecipients] = useState(false);

  // Fetch first few recipients for preview
  const { data: recipientsData } = useQuery({
    queryKey: ['recipients-preview', campaign?.recipient_list_id],
    queryFn: () => {
      if (!campaign?.recipient_list_id) return null;
      return recipientService.getRecipients(campaign.recipient_list_id, {
        page: 1,
        per_page: showAllRecipients ? 50 : 5,
        search: ''
      });
    },
    enabled: isOpen && !!campaign?.recipient_list_id
  });

  if (!isOpen || !campaign) return null;

  const recipients = recipientsData?.data || [];
  const totalRecipients = campaign.analytics.total_recipients || 0;
  const hasMoreRecipients = totalRecipients > recipients.length;

  const formatName = (recipient: Recipient) => {
    const firstName = recipient.first_name || '';
    const lastName = recipient.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'No name';
  };

  const getStatusColor = (status?: string) => {
    if (!status || status.toLowerCase() === 'active') {
      return 'text-green-600';
    }
    return 'text-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Confirm Campaign Send
              </h2>
              <p className="text-sm text-gray-600">
                Review recipients before sending
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

        {/* Campaign Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Campaign:</span>
              <span className="ml-2 text-sm text-gray-900">{campaign.name}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Subject:</span>
              <span className="ml-2 text-sm text-gray-900">{campaign.subject || 'No subject'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Recipient List:</span>
              <span className="ml-2 text-sm text-gray-900">{recipientListName || 'Unknown List'}</span>
            </div>
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''} will receive this campaign
              </span>
            </div>
          </div>
        </div>

        {/* Recipients Preview */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recipients Preview</h3>
              {hasMoreRecipients && !showAllRecipients && (
                <button
                  onClick={() => setShowAllRecipients(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Show more
                </button>
              )}
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {recipients.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recipients found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recipients.map((recipient: any) => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {recipient.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatName(recipient)}
                          </p>
                          <p className="text-sm text-gray-600">{recipient.email}</p>
                        </div>
                      </div>
                      <div className={`text-xs font-medium ${getStatusColor(recipient.status)}`}>
                        {recipient.status || 'active'}
                      </div>
                    </div>
                  ))}
                  
                  {hasMoreRecipients && (
                    <div className="text-center py-3">
                      <p className="text-sm text-gray-500">
                        {showAllRecipients 
                          ? `Showing ${recipients.length} of ${totalRecipients} recipients`
                          : `And ${totalRecipients - recipients.length} more recipients...`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="px-6 py-4 bg-orange-50 border-t border-orange-200">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                This action cannot be undone
              </p>
              <p className="text-sm text-orange-700">
                Once sent, the campaign will be delivered to all {totalRecipients} recipients immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || totalRecipients === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Campaign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
