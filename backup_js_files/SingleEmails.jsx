import React, { useState } from 'react';
import { PlusIcon, EnvelopeIcon, PaperAirplaneIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { SingleEmailCompose } from '../components/SingleEmailCompose';
import { SingleEmailsTable } from '../components/SingleEmailsTable';
import singleEmailService from '../services/singleEmailService';

const SingleEmails = () => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [viewingEmail, setViewingEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Fetch emails with pagination and filters
  const { data: emailsData, isLoading, refetch } = useQuery({
    queryKey: ['single-emails', currentPage, searchTerm, filters],
    queryFn: () =>
      singleEmailService.getSingleEmails({
        page: currentPage,
        per_page: 20,
        search: searchTerm || undefined,
        ...filters,
      }),
    keepPreviousData: true,
  });

  const emails = emailsData?.data?.emails || [];
  const pagination = emailsData?.data?.pagination || { page: 1, pages: 1, total: 0, has_next: false, has_prev: false };
  const stats = emailsData?.data?.stats || { total: 0, sent: 0, failed: 0, draft: 0, opened: 0, clicked: 0 };

  const handleCompose = () => {
    setEditingEmailId(null);
    setIsComposeOpen(true);
  };

  const handleEdit = (email) => {
    setEditingEmailId(email.id);
    setIsComposeOpen(true);
  };

  const handleView = (email) => {
    setViewingEmail(email);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Single Emails</h1>
              <p className="mt-2 text-gray-600">
                Send individual emails and track their performance
              </p>
            </div>
            <button
              onClick={handleCompose}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Compose Email
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Emails
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PaperAirplaneIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sent
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.sent}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Failed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.failed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Drafts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.draft}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 text-green-400">📖</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Open Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.open_rate?.toFixed(1) || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 text-blue-400">🔗</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Click Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.click_rate?.toFixed(1) || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emails Table */}
        <SingleEmailsTable
          emails={emails}
          pagination={pagination}
          onEdit={handleEdit}
          onView={handleView}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          isLoading={isLoading}
        />

        {/* Compose Modal */}
        <SingleEmailCompose
          isOpen={isComposeOpen}
          onClose={() => {
            setIsComposeOpen(false);
            setEditingEmailId(null);
          }}
          emailId={editingEmailId}
          onSuccess={handleSuccess}
        />

        {/* View Email Modal */}
        {viewingEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Email Details</h2>
                <button
                  onClick={() => setViewingEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">From</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingEmail.from_name} &lt;{viewingEmail.from_email}&gt;</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">To</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingEmail.recipient_name
                          ? `${viewingEmail.recipient_name} <${viewingEmail.recipient_email}>`
                          : viewingEmail.recipient_email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmail.subject}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingEmail.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : viewingEmail.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : viewingEmail.status === 'sending'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingEmail.status.charAt(0).toUpperCase() + viewingEmail.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingEmail.priority.charAt(0).toUpperCase() + viewingEmail.priority.slice(1)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(viewingEmail.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {viewingEmail.sent_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sent At</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(viewingEmail.sent_at).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="flex space-x-4">
                    {viewingEmail.has_opened && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📖 Opened
                      </span>
                    )}
                    {viewingEmail.has_clicked && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🔗 Clicked
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setViewingEmail(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  {viewingEmail.status === 'draft' && (
                    <button
                      onClick={() => {
                        setViewingEmail(null);
                        handleEdit(viewingEmail);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleEmails;
