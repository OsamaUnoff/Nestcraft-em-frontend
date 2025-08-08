import React, { useState } from 'react';
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

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipientPreviewCampaign, setRecipientPreviewCampaign] = useState(null);
  const [sendConfirmationCampaign, setSendConfirmationCampaign] = useState(null);
  const [sendingProgressCampaignId, setSendingProgressCampaignId] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const queryClient = useQueryClient();

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getCampaigns(),
  });

  const { data: listsData } = useQuery({
    queryKey: ['recipient-lists'],
    queryFn: () => recipientService.getLists(),
  });

  const { data: smtpData } = useQuery({
    queryKey: ['smtp-accounts'],
    queryFn: () => smtpService.getAccounts(),
  });

  const createBasicCampaignMutation = useMutation({
    mutationFn: (data) =>
      campaignService.createCampaign({
        ...data,
        subject: '',
        content: '',
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
      setIsCreateModalOpen(false);
      setSelectedCampaign(response.data);
      setIsDetailModalOpen(true);
    },
    onError: (error) => {
      toast.error(error.error || 'Failed to create campaign');
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => campaignService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      toast.error(error.error || 'Failed to update campaign');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      toast.error(error.error || 'Failed to delete campaign');
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id) => campaignService.sendCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign sent successfully');
    },
    onError: (error) => {
      toast.error(error.error || 'Failed to send campaign');
    },
  });

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalOpen(true);
  };

  const handleCreateCampaign = (data) => {
    createBasicCampaignMutation.mutate(data);
  };

  const handleUpdateCampaign = (id, data) => {
    updateCampaignMutation.mutate({ id, data });
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setSelectedCampaign(campaign);
    setIsDetailModalOpen(true);
  };

  const handleViewRecipients = (campaign) => {
    setRecipientPreviewCampaign(campaign);
    setIsRecipientPreviewOpen(true);
  };

  const getRecipientListName = (campaign) => {
    if (!campaign.recipient_list_id || !lists) return 'Unknown List';
    const list = lists.find((l) => l.id === campaign.recipient_list_id);
    return list ? list.name : 'Unknown List';
  };

  const handleViewSendingProgress = (campaign) => {
    setSendingProgressCampaignId(campaign.id);
    setIsSendingProgressOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSend = (id) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      setSendConfirmationCampaign(campaign);
      setIsSendConfirmationOpen(true);
    }
  };

  const handleConfirmedSend = () => {
    if (sendConfirmationCampaign) {
      sendMutation.mutate(sendConfirmationCampaign.id, {
        onSuccess: () => {
          setIsSendConfirmationOpen(false);
          setSendConfirmationCampaign(null);
          setSendingProgressCampaignId(sendConfirmationCampaign.id);
          setIsSendingProgressOpen(true);
        },
      });
    }
  };

  const campaigns = campaignsData?.data || [];
  const lists = listsData?.data || [];
  const smtpAccounts = smtpData?.data?.accounts || [];

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
          {campaigns.map((campaign) => (
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
        recipientLists={lists}
        smtpAccounts={smtpAccounts}
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
        recipientListId={recipientPreviewCampaign?.recipient_list_id || null}
        recipientListName={recipientPreviewCampaign ? getRecipientListName(recipientPreviewCampaign) : undefined}
      />

      <SendConfirmationModal
        isOpen={isSendConfirmationOpen}
        onClose={() => {
          setIsSendConfirmationOpen(false);
          setSendConfirmationCampaign(null);
        }}
        onConfirm={handleConfirmedSend}
        campaign={sendConfirmationCampaign}
        recipientListName={sendConfirmationCampaign ? getRecipientListName(sendConfirmationCampaign) : undefined}
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
