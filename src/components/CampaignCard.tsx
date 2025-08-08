import React from 'react';
import {
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: string;
  recipient_count: number;
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  failed_count: number;
  from_email: string;
  from_name: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  sent_at?: string;
  recipient_list_id?: number;
  smtp_account_id: number;
  analytics: {
    open_rate: number;
    click_rate: number;
    delivery_rate: number;
    total_recipients: number;
    emails_sent: number;
    emails_opened: number;
    emails_clicked: number;
    emails_failed: number;
  };
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: number) => void;
  onSend: (id: number) => void;
  onPause?: (id: number) => void;
  onResume?: (id: number) => void;
  onCancel?: (id: number) => void;
  onClick: (campaign: Campaign) => void;
  onViewRecipients?: (campaign: Campaign) => void;
  onViewSendingProgress?: (campaign: Campaign) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'sending': return 'bg-yellow-100 text-yellow-800 animate-pulse';
    case 'sent': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-orange-100 text-orange-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft': return <PencilIcon className="h-4 w-4" />;
    case 'scheduled': return <ClockIcon className="h-4 w-4" />;
    case 'sending': return <PaperAirplaneIcon className="h-4 w-4" />;
    case 'sent': return <EnvelopeIcon className="h-4 w-4" />;
    case 'paused': return <PauseIcon className="h-4 w-4" />;
    case 'cancelled': return <StopIcon className="h-4 w-4" />;
    case 'failed': return <StopIcon className="h-4 w-4" />;
    default: return <PencilIcon className="h-4 w-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onDelete,
  onSend,
  onPause,
  onResume,
  onClick,
  onViewRecipients,
  onViewSendingProgress
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    onClick(campaign);
  };

  const canEdit = ['draft', 'scheduled', 'paused'].includes(campaign.status);
  const canDelete = ['draft', 'scheduled', 'paused'].includes(campaign.status);
  const canSend = campaign.status === 'draft';
  const canPause = campaign.status === 'sending';
  const canResume = campaign.status === 'paused';

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {campaign.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              {campaign.subject || 'No subject'}
            </p>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {getStatusIcon(campaign.status)}
                <span className="ml-1 capitalize">{campaign.status}</span>
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 ml-4">
            {canSend && (
              <button
                onClick={(e) => { e.stopPropagation(); onSend(campaign.id); }}
                className="action-button text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50"
                title="Send Campaign"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            )}
            {campaign.status === 'sending' && onViewSendingProgress && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewSendingProgress(campaign); }}
                className="action-button text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50"
                title="View Sending Progress"
              >
                <ClockIcon className="h-5 w-5" />
              </button>
            )}
            {canPause && onPause && (
              <button
                onClick={(e) => { e.stopPropagation(); onPause(campaign.id); }}
                className="action-button text-yellow-600 hover:text-yellow-700 p-2 rounded-md hover:bg-yellow-50"
                title="Pause Campaign"
              >
                <PauseIcon className="h-5 w-5" />
              </button>
            )}
            {canResume && onResume && (
              <button
                onClick={(e) => { e.stopPropagation(); onResume(campaign.id); }}
                className="action-button text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50"
                title="Resume Campaign"
              >
                <PlayIcon className="h-5 w-5" />
              </button>
            )}
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(campaign); }}
                className="action-button text-gray-600 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50"
                title="Edit Campaign"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(campaign.id); }}
                className="action-button text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
                title="Delete Campaign"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-2" />
              <span>{campaign.analytics.total_recipients || 0} recipients</span>
            </div>
            {campaign.recipient_list_id && onViewRecipients && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRecipients(campaign);
                }}
                className="action-button text-blue-600 hover:text-blue-700 text-xs underline"
                title="View Recipients"
              >
                View
              </button>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            <span>{campaign.analytics.emails_sent || 0} sent</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            <span>{(campaign.analytics.open_rate * 100).toFixed(1)}% opened</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            <span>{(campaign.analytics.click_rate * 100).toFixed(1)}% clicked</span>
          </div>
        </div>

        {/* Progress Bar for Sending Campaigns */}
        {campaign.status === 'sending' && campaign.analytics.total_recipients > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Sending Progress</span>
              <span>{campaign.analytics.emails_sent}/{campaign.analytics.total_recipients}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(campaign.analytics.emails_sent / campaign.analytics.total_recipients) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
          <span>From: {campaign.from_name}</span>
          <span>
            {campaign.sent_at ? `Sent ${formatDate(campaign.sent_at)}` : 
             campaign.scheduled_at ? `Scheduled ${formatDate(campaign.scheduled_at)}` :
             `Created ${formatDate(campaign.created_at)}`}
          </span>
        </div>
      </div>
    </div>
  );
};
