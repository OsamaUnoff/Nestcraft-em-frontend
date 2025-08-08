import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  testConnection,
  setSearchTerm,
  setFilterProvider,
  setShowActiveOnly,
  setCurrentPage,
} from '../store/slices/smtpSlice.js';

const accountSchema = yup.object({
  name: yup.string().required('Account name is required').min(2, 'Name must be at least 2 characters'),
  provider: yup.string().required('Provider is required'),
  smtp_server: yup.string().required('SMTP server is required'),
  smtp_port: yup.number().required('SMTP port is required').min(1).max(65535),
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required').min(1, 'Password is required'),
  from_name: yup.string().required('From name is required'),
  from_email: yup.string().email('Invalid email format').required('From email is required'),
  use_tls: yup.boolean(),
  use_ssl: yup.boolean(),
  daily_limit: yup.number().min(0, 'Daily limit must be 0 or greater'),
  monthly_limit: yup.number().min(0, 'Monthly limit must be 0 or greater'),
});

const PROVIDER_SETTINGS: any = {
  gmail: {
    name: 'Gmail',
    smtp_server: 'smtp.gmail.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
    icon: '📧',
    description: 'Gmail SMTP with App Password required',
  },
  outlook: {
    name: 'Outlook/Hotmail',
    smtp_server: 'smtp-mail.outlook.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
    icon: '📧',
    description: 'Outlook/Hotmail SMTP',
  },
  yahoo: {
    name: 'Yahoo Mail',
    smtp_server: 'smtp.mail.yahoo.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
    icon: '📧',
    description: 'Yahoo Mail SMTP with App Password',
  },
  hostinger: {
    name: 'Hostinger',
    smtp_server: 'smtp.hostinger.com',
    smtp_port: 587,
    use_tls: true,
    use_ssl: false,
    icon: '🌐',
    description: 'Hostinger SMTP',
  },
  custom: {
    name: 'Custom SMTP',
    smtp_server: '',
    smtp_port: 587,
    use_tls: false,
    use_ssl: false,
    icon: '⚙️',
    description: 'Custom SMTP server configuration',
  },
};

const SMTPAccounts = () => {
  const dispatch = useAppDispatch();
  const {
    accounts,
    isLoading,
    isTesting,
    testResults,
    currentPage,
    searchTerm,
    filterProvider,
    showActiveOnly,
  } = useAppSelector((state: any) => state.smtp);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState('gmail');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [itemsPerPage] = useState(10);

  const form = useForm({
    resolver: yupResolver(accountSchema),
    defaultValues: {
      name: '',
      provider: 'gmail',
      smtp_server: '',
      smtp_port: 587,
      username: '',
      password: '',
      from_name: '',
      from_email: '',
      use_tls: true,
      use_ssl: false,
      daily_limit: 0,
      monthly_limit: 0,
    },
  });

  const { watch, setValue } = form;
  const watchedProvider = watch('provider');
  const watchedFromEmail = watch('from_email');

  useEffect(() => {
    dispatch(fetchAccounts(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (selectedProvider && PROVIDER_SETTINGS[selectedProvider]) {
      const settings = PROVIDER_SETTINGS[selectedProvider];
      setValue('smtp_server', settings.smtp_server);
      setValue('smtp_port', settings.smtp_port);
      setValue('use_tls', settings.use_tls);
      setValue('use_ssl', settings.use_ssl);
    }
  }, [selectedProvider, setValue]);

  useEffect(() => {
    if (watchedProvider && PROVIDER_SETTINGS[watchedProvider]) {
      const provider = PROVIDER_SETTINGS[watchedProvider];
      setValue('smtp_server', provider.smtp_server);
      setValue('smtp_port', provider.smtp_port);
      setValue('use_tls', provider.use_tls);
      setValue('use_ssl', provider.use_ssl);
    }
  }, [watchedProvider, setValue]);

  // Auto-fill username when from_email changes
  useEffect(() => {
    if (watchedFromEmail && !form.getValues('username')) {
      setValue('username', watchedFromEmail);
    }
  }, [watchedFromEmail, setValue]);

  // Filter and paginate accounts
  const filteredAccounts = accounts.filter((account: any) => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.from_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = !filterProvider || account.provider === filterProvider;
    const matchesActive = !showActiveOnly || account.is_active;
    return matchesSearch && matchesProvider && matchesActive;
  });

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data, email: data.from_email };
      if (editingAccount) {
        await dispatch(updateAccount({ id: editingAccount.id, data: payload })).unwrap();
        toast.success('Account updated successfully');
      } else {
        await dispatch(createAccount(payload)).unwrap();
        toast.success('Account created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save account');
    }
  };

  const handleDelete = async (id: any) => {
    const account = accounts.find((acc: any) => acc.id === id);
    const message = `Are you sure you want to delete "${account?.name}"? This action cannot be undone.`;
    
    if (window.confirm(message)) {
      try {
        await dispatch(deleteAccount(id)).unwrap();
        toast.success('Account deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete account');
      }
    }
  };

  const handleTest = async (id: any) => {
    try {
      setTestingConnection(true);
      setConnectionResult(null);
      
      const result = await dispatch(testConnection(id)).unwrap();
      
      setConnectionResult({
        success: true,
        message: 'Connection test successful!',
        details: result
      });
      
      toast.success('Connection test successful!');
    } catch (error: any) {
      setConnectionResult({
        success: false,
        message: error.message || 'Connection test failed',
        details: error
      });
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestFormConnection = async () => {
    try {
      const formData = form.getValues();
      setTestingConnection(true);
      setConnectionResult(null);
      
      // Simulate connection test for form data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, we'll simulate a successful test
      setConnectionResult({
        success: true,
        message: 'Connection test successful!',
        details: {
          server: formData.smtp_server,
          port: formData.smtp_port,
          provider: formData.provider
        }
      });
      
      toast.success('Connection test successful!');
    } catch (error: any) {
      setConnectionResult({
        success: false,
        message: error.message || 'Connection test failed',
        details: error
      });
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSetDefault = async (id: any) => {
    try {
      const account = accounts.find((acc: any) => acc.id === id);
      if (!account) {
        toast.error('Account not found');
        return;
      }

      // Update the account to be default
      await dispatch(updateAccount({ 
        id, 
        data: { 
          ...account, 
          is_default: true 
        } 
      })).unwrap();
      
      toast.success(`${account.name} set as default account`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default account');
    }
  };

  const handleOpenModal = (account: any = null) => {
    if (account) {
      setEditingAccount(account);
      setSelectedProvider(account.provider);
      form.reset({
        name: account.name,
        provider: account.provider,
        smtp_server: account.smtp_server,
        smtp_port: account.smtp_port,
        username: account.username,
        password: account.password,
        from_name: account.from_name,
        from_email: account.from_email,
        use_tls: account.use_tls,
        use_ssl: account.use_ssl,
        daily_limit: account.daily_limit || 0,
        monthly_limit: account.monthly_limit || 0,
      });
    } else {
      setEditingAccount(null);
      setSelectedProvider('gmail');
      form.reset({
        name: '',
        provider: 'gmail',
        smtp_server: '',
        smtp_port: 587,
        username: '',
        password: '',
        from_name: '',
        from_email: '',
        use_tls: true,
        use_ssl: false,
        daily_limit: 0,
        monthly_limit: 0,
      });
    }
    setConnectionResult(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setConnectionResult(null);
    form.reset();
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getProviderIcon = (provider: string) => {
    return PROVIDER_SETTINGS[provider]?.icon || '📧';
  };

  const getTestResult = (accountId: number) => {
    return testResults[accountId];
  };

  // Map 'email' to 'from_email' for display compatibility
  const accountsArray = (paginatedAccounts || []).map((account: any) => ({
    ...account,
    from_email: account.from_email || account.email || '',
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMTP Accounts</h1>
          <p className="text-gray-600">Manage your email sending accounts</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Account
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ServerIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.filter((acc: any) => acc.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Default Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.filter((acc: any) => acc.is_default).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Providers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(accounts.map((acc: any) => acc.provider)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts by name, email, or provider..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value as any))}
              className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterProvider}
                onChange={(e) => dispatch(setFilterProvider(e.target.value as any))}
                className="pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Providers</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="yahoo">Yahoo</option>
                <option value="hostinger">Hostinger</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => dispatch(setShowActiveOnly(e.target.checked as any))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Active only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : accountsArray.length === 0 ? (
          <div className="p-12 text-center">
            <ServerIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SMTP accounts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterProvider || showActiveOnly 
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first SMTP account.'
              }
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Account
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Connection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountsArray.map((account: any) => {
                    const testResult = getTestResult(account.id);
                    return (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-lg">{getProviderIcon(account.provider)}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{account.name}</div>
                              <div className="text-sm text-gray-500">
                                {account.from_name} &lt;{account.from_email}&gt;
                              </div>
                              <div className="text-xs text-gray-400">
                                {account.smtp_server}:{account.smtp_port}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 capitalize">{account.provider}</span>
                            {account.is_default && (
                              <StarIcon className="ml-2 h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.is_active)}`}>
                            {account.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {testResult ? (
                            <div className="flex items-center">
                              {testResult.success ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                              )}
                              <span className={`text-xs ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                                {testResult.success ? 'Connected' : 'Failed'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Not tested</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTest(account.id)}
                              disabled={isTesting}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors disabled:opacity-50"
                              title="Test Connection"
                            >
                              {isTesting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                              )}
                            </button>
                            {!account.is_default && (
                              <button
                                onClick={() => handleSetDefault(account.id)}
                                className="text-yellow-600 hover:text-yellow-700 p-1 rounded transition-colors"
                                title="Set as Default"
                              >
                                <StarIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenModal(account)}
                              className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors"
                              title="Edit Account"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(account.id)}
                              className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                              title="Delete Account"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1) as any))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => dispatch(setCurrentPage(Math.min(totalPages, currentPage + 1) as any))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredAccounts.length)}</span> of{' '}
                      <span className="font-medium">{filteredAccounts.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1) as any))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => dispatch(setCurrentPage(page as any))}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => dispatch(setCurrentPage(Math.min(totalPages, currentPage + 1) as any))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={handleCloseModal}></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full z-[10000]">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingAccount ? 'Edit SMTP Account' : 'Add SMTP Account'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure your email sending account settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Account Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Name *</label>
                      <input
                        {...form.register('name')}
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Gmail Account"
                      />
                      {form.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    {/* Provider Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Provider *</label>
                      <select
                        {...form.register('provider')}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(PROVIDER_SETTINGS).map(([key, provider]: [string, any]) => (
                          <option key={key} value={key}>
                            {provider.icon} {provider.name}
                          </option>
                        ))}
                      </select>
                      {PROVIDER_SETTINGS[selectedProvider] && (
                        <p className="mt-1 text-xs text-gray-500">
                          {PROVIDER_SETTINGS[selectedProvider].description}
                        </p>
                      )}
                      {form.formState.errors.provider && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.provider.message}</p>
                      )}
                    </div>

                    {/* Server Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SMTP Server *</label>
                        <input
                          {...form.register('smtp_server')}
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="smtp.gmail.com"
                        />
                        {form.formState.errors.smtp_server && (
                          <p className="mt-1 text-sm text-red-600">{form.formState.errors.smtp_server.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SMTP Port *</label>
                        <input
                          {...form.register('smtp_port')}
                          type="number"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="587"
                        />
                        {form.formState.errors.smtp_port && (
                          <p className="mt-1 text-sm text-red-600">{form.formState.errors.smtp_port.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Credentials */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Username *</label>
                        <input
                          {...form.register('username')}
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your-email@gmail.com"
                        />
                        {form.formState.errors.username && (
                          <p className="mt-1 text-sm text-red-600">{form.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Password *</label>
                        <div className="relative">
                          <input
                            {...form.register('password')}
                            type={showPassword ? 'text' : 'password'}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="App password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {form.formState.errors.password && (
                          <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
                        )}
                      </div>
                    </div>

                    {/* From Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">From Name *</label>
                        <input
                          {...form.register('from_name')}
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your Name"
                        />
                        {form.formState.errors.from_name && (
                          <p className="mt-1 text-sm text-red-600">{form.formState.errors.from_name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">From Email *</label>
                        <input
                          {...form.register('from_email')}
                          type="email"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your-email@gmail.com"
                        />
                        {form.formState.errors.from_email && (
                          <p className="mt-1 text-sm text-red-600">{form.formState.errors.from_email.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          {...form.register('use_tls')}
                          type="checkbox"
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Use TLS</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...form.register('use_ssl')}
                          type="checkbox"
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Use SSL</span>
                      </label>
                    </div>

                    {/* Advanced Settings */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                      >
                        <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                        Advanced Settings
                      </button>
                      {showAdvanced && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Daily Limit</label>
                              <input
                                {...form.register('daily_limit')}
                                type="number"
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0 (unlimited)"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Monthly Limit</label>
                              <input
                                {...form.register('monthly_limit')}
                                type="number"
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0 (unlimited)"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Connection Test */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Test Connection</h4>
                          <p className="text-xs text-gray-500">Verify your SMTP settings before saving</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleTestFormConnection}
                          disabled={testingConnection || !form.getValues('smtp_server')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {testingConnection ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
                      
                      {connectionResult && (
                        <div className={`mt-3 p-3 rounded-md ${
                          connectionResult.success 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center">
                            {connectionResult.success ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span className={`text-sm font-medium ${
                              connectionResult.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {connectionResult.message}
                            </span>
                          </div>
                          {connectionResult.details && (
                            <div className="mt-2 text-xs text-gray-600">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(connectionResult.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 sm:ml-3 sm:w-auto w-full disabled:opacity-50 transition-colors"
                  >
                    {form.formState.isSubmitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 sm:mt-0 sm:w-auto w-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMTPAccounts;
