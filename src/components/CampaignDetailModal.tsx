import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  ClockIcon, 
  PauseIcon, 
  PlayIcon,
  StopIcon,
  UsersIcon,
  EnvelopeIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  name: string;
  subject: string;
  content: string;
  body: string;
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

interface CampaignDetailModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: { subject?: string; content?: string; scheduled_at?: string }) => void;
  onSend: (id: number) => void;
  onPause?: (id: number) => void;
  onResume?: (id: number) => void;
  onCancel?: (id: number) => void;
  onViewRecipients?: (campaign: Campaign) => void;
  isLoading?: boolean;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onUpdate,
  onSend,
  onPause,
  onResume,
  onCancel,
  onViewRecipients,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'analytics'>('compose');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    scheduled_at: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  // Update form data when campaign changes
  useEffect(() => {
    if (campaign) {
      setFormData({
        subject: campaign.subject || '',
        content: campaign.content || campaign.body || '',
        scheduled_at: campaign.scheduled_at || ''
      });
      setIsEditing(false);
      setShowScheduler(false);
      setActiveTab('compose');
    }
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const handleSave = () => {
    onUpdate(campaign.id, {
      subject: formData.subject,
      content: formData.content,
      ...(formData.scheduled_at && { scheduled_at: formData.scheduled_at })
    });
    setIsEditing(false);
  };

  const handleSendNow = () => {
    if (window.confirm('Are you sure you want to send this campaign now? This action cannot be undone.')) {
      onSend(campaign.id);
    }
  };

  const handleScheduleSend = () => {
    if (!formData.scheduled_at) {
      alert('Please select a date and time for scheduling.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to schedule this campaign for ${new Date(formData.scheduled_at).toLocaleString()}?`)) {
      onUpdate(campaign.id, {
        subject: formData.subject,
        content: formData.content,
        scheduled_at: formData.scheduled_at
      });
      setShowScheduler(false);
    }
  };

  const canEdit = ['draft', 'scheduled', 'paused'].includes(campaign.status);
  const canSend = campaign.status === 'draft' && formData.subject.trim() && formData.content.trim();
  const canPause = campaign.status === 'sending';
  const canResume = campaign.status === 'paused';
  const canCancel = ['scheduled', 'sending', 'paused'].includes(campaign.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">{campaign.name}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'compose'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Compose
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'compose' ? (
              <div className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email subject"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {formData.subject || <span className="text-gray-400">No subject set</span>}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Content
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email content here..."
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-md min-h-[300px] whitespace-pre-wrap">
                      {formData.content || <span className="text-gray-400">No content set</span>}
                    </div>
                  )}
                </div>

                {/* Schedule Section */}
                {showScheduler && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Schedule Campaign</h4>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    {canEdit && (
                      <>
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSave}
                              disabled={isLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            Edit Campaign
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {canSend && !showScheduler && (
                      <>
                        <button
                          onClick={() => setShowScheduler(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Schedule
                        </button>
                        <button
                          onClick={handleSendNow}
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
                        >
                          <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                          Send Now
                        </button>
                      </>
                    )}

                    {showScheduler && (
                      <>
                        <button
                          onClick={() => setShowScheduler(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleScheduleSend}
                          disabled={isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                        >
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Schedule Send
                        </button>
                      </>
                    )}

                    {canPause && onPause && (
                      <button
                        onClick={() => onPause(campaign.id)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
                      >
                        <PauseIcon className="h-4 w-4 mr-2" />
                        Pause
                      </button>
                    )}

                    {canResume && onResume && (
                      <button
                        onClick={() => onResume(campaign.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Resume
                      </button>
                    )}

                    {canCancel && onCancel && (
                      <button
                        onClick={() => onCancel(campaign.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                      >
                        <StopIcon className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Analytics Tab Content */
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-900">Total Recipients</p>
                          <p className="text-2xl font-bold text-blue-600">{campaign.analytics.total_recipients}</p>
                        </div>
                      </div>
                      {campaign.recipient_list_id && onViewRecipients && (
                        <button
                          onClick={() => onViewRecipients(campaign)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                        >
                          View List
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-900">Emails Sent</p>
                        <p className="text-2xl font-bold text-green-600">{campaign.analytics.emails_sent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <EyeIcon className="h-8 w-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-900">Emails Opened</p>
                        <p className="text-2xl font-bold text-yellow-600">{campaign.analytics.emails_opened}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CursorArrowRaysIcon className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-900">Emails Clicked</p>
                        <p className="text-2xl font-bold text-purple-600">{campaign.analytics.emails_clicked}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Delivery Rate</span>
                        <span>{(campaign.analytics.delivery_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${campaign.analytics.delivery_rate * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Open Rate</span>
                        <span>{(campaign.analytics.open_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${campaign.analytics.open_rate * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Click Rate</span>
                        <span>{(campaign.analytics.click_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${campaign.analytics.click_rate * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="text-gray-900">{campaign.from_name} &lt;{campaign.from_email}&gt;</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">{formatDate(campaign.created_at)}</span>
                    </div>
                    {campaign.scheduled_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scheduled:</span>
                        <span className="text-gray-900">{formatDate(campaign.scheduled_at)}</span>
                      </div>
                    )}
                    {campaign.sent_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sent:</span>
                        <span className="text-gray-900">{formatDate(campaign.sent_at)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-900">{formatDate(campaign.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Failed Emails */}
                {campaign.analytics.emails_failed > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                      <h3 className="text-lg font-medium text-red-900">Failed Deliveries</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      {campaign.analytics.emails_failed} emails failed to deliver.
                    </p>
                    <p className="text-xs text-red-600">
                      Common reasons include invalid email addresses, full mailboxes, or spam filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
