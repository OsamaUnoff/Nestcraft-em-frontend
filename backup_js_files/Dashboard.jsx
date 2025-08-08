import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { fetchCampaigns, selectCampaigns, selectCampaignLoading } from '../store/slices/campaignSlice';
import { fetchSMTPAccounts, selectSMTPAccounts } from '../store/slices/smtpSlice';
import { fetchRecipientLists, selectRecipientLists } from '../store/slices/recipientSlice';
import { selectUser } from '../store/slices/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const campaigns = useSelector(selectCampaigns);
  const smtpAccounts = useSelector(selectSMTPAccounts);
  const recipientLists = useSelector(selectRecipientLists);
  const isLoading = useSelector(selectCampaignLoading);

  useEffect(() => {
    dispatch(fetchCampaigns({ page: 1, per_page: 10 }));
    dispatch(fetchSMTPAccounts());
    dispatch(fetchRecipientLists({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const getCampaignsArray = () => {
    if (Array.isArray(campaigns)) return campaigns;
    if (campaigns?.data && Array.isArray(campaigns.data)) return campaigns.data;
    return [];
  };

  const getSMTPAccountsArray = () => {
    if (Array.isArray(smtpAccounts)) return smtpAccounts;
    if (smtpAccounts?.data?.accounts && Array.isArray(smtpAccounts.data.accounts)) return smtpAccounts.data.accounts;
    if (smtpAccounts?.accounts && Array.isArray(smtpAccounts.accounts)) return smtpAccounts.accounts;
    return [];
  };

  const getRecipientListsArray = () => {
    if (Array.isArray(recipientLists)) return recipientLists;
    if (recipientLists?.data && Array.isArray(recipientLists.data)) return recipientLists.data;
    return [];
  };

  const campaignsArray = getCampaignsArray();
  const smtpAccountsArray = getSMTPAccountsArray();
  const recipientListsArray = getRecipientListsArray();

  const totalRecipients = recipientListsArray.reduce((sum, list) => sum + (list.recipient_count || 0), 0);
  const activeCampaigns = campaignsArray.filter(campaign => campaign.status === 'active').length;
  const activeSMTPAccounts = smtpAccountsArray.filter(account => account.is_active).length;

  const stats = [
    {
      name: 'Total Campaigns',
      value: campaignsArray.length.toString(),
      icon: EnvelopeIcon,
      change: activeCampaigns > 0 ? `${activeCampaigns} active` : 'No active campaigns',
      changeType: activeCampaigns > 0 ? 'positive' : 'neutral'
    },
    {
      name: 'Total Recipients',
      value: totalRecipients.toLocaleString(),
      icon: UsersIcon,
      change: recipientListsArray.length > 0 ? `${recipientListsArray.length} lists` : 'No lists',
      changeType: recipientListsArray.length > 0 ? 'positive' : 'neutral'
    },
    {
      name: 'SMTP Accounts',
      value: smtpAccountsArray.length.toString(),
      icon: CogIcon,
      change: activeSMTPAccounts < smtpAccountsArray.length ? 'Some inactive' : 'All active',
      changeType: activeSMTPAccounts < smtpAccountsArray.length ? 'warning' : 'positive'
    },
    {
      name: 'System Status',
      value: 'Online',
      icon: ChartBarIcon,
      change: 'All systems operational',
      changeType: 'positive'
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.username || 'User'}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your email marketing campaigns today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
            <Link to="/campaigns" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {campaignsArray.length > 0 ? (
              campaignsArray.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-500">
                      {campaign.recipient_count || 0} recipients
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'sending'
                          ? 'bg-blue-100 text-blue-800'
                          : campaign.status === 'active'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No campaigns yet</p>
                <Link
                  to="/campaigns/new"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Create your first campaign
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/campaigns/new" className="btn-primary btn-md w-full block text-center">
              Create New Campaign
            </Link>
            <Link to="/smtp-accounts/new" className="btn-outline btn-md w-full block text-center">
              Add SMTP Account
            </Link>
            <Link to="/recipients/import" className="btn-outline btn-md w-full block text-center">
              Import Recipients
            </Link>
            <Link to="/analytics" className="btn-outline btn-md w-full block text-center">
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
