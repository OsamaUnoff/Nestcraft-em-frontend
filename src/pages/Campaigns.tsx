import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import campaignService from '../services/campaignService';
import recipientService from '../services/recipientService';
import smtpService from '../services/smtpService';
import { CampaignCard } from '../components/CampaignCard';
import { CreateCampaignModal } from '../components/CreateCampaignModal';
import { CampaignDetailModal } from '../components/CampaignDetailModal';
import { RecipientPreviewModal } from '../components/RecipientPreviewModal';
import { SendConfirmationModal } from '../components/SendConfirmationModal';
import { SendingProgressModal } from '../components/SendingProgressModal';

const Campaigns = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRecipientPreviewOpen, setIsRecipientPreviewOpen] = useState(false);
  const [isSendConfirmationOpen, setIsSendConfirmationOpen] = useState(false);
  const [isSendingProgressOpen, setIsSendingProgressOpen] = useState(false);
  const [searchTerm] = useState('');
  const [filters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    priority: '',
  });
  const [currentPage] = useState(1);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipientPreviewCampaign, setRecipientPreviewCampaign] = useState(null);
  const [sendConfirmationCampaign, setSendConfirmationCampaign] = useState(null);
  const [sendingProgressCampaignId, setSendingProgressCampaignId] = useState(null);

  const queryClient = useQueryClient();

  // Enhanced queries with pagination and search
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['campaigns', currentPage, searchTerm, filters],
    queryFn: () => campaignService.getCampaigns({
      page: currentPage,
      search: searchTerm,
      status: filters.status,
      priority: filters.priority,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    }),
  });

  const { data: listsData } = useQuery({
    queryKey: ['recipient-lists', 1, 50],
    queryFn: () => recipientService.getLists({ page: 1, per_page: 50 }),
  });

  const { data: smtpData } = useQuery({
    queryKey: ['smtp-accounts', 1, 100, true],
    queryFn: () => smtpService.getAccounts({ page: 1, limit: 100, active_only: true }),
  });

  const createBasicCampaignMutation = useMutation({
    mutationFn: (data: any) =>
      campaignService.createCampaign({
        ...(data as any),
        subject: '',
        content: '',
      }),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
      setIsCreateModalOpen(false);
      setSelectedCampaign((response as any).data);
      setIsDetailModalOpen(true);
    },
    onError: (error: any) => {
      toast.error((error as any).error || 'Failed to create campaign');
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: any) => campaignService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).error || 'Failed to update campaign');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).error || 'Failed to delete campaign');
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: any) => campaignService.sendCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign sent successfully');
    },
    onError: (error: any) => {
      toast.error((error as any).error || 'Failed to send campaign');
    },
  });

  // Helper functions
  // Normalize campaigns array from various possible response shapes
  const campaigns = Array.isArray((campaignsData as any)?.data)
    ? (campaignsData as any).data
    : Array.isArray(campaignsData as any)
      ? (campaignsData as any)
      : (campaignsData as any)?.data?.campaigns || (campaignsData as any)?.campaigns || [];

  const handleCampaignClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsDetailModalOpen(true);
  };

  const handleCreateCampaign = (data: any) => {
    createBasicCampaignMutation.mutate(data);
  };

  const handleUpdateCampaign = (id: any, data: any) => {
    updateCampaignMutation.mutate({ id, data });
  };

  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsDetailModalOpen(true);
  };

  const handleViewRecipients = (campaign: any) => {
    setRecipientPreviewCampaign(campaign);
    setIsRecipientPreviewOpen(true);
  };

  const getRecipientListName = (campaign: any) => {
    const lists = (listsData as any)?.data?.lists || (listsData as any)?.lists || [];
    const list = lists.find((l: any) => l.id === campaign.recipient_list_id);
    return list ? list.name : 'Unknown List';
  };

  const handleViewSendingProgress = (campaign: any) => {
    setSendingProgressCampaignId(campaign.id);
    setIsSendingProgressOpen(true);
  };

  const handleDelete = (id: any) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSend = (id: any) => {
    const campaign = campaigns.find((c: any) => c.id === id);
    if (campaign) {
      setSendConfirmationCampaign(campaign);
      setIsSendConfirmationOpen(true);
    }
  };

  const handleConfirmedSend = () => {
    if (sendConfirmationCampaign) {
      sendMutation.mutate((sendConfirmationCampaign as any).id);
      setIsSendConfirmationOpen(false);
      setSendConfirmationCampaign(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first email campaign.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(campaigns as any[]).map((campaign: any) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={handleCampaignClick}
              onEdit={handleEditCampaign}
              onDelete={handleDelete}
              onSend={handleSend}
              onPause={() => {}}
              onResume={() => {}}
              onCancel={() => {}}
              onViewRecipients={handleViewRecipients}
              onViewSendingProgress={handleViewSendingProgress}
            />
          ))}
        </div>
      )}

              <CreateCampaignModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCampaign}
          recipientLists={(
            Array.isArray((listsData as any)?.data)
              ? (listsData as any).data
              : Array.isArray(listsData as any)
                ? (listsData as any)
                : (listsData as any)?.lists || []
          ).map((list: any) => ({
            ...list,
            recipient_count: list.recipient_count ?? list.total_recipients ?? list.active_recipients ?? 0,
          }))}
          smtpAccounts={(
            Array.isArray(smtpData as any)
              ? (smtpData as any)
              : Array.isArray((smtpData as any)?.data)
                ? (smtpData as any).data
                : (smtpData as any)?.accounts || []
          ).map((acc: any) => ({
            ...acc,
            email: acc.email || acc.username || acc.user || acc.from_email || '',
          }))}
          isLoading={createBasicCampaignMutation.isPending}
        />

      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCampaign(null);
        }}
        onUpdate={handleUpdateCampaign}
        onSend={handleSend}
        onPause={() => {}}
        onResume={() => {}}
        onCancel={() => {}}
        onViewRecipients={handleViewRecipients}
        isLoading={updateCampaignMutation.isPending || sendMutation.isPending}
      />

      <RecipientPreviewModal
        isOpen={isRecipientPreviewOpen}
        onClose={() => {
          setIsRecipientPreviewOpen(false);
          setRecipientPreviewCampaign(null);
        }}
        recipientListId={(recipientPreviewCampaign as any)?.recipient_list_id || null}
        recipientListName={recipientPreviewCampaign ? getRecipientListName(recipientPreviewCampaign as any) : undefined}
      />

      <SendConfirmationModal
        isOpen={isSendConfirmationOpen}
        onClose={() => {
          setIsSendConfirmationOpen(false);
          setSendConfirmationCampaign(null);
        }}
        onConfirm={handleConfirmedSend}
        campaign={sendConfirmationCampaign}
        recipientListName={sendConfirmationCampaign ? getRecipientListName(sendConfirmationCampaign as any) : undefined}
        isLoading={sendMutation.isPending}
      />

      <SendingProgressModal
        isOpen={isSendingProgressOpen}
        onClose={() => {
          setIsSendingProgressOpen(false);
          setSendingProgressCampaignId(null);
        }}
        campaignId={sendingProgressCampaignId}
      />
    </div>
  );
};

export default Campaigns;
