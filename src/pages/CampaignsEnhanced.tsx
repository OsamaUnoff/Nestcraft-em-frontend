import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import campaignService from '../services/campaignService';

const campaignSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  subject: yup.string().required('Subject is required').min(3, 'Subject must be at least 3 characters'),
  body: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
  html_body: yup.string(),
  preheader: yup.string().max(255, 'Preheader must be less than 255 characters'),
  sender_email: yup.string().email('Invalid email format').required('Sender email is required'),
  sender_name: yup.string(),
  reply_to_email: yup.string().email('Invalid email format'),
  recipient_list_id: yup.number().required('Recipient list is required'),
  smtp_account_id: yup.number().required('SMTP account is required'),
  campaign_type: yup.string().oneOf(['standard', 'drip', 'autoresponder', 'a_b_test']),
  priority: yup.string().oneOf(['low', 'normal', 'high']),
  scheduled_time: yup.string(),
  timezone: yup.string(),
  track_opens: yup.boolean(),
  track_clicks: yup.boolean(),
  notes: yup.string(),
});

const CampaignsEnhanced = () => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    campaign_type: '',
    search: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  const queryClient = useQueryClient();

  const {
    reset,
  } = useForm({
    resolver: yupResolver(campaignSchema),
    defaultValues: {
      campaign_type: 'standard',
      priority: 'normal',
      track_opens: true,
      track_clicks: true,
      timezone: 'UTC',
    },
  });

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['campaigns', filters, currentPage, perPage],
    queryFn: () =>
      campaignService.getCampaigns({
        page: currentPage,
        per_page: perPage,
        ...filters,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).response?.data?.error || 'Failed to delete campaign');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, name }: any) => campaignService.duplicateCampaign(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).response?.data?.error || 'Failed to duplicate campaign');
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: any) => campaignService.sendCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign sent successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).response?.data?.error || 'Failed to send campaign');
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: any) => campaignService.pauseCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign paused successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).response?.data?.error || 'Failed to pause campaign');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: any) => campaignService.resumeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign resumed successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).response?.data?.error || 'Failed to resume campaign');
    },
  });

  const campaigns = (campaignsData as any)?.data || [];
  const pagination = (campaignsData as any)?.pagination || {};
  const summary = (campaignsData as any)?.summary || {};

  const handleEdit = (campaign: any) => {
    // setEditingCampaign(campaign); // This line was removed
    reset({
      name: campaign.name,
      subject: campaign.subject,
      body: campaign.body || campaign.content,
      html_body: campaign.html_body,
      preheader: campaign.preheader,
      sender_email: campaign.sender_email,
      sender_name: campaign.sender_name,
      reply_to_email: campaign.reply_to_email,
      recipient_list_id: campaign.recipient_list_id,
      smtp_account_id: campaign.smtp_account_id,
      campaign_type: campaign.campaign_type || 'standard',
      priority: campaign.priority || 'normal',
      scheduled_time: campaign.scheduled_time,
      timezone: campaign.timezone || 'UTC',
      track_opens: campaign.track_opens !== false,
      track_clicks: campaign.track_clicks !== false,
      notes: campaign.notes,
    });
    // setIsModalOpen(true); // This line was removed
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDuplicate = async (id: any, name: any) => {
    const newName = prompt('Enter name for duplicated campaign:', `${name} (Copy)`);
    if (newName) {
      await duplicateMutation.mutateAsync({ id, name: newName });
    }
  };

  const handleSend = async (id: any) => {
    if (window.confirm('Are you sure you want to send this campaign?')) {
      await sendMutation.mutateAsync(id);
    }
  };

  const handlePause = async (id: any) => {
    if (window.confirm('Are you sure you want to pause this campaign?')) {
      await pauseMutation.mutateAsync(id);
    }
  };

  const handleResume = async (id: any) => {
    if (window.confirm('Are you sure you want to resume this campaign?')) {
      await resumeMutation.mutateAsync(id);
    }
  };

  const handleOpenModal = () => {
    // setEditingCampaign(null); // This line was removed
    reset({
      campaign_type: 'standard',
      priority: 'normal',
      track_opens: true,
      track_clicks: true,
      timezone: 'UTC',
    });
    // setIsModalOpen(true); // This line was removed
  };

  const handleFilterChange = (key: any, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      campaign_type: '',
      search: '',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setCurrentPage(1);
  };

  const StatusBadge = ({ status }: any) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: PencilIcon },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: PaperAirplaneIcon },
      sending: { color: 'bg-yellow-100 text-yellow-800', icon: PaperAirplaneIcon },
      sent: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      paused: { color: 'bg-orange-100 text-orange-800', icon: PauseIcon },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      failed: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
    };

    const config = (statusConfig as any)[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Create, manage, and track your email marketing campaigns
          </p>
          {summary && (
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>📧 {summary.total_campaigns || 0} total campaigns</span>
              <span>🚀 {summary.active_campaigns || 0} active</span>
              <span>📊 {summary.filtered_count || 0} filtered</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {/* FunnelIcon className="h-4 w-4 mr-2" */}
            Filters
          </button>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                {/* MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" */}
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent,completed">Sent</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Campaign Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.campaign_type}
                onChange={(e) => handleFilterChange('campaign_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="standard">Standard</option>
                <option value="drip">Drip Campaign</option>
                <option value="autoresponder">Autoresponder</option>
                <option value="a_b_test">A/B Test</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="emails_sent">Emails Sent</option>
                  <option value="open_rate">Open Rate</option>
                </select>
                <select
                  value={filters.sort_order}
                  onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-6">
            {Object.values(filters).some(f => f)
              ? 'No campaigns match your current filters. Try adjusting your search criteria.'
              : 'Get started by creating your first email campaign.'
            }
          </p>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Campaigns ({pagination.total || 0})
              </h3>
              {selectedCampaigns.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedCampaigns.length} selected
                  </span>
                  <button className="text-sm text-red-600 hover:text-red-800">
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns((campaigns as any[]).map((c: any) => c.id) as any[]);
                        } else {
                          setSelectedCampaigns([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(campaigns as any[]).map((campaign: any) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={(selectedCampaigns as any[]).includes(campaign.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCampaigns([...(selectedCampaigns as any[]), campaign.id] as any[]);
                          } else {
                            setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={campaign.status} />
                      {campaign.campaign_type && campaign.campaign_type !== 'standard' && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {campaign.campaign_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {campaign.total_recipients || 0}
                      </div>
                      {campaign.emails_sent > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {campaign.emails_sent} sent
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.analytics ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Open:</span>
                            <span className="text-xs font-medium">{campaign.analytics.open_rate}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Click:</span>
                            <span className="text-xs font-medium">{campaign.analytics.click_rate}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {/* CalendarIcon className="h-4 w-4 text-gray-400 mr-1" */}
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(campaign.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Send/Pause/Resume Actions */}
                        {campaign.status === 'draft' || campaign.status === 'scheduled' ? (
                          <button
                            onClick={() => handleSend(campaign.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Send Campaign"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                        ) : campaign.status === 'sending' ? (
                          <button
                            onClick={() => handlePause(campaign.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Pause Campaign"
                          >
                            <PauseIcon className="h-4 w-4" />
                          </button>
                        ) : campaign.status === 'paused' ? (
                          <button
                            onClick={() => handleResume(campaign.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Resume Campaign"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                        ) : null}

                        {/* View/Edit Action */}
                        <button
                          onClick={() => handleEdit(campaign)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Campaign"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        {/* Duplicate Action */}
                        <button
                          onClick={() => handleDuplicate(campaign.id, campaign.name)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Duplicate Campaign"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>

                        {/* Delete Action */}
                        {(campaign.status === 'draft' || campaign.status === 'completed' || campaign.status === 'failed') && (
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Campaign"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignsEnhanced;
