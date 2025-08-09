import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { fetchCampaigns } from '../store/slices/campaignSlice.js';
import { fetchSMTPAccounts } from '../store/slices/smtpSlice.js';
import { fetchRecipientLists } from '../store/slices/recipientSlice.js';
import {
  EnvelopeIcon,
  UsersIcon,
  ServerIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { campaigns } = useAppSelector((state: any) => state.campaigns);
  const { accounts: smtpAccounts } = useAppSelector((state: any) => state.smtp);
  const { lists: recipientLists } = useAppSelector((state: any) => state.recipients);

  useEffect(() => {
    dispatch(fetchCampaigns({ page: 1, per_page: 10 }));
    dispatch(fetchSMTPAccounts());
    dispatch(fetchRecipientLists({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const campaignsArray = Array.isArray(campaigns) ? campaigns : Array.isArray(campaigns?.data) ? campaigns.data : [];
  const smtpAccountsArray = Array.isArray(smtpAccounts) ? smtpAccounts : Array.isArray((smtpAccounts as any)?.data) ? (smtpAccounts as any).data : [];
  const recipientListsArray = Array.isArray(recipientLists) ? recipientLists : Array.isArray((recipientLists as any)?.data) ? (recipientLists as any).data : [];

  const totalRecipients = recipientListsArray.reduce((sum: number, list: any) => {
    const count = list.recipient_count ?? list.total_recipients ?? list.active_recipients ?? 0;
    return sum + Number(count || 0);
  }, 0);
  const activeCampaigns = campaignsArray.filter((campaign: any) => ['scheduled', 'sending'].includes(campaign.status)).length;
  const activeSMTPAccounts = smtpAccountsArray.filter((account: any) => account.is_active).length;

  const recentCampaigns = campaignsArray.slice(0, 5);
  const recentLists = recipientListsArray.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your email marketing dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">{campaignsArray.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Recipients</p>
              <p className="text-2xl font-semibold text-gray-900">{totalRecipients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ServerIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">SMTP Accounts</p>
              <p className="text-2xl font-semibold text-gray-900">{activeSMTPAccounts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">{activeCampaigns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
          </div>
          <div className="p-6">
            {recentCampaigns.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No campaigns yet</p>
            ) : (
              <div className="space-y-4">
                {recentCampaigns.map((campaign: any) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-500">{campaign.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {(() => {
                        const status = campaign.status as string;
                        const statusClass =
                          status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                          status === 'sent' || status === 'completed' ? 'bg-green-100 text-green-800' :
                          status === 'paused' ? 'bg-orange-100 text-orange-800' :
                          status === 'cancelled' || status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800';
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                            {status}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Recipient Lists */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Recipient Lists</h3>
          </div>
          <div className="p-6">
            {recentLists.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recipient lists yet</p>
            ) : (
              <div className="space-y-4">
                {recentLists.map((list: any) => (
                  <div key={list.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UsersIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{list.name}</p>
                        <p className="text-sm text-gray-500">{list.recipient_count || 0} recipients</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(list.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/campaigns/create'}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            Create Campaign
          </button>
          <button
            onClick={() => window.location.href = '/recipients'}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Recipients
          </button>
          <button
            onClick={() => window.location.href = '/smtp-accounts'}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <ServerIcon className="h-5 w-5 mr-2" />
            SMTP Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
