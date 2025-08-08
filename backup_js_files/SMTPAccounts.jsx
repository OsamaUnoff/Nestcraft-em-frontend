import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  testConnection,
  setDefaultAccount,
  toggleAccountStatus,
  setSearchTerm,
  setFilterProvider,
  setShowActiveOnly,
  setCurrentPage,
  addDummyAccount,
} from '../store/slices/smtpSlice.js';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  WifiIcon,
  StarIcon,
  EnvelopeIcon,
  ServerIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
// import { smtpService } from '../services/smtpService'; // Now using Redux
import ReduxTest from '../components/ReduxTest.js';

// Provider settings (moved outside component to prevent re-creation)
const PROVIDER_SETTINGS = {
  gmail: {
    smtp_server: 'smtp.gmail.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
  },
  outlook: {
    smtp_server: 'smtp-mail.outlook.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
  },
  yahoo: {
    smtp_server: 'smtp.mail.yahoo.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
  },
  hostinger: {
    smtp_server: 'smtp.hostinger.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
  },
  custom: {
    smtp_server: '',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
  }
};

// Validation schema
const smtpSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  smtp_server: yup.string().required('SMTP server is required'),
  smtp_port: yup.number().required('Port is required').min(1, 'Port must be at least 1').max(65535, 'Port must be at most 65535'),
  provider: yup.string(),
  description: yup.string(),
  max_emails_per_hour: yup.number().min(1, 'Must be at least 1').max(10000, 'Must be at most 10000'),
  connection_timeout: yup.number().min(5, 'Must be at least 5 seconds').max(300, 'Must be at most 300 seconds'),
  use_tls: yup.boolean(),
  use_ssl: yup.boolean(),
  is_default: yup.boolean(),
  is_active: yup.boolean(),
});

const SMTPAccounts = () => {
  const dispatch = useAppDispatch();

  // Test if Redux store is working at all
  const fullState = useAppSelector((state) => state);
  const smtpState = useAppSelector((state) => state.smtp);

  // Early return for debugging
  if (!smtpState) {
    return <div>Error: SMTP state not found in Redux store</div>;
  }
  if (smtpState && typeof smtpState !== 'object') {
    return <div>Error: SMTP state is not an object</div>;
  }

  const {
    accounts,
    loading,
    error,
    currentPage,
    searchTerm,
    filterProvider,
    showActiveOnly,
    testingId,
    stats
  } = smtpState;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('custom');

  useEffect(() => {
    // Debug logs...
    return () => {};
  }, []);

  useEffect(() => {}, [isModalOpen, editingAccount, selectedProvider, showPassword]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {}, [isModalOpen, editingAccount, selectedProvider, showPassword]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(smtpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      smtp_server: '',
      smtp_port: 587,
      provider: 'custom',
      description: '',
      max_emails_per_hour: 100,
      connection_timeout: 30,
      use_tls: true,
      use_ssl: false,
      is_default: false,
      is_active: true,
    },
  });

  // Watch for TLS/SSL changes to prevent conflicts
  const useTls = watch('use_tls');
  const useSsl = watch('use_ssl');
  const watchedProvider = watch('provider');

  // Auto-fill provider settings
  useEffect(() => {
    if (selectedProvider && selectedProvider !== 'custom') {
      const settings = PROVIDER_SETTINGS[selectedProvider];
      if (settings) {
        setValue('smtp_server', settings.smtp_server);
        setValue('smtp_port', settings.smtp_port);
        setValue('use_tls', settings.use_tls);
        setValue('use_ssl', settings.use_ssl);
      }
    }
  }, [selectedProvider, setValue]);

  // Fetch accounts on component mount and when filters change
  useEffect(() => {
    dispatch(fetchAccounts({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      provider: filterProvider,
      active_only: showActiveOnly,
    }));
  }, [dispatch, currentPage, searchTerm, filterProvider, showActiveOnly]);

  // Auto-fill provider settings when provider changes
  useEffect(() => {
    if (watchedProvider && PROVIDER_SETTINGS[watchedProvider]) {
      const provider = PROVIDER_SETTINGS[watchedProvider];
      if (provider) {
        setValue('smtp_server', provider.smtp_server);
        setValue('smtp_port', provider.smtp_port);
        setValue('use_tls', provider.use_tls);
        setValue('use_ssl', provider.use_ssl);
      }
    }
  }, [watchedProvider, setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      if (editingAccount) {
        await dispatch(updateAccount({ id: editingAccount.id, data })).unwrap();
        toast.success('Account updated successfully');
      } else {
        await dispatch(createAccount(data)).unwrap();
        toast.success('Account created successfully');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save account');
    }
  };

  // Handle account deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this SMTP account?')) {
      try {
        await dispatch(deleteAccount(id)).unwrap();
        toast.success('Account deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete account');
      }
    }
  };

  // Handle connection test
  const handleTest = async (id) => {
    try {
      await dispatch(testConnection(id)).unwrap();
      toast.success('Connection test successful!');
    } catch (error) {
      toast.error(error.message || 'Connection test failed');
    }
  };

  // Handle set default
  const handleSetDefault = async (id) => {
    try {
      await dispatch(setDefaultAccount(id)).unwrap();
      toast.success('Default account updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to set default account');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleAccountStatus(id)).unwrap();
      toast.success('Account status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update account status');
    }
  };

  const handleOpenModal = (account) => {
    if (account) {
      setEditingAccount(account);
      const formData = {
        name: account.name,
        email: account.email,
        password: '',
        smtp_server: account.smtp_server,
        smtp_port: account.smtp_port,
        provider: account.provider || 'custom',
        description: account.description || '',
        max_emails_per_hour: account.max_emails_per_hour || 100,
        connection_timeout: account.connection_timeout || 30,
        use_tls: account.use_tls,
        use_ssl: account.use_ssl,
        is_default: account.is_default,
        is_active: account.is_active,
      };
      reset(formData);
      setSelectedProvider(account.provider || 'custom');
    } else {
      setEditingAccount(null);
      const defaultFormData = {
        name: '',
        email: '',
        password: '',
        smtp_server: '',
        smtp_port: 587,
        provider: 'custom',
        description: '',
        max_emails_per_hour: 100,
        connection_timeout: 30,
        use_tls: true,
        use_ssl: false,
        is_default: false,
        is_active: true,
      };
      reset(defaultFormData);
      setSelectedProvider('custom');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setSelectedProvider('custom');
    setShowPassword(false);
    reset();
  };

  // Extract accounts array from the API response structure
  const safeGetAccountsArray = () => {
    try {
      if (!accounts) return [];
      if (Array.isArray(accounts)) return accounts;
      if (accounts && typeof accounts === 'object') {
        if (accounts.data && Array.isArray(accounts.data.accounts)) {
          return accounts.data.accounts;
        }
        if (Array.isArray(accounts.accounts)) {
          return accounts.accounts;
        }
        if (accounts.length !== undefined) {
          return Array.from(accounts);
        }
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const accountsArray = safeGetAccountsArray();

  if (!Array.isArray(accountsArray)) {
    return <div>Error: Unable to process accounts data</div>;
  }

  const filteredAccounts = accountsArray.filter(account => {
    const matchesSearch = !searchTerm ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = !filterProvider || account.provider === filterProvider;
    const matchesActive = !showActiveOnly || account.is_active;
    return matchesSearch && matchesProvider && matchesActive;
  });

  return (
    <div>
      {/* Redux Test Component */}
      <ReduxTest />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMTP Accounts</h1>
          <p className="mt-2 text-gray-600">
            Manage your email server configurations
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {stats.totalAccounts} total • {stats.activeAccounts} active
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => dispatch(addDummyAccount())}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Demo Data
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary btn-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add SMTP Account
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Accounts
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Provider Filter */}
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              id="provider"
              value={filterProvider}
              onChange={(e) => dispatch(setFilterProvider(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Providers</option>
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="yahoo">Yahoo</option>
              <option value="hostinger">Hostinger</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Active Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => dispatch(setShowActiveOnly(e.target.checked))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAccounts.length} of {accountsArray.length} accounts
            </span>
            <div className="flex items-center space-x-4">
              <span>📧 {stats.totalEmailsSent.toLocaleString()} emails sent</span>
              <span>✅ {stats.successfulTests} successful tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Card-Based SMTP Accounts Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
            <CogIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No SMTP accounts configured</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started by adding your first SMTP account to begin sending emails through your platform.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First SMTP Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 overflow-hidden ${
                account.is_default
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : account.is_active
                    ? 'border-gray-200 hover:border-blue-300'
                    : 'border-gray-200 opacity-75'
              }`}
            >
              {/* Card Header */}
              <div className={`px-6 py-4 ${
                account.is_default
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50'
                  : account.is_active
                    ? 'bg-gray-50'
                    : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Status Indicator with Animation */}
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        account.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      {account.is_active && (
                        <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75"></div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{account.name}</h3>
                        {account.is_default && (
                          <StarIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" title="Default Account" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{account.email}</p>

                      {/* Last Test Status */}
                      {account.last_tested && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            account.last_test_result === 'success' ? 'bg-green-500' :
                            account.last_test_result === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-xs text-gray-500">
                            Last tested: {new Date(account.last_tested).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end space-y-1">
                    {account.is_default && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <StarIcon className="h-3 w-3 mr-1" />
                        Default
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.is_active
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>

                    {/* Provider Badge */}
                    {account.provider && account.provider !== 'custom' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 capitalize">
                        {account.provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4">
                {/* Connection Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Provider</span>
                    <span className="text-sm text-gray-900 capitalize font-medium">{account.provider || 'Custom'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Server</span>
                    <span className="text-sm text-gray-900 font-mono">{account.smtp_server}:{account.smtp_port}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Security</span>
                    <div className="flex items-center space-x-1">
                      {account.use_ssl && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          SSL
                        </span>
                      )}
                      {account.use_tls && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          TLS
                        </span>
                      )}
                      {!account.use_ssl && !account.use_tls && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          None
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{account.total_emails_sent || 0}</div>
                      <div className="text-xs text-gray-600">Total Sent</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        account.last_test_result === 'success' ? 'text-green-600' :
                        account.last_test_result === 'failed' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {account.last_test_result === 'success' ? '✓' :
                         account.last_test_result === 'failed' ? '✗' : '?'}
                      </div>
                      <div className="text-xs text-gray-600">Last Test</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Primary Action - Test Connection */}
                  <button
                    onClick={() => handleTest(account.id)}
                    disabled={testingId === account.id}
                    className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 ${
                      testingId === account.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200 hover:border-green-300'
                    }`}
                  >
                    {testingId === account.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    {/* Toggle Status Button */}
                    <button
                      onClick={() => handleToggleStatus(account.id)}
                      className={`inline-flex items-center justify-center p-2 border rounded-lg transition-all duration-200 ${
                        account.is_active
                          ? 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 hover:border-orange-400'
                          : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-400'
                      }`}
                      title={account.is_active ? 'Deactivate Account' : 'Activate Account'}
                    >
                      {account.is_active ? (
                        <XCircleIcon className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </button>

                    {/* Set Default Button */}
                    <button
                      onClick={() => handleSetDefault(account.id)}
                      disabled={account.is_default}
                      className={`inline-flex items-center justify-center p-2 border rounded-lg transition-all duration-200 ${
                        account.is_default
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                          : 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-400'
                      }`}
                      title={account.is_default ? 'Already Default' : 'Set as Default'}
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenModal(account)}
                      className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      title="Edit Account"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="inline-flex items-center justify-center p-2 border border-red-300 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200"
                      title="Delete Account"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer - Additional Info */}
              {(account.description || account.max_emails_per_hour) && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  {account.description && (
                    <p className="text-xs text-gray-600 mb-1 truncate" title={account.description}>
                      {account.description}
                    </p>
                  )}
                  {account.max_emails_per_hour && (
                    <p className="text-xs text-gray-500">
                      Limit: {account.max_emails_per_hour} emails/hour
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced SMTP Modal with Debug Logging */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            // Only close if clicking the outer container
            if (e.target === e.currentTarget) {
              console.log('🔒 Modal container clicked - closing modal');
              handleCloseModal();
            }
          }}
        >
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
            style={{ zIndex: 9998 }}
          ></div>

          {/* Modal container */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 relative z-[9999]">
            {/* Modal panel */}
            <div
              className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
              style={{ zIndex: 10000 }}
              onClick={(e) => {
                console.log('📋 Modal content clicked - preventing close');
                e.stopPropagation();
              }}
            >
              <form
                onSubmit={handleSubmit((data) => {
                  console.log('📤 Form submitted with data:', data);
                  onSubmit(data);
                })}
                className="w-full"
              >
                {/* Modal Header */}
                <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <EnvelopeIcon className="h-6 w-6 mr-2 text-blue-600" />
                      {editingAccount ? 'Edit SMTP Account' : 'Add New SMTP Account'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('❌ Close button clicked');
                        handleCloseModal();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Provider Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <ServerIcon className="h-4 w-4 mr-1 text-blue-600" />
                        Email Provider
                      </label>
                      <select
                        {...register('provider')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        value={selectedProvider}
                        onChange={(e) => {
                          console.log('🔄 Provider changed to:', e.target.value);
                          setSelectedProvider(e.target.value);
                          setValue('provider', e.target.value);
                        }}
                      >
                        <option value="custom">🔧 Custom SMTP Server</option>
                        <option value="gmail">📧 Gmail (Google)</option>
                        <option value="outlook">📨 Outlook/Hotmail (Microsoft)</option>
                        <option value="yahoo">📮 Yahoo Mail</option>
                        <option value="hostinger">🌐 Hostinger</option>
                      </select>
                      {errors.provider && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          {errors.provider.message}
                        </p>
                      )}
                    </div>

                    {/* Account Information Section */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1 text-blue-600" />
                        Account Information
                      </h4>

                      {/* Account Name */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Account Name *
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="e.g., My Gmail Account"
                          onChange={(e) => {
                            console.log('📝 Account name changed:', e.target.value);
                          }}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="your.email@example.com"
                          onChange={(e) => {
                            console.log('📧 Email changed:', e.target.value);
                          }}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-600" />
                          Password * {editingAccount && '(leave blank to keep current)'}
                        </label>
                        <div className="relative">
                          <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={editingAccount ? 'Leave blank to keep current password' : 'Your email password or app password'}
                            onChange={(e) => {
                              console.log('🔒 Password field changed (length):', e.target.value.length);
                            }}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => {
                              console.log('👁️ Password visibility toggled:', !showPassword);
                              setShowPassword(!showPassword);
                            }}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SMTP Server Configuration */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                        <ServerIcon className="h-4 w-4 mr-1 text-blue-600" />
                        SMTP Server Configuration
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SMTP Server */}
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            SMTP Server *
                          </label>
                          <input
                            {...register('smtp_server')}
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., smtp.gmail.com"
                            onChange={(e) => {
                              console.log('🌐 SMTP server changed:', e.target.value);
                            }}
                          />
                          {errors.smtp_server && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              {errors.smtp_server.message}
                            </p>
                          )}
                        </div>

                        {/* SMTP Port */}
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            Port *
                          </label>
                          <input
                            {...register('smtp_port', { valueAsNumber: true })}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="587"
                            min="1"
                            max="65535"
                            onChange={(e) => {
                              console.log('🔌 SMTP port changed:', e.target.value);
                            }}
                          />
                          {errors.smtp_port && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              {errors.smtp_port.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="bg-green-50 p-4 rounded-lg space-y-4">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                        <CogIcon className="h-4 w-4 mr-1 text-green-600" />
                        Additional Settings
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* From Name and Reply To fields removed - not in database model */}

                        {/* Max Emails Per Hour */}
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <ChartBarIcon className="h-4 w-4 mr-1 text-orange-600" />
                            Max Emails/Hour
                          </label>
                          <input
                            {...register('max_emails_per_hour', { valueAsNumber: true })}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder="100"
                            min="1"
                            max="10000"
                            onChange={(e) => {
                              console.log('📊 Max emails/hour changed:', e.target.value);
                            }}
                          />
                          {errors.max_emails_per_hour && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              {errors.max_emails_per_hour.message}
                            </p>
                          )}
                        </div>

                        {/* Connection Timeout */}
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <ClockIcon className="h-4 w-4 mr-1 text-purple-600" />
                            Timeout (seconds)
                          </label>
                          <input
                            {...register('connection_timeout', { valueAsNumber: true })}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder="30"
                            min="5"
                            max="300"
                            onChange={(e) => {
                              console.log('⏱️ Connection timeout changed:', e.target.value);
                            }}
                          />
                          {errors.connection_timeout && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              {errors.connection_timeout.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Description (Optional)
                        </label>
                        <textarea
                          {...register('description')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                          rows={3}
                          placeholder="Account description or notes..."
                          onChange={(e) => {
                            console.log('📝 Description changed (length):', e.target.value.length);
                          }}
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Security & Status Options */}
                    <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-1 text-purple-600" />
                        Security & Status
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              {...register('use_tls')}
                              type="checkbox"
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                              onChange={(e) => {
                                console.log('🔐 TLS changed:', e.target.checked);
                              }}
                            />
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <WifiIcon className="h-4 w-4 mr-1 text-blue-600" />
                              Use TLS Encryption
                            </label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              {...register('use_ssl')}
                              type="checkbox"
                              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                              onChange={(e) => {
                                console.log('🔒 SSL changed:', e.target.checked);
                              }}
                            />
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-600" />
                              Use SSL Encryption
                            </label>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              {...register('is_default')}
                              type="checkbox"
                              className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded transition-colors"
                              onChange={(e) => {
                                console.log('⭐ Default account changed:', e.target.checked);
                              }}
                            />
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <StarIcon className="h-4 w-4 mr-1 text-yellow-600" />
                              Set as default account
                            </label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              {...register('is_active')}
                              type="checkbox"
                              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                              onChange={(e) => {
                                console.log('✅ Active status changed:', e.target.checked);
                              }}
                            />
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <CheckCircleIcon className="h-4 w-4 mr-1 text-green-600" />
                              Account is active
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('❌ Cancel button clicked');
                      handleCloseModal();
                    }}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                      console.log('💾 Submit button clicked, isSubmitting:', isSubmitting);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingAccount ? (
                          <>
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Update Account
                          </>
                        ) : (
                          <>
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create Account
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SMTPAccounts;
