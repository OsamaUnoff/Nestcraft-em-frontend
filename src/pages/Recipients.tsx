import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  EyeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  CloudArrowUpIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import recipientService from '../services/recipientService.js';

const listSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().optional(),
});

const recipientSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  first_name: yup.string().optional(),
  last_name: yup.string().optional(),
  company: yup.string().optional(),
  phone: yup.string().optional(),
  status: yup.string().oneOf(['active', 'inactive', 'unsubscribed']).default('active'),
  custom_fields: yup.object().optional(),
});

const STATUS_ICONS = {
  active: CheckCircleIcon,
  inactive: XCircleIcon,
  unsubscribed: ExclamationTriangleIcon,
};

const Recipients = () => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [editingRecipient, setEditingRecipient] = useState<any>(null);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [viewMode, setViewMode] = useState('lists');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const isAnyModalOpen = isListModalOpen || isRecipientModalOpen || isUploadModalOpen;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isListModalOpen, isRecipientModalOpen, isUploadModalOpen]);

  const listForm = useForm({ resolver: yupResolver(listSchema) });
  const recipientForm = useForm({ resolver: yupResolver(recipientSchema) });

  // Enhanced queries with pagination and search
  const { data: listsData, isLoading: listsLoading } = useQuery({
    queryKey: ['recipient-lists', currentPage, searchTerm, filters],
    queryFn: () => recipientService.getLists({
      page: currentPage,
      search: searchTerm,
      status: filters.status,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    }),
    retry: 1,
  });

  const { data: recipientsData, isLoading: recipientsLoading } = useQuery({
    queryKey: ['recipients', selectedList?.id, currentPage, searchTerm, filters],
    queryFn: () => selectedList ? recipientService.getRecipients(selectedList.id, {
      page: currentPage,
      search: searchTerm,
      status: filters.status,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    }) : null,
    enabled: !!selectedList,
    retry: 1,
  });

  const listMutation = useMutation({
    mutationFn: (data: any) =>
      editingList ? recipientService.updateList(editingList.id, data) : recipientService.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipient-lists'] });
      toast.success(editingList ? 'List updated successfully' : 'List created successfully');
      handleCloseListModal();
    },
    onError: (error: any) => toast.error(error.error || 'Failed to save list'),
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: any) => recipientService.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipient-lists'] });
      toast.success('List deleted successfully');
      if (selectedList) {
        setSelectedList(null);
        setViewMode('lists');
      }
    },
    onError: (error: any) => toast.error(error.error || 'Failed to delete list'),
  });

  const recipientMutation = useMutation({
    mutationFn: (data: any) =>
      editingRecipient
        ? recipientService.updateRecipient(selectedList.id, editingRecipient.id, data)
        : recipientService.addRecipient(selectedList.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients', selectedList?.id] });
      toast.success(editingRecipient ? 'Recipient updated successfully' : 'Recipient added successfully');
      handleCloseRecipientModal();
    },
    onError: (error: any) => toast.error(error.error || 'Failed to save recipient'),
  });

  const deleteRecipientMutation = useMutation({
    mutationFn: (id: any) => recipientService.deleteRecipient(selectedList.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients', selectedList?.id] });
      toast.success('Recipient deleted successfully');
    },
    onError: (error: any) => toast.error(error.error || 'Failed to delete recipient'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => recipientService.uploadFile(selectedList.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients', selectedList?.id] });
      toast.success('File uploaded successfully');
      handleCloseUploadModal();
    },
    onError: (error: any) => toast.error(error.error || 'Failed to upload file'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (recipientIds: number[]) => recipientService.deleteMultipleRecipients(selectedList.id, recipientIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients', selectedList?.id] });
      setSelectedRecipients(new Set());
      toast.success('Selected recipients deleted successfully');
    },
    onError: (error: any) => toast.error(error.error || 'Failed to delete recipients'),
  });

  // Helper functions
  const getListStats = () => {
    console.log('🔍 Debug listsData:', listsData);
    console.log('🔍 Debug listsData type:', typeof listsData);
    console.log('🔍 Debug listsData?.data:', listsData?.data);
    
    let lists = [];
    try {
      if (Array.isArray(listsData?.data?.lists)) {
        lists = listsData.data.lists;
      } else if (Array.isArray(listsData)) {
        lists = listsData;
      } else if (listsData?.data && Array.isArray(listsData.data)) {
        lists = listsData.data;
      } else {
        lists = [];
      }
    } catch (error) {
      console.error('❌ Error processing listsData:', error);
      lists = [];
    }
    
    console.log('🔍 Debug final lists:', lists);
    console.log('🔍 Debug lists type:', typeof lists);
    console.log('🔍 Debug Array.isArray(lists):', Array.isArray(lists));
    
    return {
      total: lists.length,
      active: lists.filter((list: any) => list.status === 'active').length,
      totalRecipients: lists.reduce((sum: number, list: any) => sum + (list.total_recipients || 0), 0),
      activeRecipients: lists.reduce((sum: number, list: any) => sum + (list.active_recipients || 0), 0),
    };
  };

  const getRecipientStats = () => {
    let recipients = [];
    try {
      if (Array.isArray(recipientsData?.data?.recipients)) {
        recipients = recipientsData.data.recipients;
      } else if (Array.isArray(recipientsData)) {
        recipients = recipientsData;
      } else if (recipientsData?.data && Array.isArray(recipientsData.data)) {
        recipients = recipientsData.data;
      } else {
        recipients = [];
      }
    } catch (error) {
      console.error('❌ Error processing recipientsData:', error);
      recipients = [];
    }
    
    return {
      total: recipients.length,
      active: recipients.filter((r: any) => r.status === 'active').length,
      inactive: recipients.filter((r: any) => r.status === 'inactive').length,
      unsubscribed: recipients.filter((r: any) => r.status === 'unsubscribed').length,
    };
  };

  const lists = (() => {
    try {
      if (Array.isArray(listsData?.data?.lists)) {
        return listsData.data.lists;
      } else if (Array.isArray(listsData)) {
        return listsData;
      } else if (listsData?.data && Array.isArray(listsData.data)) {
        return listsData.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error processing listsData in main variable:', error);
      return [];
    }
  })();
  
  const recipients = (() => {
    try {
      if (Array.isArray(recipientsData?.data?.recipients)) {
        return recipientsData.data.recipients;
      } else if (Array.isArray(recipientsData)) {
        return recipientsData;
      } else if (recipientsData?.data && Array.isArray(recipientsData.data)) {
        return recipientsData.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error processing recipientsData in main variable:', error);
      return [];
    }
  })();
  
  const listStats = getListStats();
  const recipientStats = getRecipientStats();

  const handleOpenListModal = (list: any) => {
    if (list) {
      setEditingList(list);
      listForm.reset({ name: list.name, description: list.description || '' });
    } else {
      setEditingList(null);
      listForm.reset({ name: '', description: '' });
    }
    setIsListModalOpen(true);
  };

  const handleCloseListModal = () => {
    setIsListModalOpen(false);
    setEditingList(null);
    listForm.reset();
  };

  const handleOpenRecipientModal = (recipient: any) => {
    if (recipient) {
      setEditingRecipient(recipient);
      recipientForm.reset({
        email: recipient.email,
        first_name: recipient.first_name || '',
        last_name: recipient.last_name || '',
        company: recipient.company || '',
        phone: recipient.phone || '',
      });
    } else {
      setEditingRecipient(null);
      recipientForm.reset({ email: '', first_name: '', last_name: '', company: '', phone: '' });
    }
    setIsRecipientModalOpen(true);
  };

  const handleCloseRecipientModal = () => {
    setIsRecipientModalOpen(false);
    setEditingRecipient(null);
    recipientForm.reset();
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
    setUploadFile(null);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onListSubmit = async (data: any) => {
    listMutation.mutate(data);
  };

  const onRecipientSubmit = async (data: any) => {
    recipientMutation.mutate(data);
  };

  const handleFileUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const handleDeleteList = (id: any) => {
    if (window.confirm('Are you sure you want to delete this list? All recipients will be removed.')) {
      deleteListMutation.mutate(id);
    }
  };

  const handleDeleteRecipient = (id: any) => {
    if (window.confirm('Are you sure you want to delete this recipient?')) {
      deleteRecipientMutation.mutate(id);
    }
  };

  const handleViewList = (list: any) => {
    setSelectedList(list);
    setViewMode('recipients');
  };

  const handleBackToLists = () => {
    setSelectedList(null);
    setViewMode('lists');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const handleBulkAction = (action: string) => {
    if (selectedRecipients.size === 0) {
      toast.error('Please select at least one recipient to perform an action.');
      return;
    }

    if (!selectedList) {
      toast.error('Please select a list to perform bulk actions.');
      return;
    }

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedRecipients.size} selected recipients?`)) {
        bulkDeleteMutation.mutate(Array.from(selectedRecipients));
      }
    }
  };

  const handleSelectAllRecipients = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRecipients(new Set(recipients.map((r: any) => r.id)));
    } else {
      setSelectedRecipients(new Set());
    }
  };

  const handleSelectRecipient = (id: number) => {
    setSelectedRecipients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'lists' ? 'Recipient Lists' : `Recipients in "${(selectedList as any)?.name}"`}
          </h1>
          {viewMode === 'recipients' && (
            <button
              onClick={handleBackToLists}
              className="text-blue-600 hover:text-blue-700 text-sm mt-1 flex items-center transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back to Lists
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          {viewMode === 'lists' ? (
            <button
              onClick={() => handleOpenListModal(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create List
            </button>
          ) : (
            <>
              <button
                onClick={handleOpenUploadModal}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload File
              </button>
              <button
                onClick={() => handleOpenRecipientModal(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Recipient
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={viewMode === 'lists' ? 'Search lists...' : 'Search recipients...'}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-2">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleDateChange}
                  className="pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleDateChange}
                  className="pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {viewMode === 'lists' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Lists</p>
                <p className="text-2xl font-bold text-gray-900">{listStats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Lists</p>
                <p className="text-2xl font-bold text-gray-900">{listStats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{listStats.totalRecipients}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{listStats.activeRecipients}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'recipients' && selectedList && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{recipientStats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{recipientStats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{recipientStats.inactive}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Unsubscribed</p>
                <p className="text-2xl font-bold text-gray-900">{recipientStats.unsubscribed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'lists' ? (
        // Lists View
        <>
          {listsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : lists.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipient lists</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first recipient list.</p>
              <button
                onClick={() => handleOpenListModal(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create List
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {lists.map((list: any) => (
                <div
                  key={list.id}
                  className="bg-white rounded-lg border hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleViewList(list)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{list.name}</h3>
                        {list.description && (
                          <p className="text-gray-600 mt-1">{list.description}</p>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                          {list.total_recipients} recipients • Created {new Date(list.created_at).toLocaleDateString()}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 group-hover:bg-blue-200 group-hover:text-blue-900 transition-colors">
                            👁️ Click to view recipients
                          </span>
                          <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewList(list)}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50"
                          title="View Recipients"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenListModal(list)}
                          className="text-gray-600 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50"
                          title="Edit List"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
                          title="Delete List"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Recipients View
        <>
          {recipientsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recipients.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipients</h3>
              <p className="text-gray-600 mb-6">Add recipients manually or upload a CSV/XLSX file.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleOpenRecipientModal(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Recipient
                </button>
                <button
                  onClick={handleOpenUploadModal}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Upload File
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Bulk Actions */}
              {selectedRecipients.size > 0 && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedRecipients.size} recipient{selectedRecipients.size !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBulkAction('delete')}
                          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete Selected
                        </button>
                        <button
                          onClick={() => setSelectedRecipients(new Set())}
                          className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition-colors"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.size === recipients.length && recipients.length > 0}
                          onChange={handleSelectAllRecipients}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>Email</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4" />
                          <span>Name</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <BuildingOfficeIcon className="h-4 w-4" />
                          <span>Company</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <PhoneIcon className="h-4 w-4" />
                          <span>Phone</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <ChartBarIcon className="h-4 w-4" />
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>Added</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipients.map((recipient: any) => {
                      const StatusIcon = STATUS_ICONS[recipient.status as keyof typeof STATUS_ICONS] || XCircleIcon;
                      return (
                        <tr key={recipient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRecipients.has(recipient.id)}
                              onChange={() => handleSelectRecipient(recipient.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{recipient.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {[recipient.first_name, recipient.last_name].filter(Boolean).join(' ') || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{recipient.company || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{recipient.phone || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                recipient.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : recipient.status === 'inactive'
                                  ? 'bg-gray-100 text-gray-800'
                                  : recipient.status === 'unsubscribed'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {recipient.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(recipient.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenRecipientModal(recipient)}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                title="Edit Recipient"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecipient(recipient.id)}
                                className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title="Delete Recipient"
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
            </div>
          )}
        </>
      )}

      {/* List Modal */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={handleCloseListModal}></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[10000]">
              <form onSubmit={listForm.handleSubmit(onListSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingList ? 'Edit Recipient List' : 'Create Recipient List'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        {...listForm.register('name')}
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Newsletter Subscribers"
                      />
                      {listForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">{listForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        {...listForm.register('description')}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional description..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={listForm.formState.isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 sm:ml-3 sm:w-auto w-full"
                  >
                    {listForm.formState.isSubmitting ? 'Saving...' : editingList ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseListModal}
                    className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 sm:mt-0 sm:w-auto w-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Modal */}
      {isRecipientModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={handleCloseRecipientModal}></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[10000]">
              <form onSubmit={recipientForm.handleSubmit(onRecipientSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingRecipient ? 'Edit Recipient' : 'Add Recipient'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        {...recipientForm.register('email')}
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                      {recipientForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">{recipientForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          {...recipientForm.register('first_name')}
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          {...recipientForm.register('last_name')}
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <input
                        {...recipientForm.register('company')}
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Acme Corp"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        {...recipientForm.register('phone')}
                        type="tel"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={recipientForm.formState.isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 sm:ml-3 sm:w-auto w-full"
                  >
                    {recipientForm.formState.isSubmitting ? 'Saving...' : editingRecipient ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseRecipientModal}
                    className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 sm:mt-0 sm:w-auto w-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={handleCloseUploadModal}></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Upload Recipients</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Upload a CSV or Excel file with recipient information.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File (CSV, XLS, XLSX)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {uploadFile && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Expected Format:</h4>
                    <p className="text-xs text-blue-700">
                      CSV/Excel file with columns: email (required), first_name, last_name, company, phone
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploadMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 sm:ml-3 sm:w-auto w-full"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 sm:mt-0 sm:w-auto w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipients;
