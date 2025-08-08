import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckIcon,
  EnvelopeIcon,
  UsersIcon,
  CogIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { createCampaign, selectCampaignLoading, selectCampaignError } from '../store/slices/campaignSlice.js';
import { fetchSMTPAccounts, selectSMTPAccounts } from '../store/slices/smtpSlice.js';
import { fetchRecipientLists, selectRecipientLists } from '../store/slices/recipientSlice.js';
import { fetchTemplates, selectTemplates } from '../store/slices/templateSlice.js';
import toast from 'react-hot-toast';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  const isLoading = useSelector(selectCampaignLoading);
  const error = useSelector(selectCampaignError);
  const smtpAccounts = useSelector(selectSMTPAccounts);
  const recipientLists = useSelector(selectRecipientLists);
  const templates = useSelector(selectTemplates);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      schedule_type: 'immediate',
      is_active: true,
      recipient_list_ids: []
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    dispatch(fetchSMTPAccounts());
    dispatch(fetchRecipientLists());
    dispatch(fetchTemplates());
  }, [dispatch]);

  const steps = [
    { id: 1, name: 'Basic Info', icon: EnvelopeIcon },
    { id: 2, name: 'Recipients', icon: UsersIcon },
    { id: 3, name: 'Content', icon: CogIcon },
    { id: 4, name: 'Review', icon: EyeIcon }
  ];

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(createCampaign(data));
      if (createCampaign.fulfilled.match(result)) {
        toast.success('Campaign created successfully!');
        navigate('/campaigns');
      }
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setValue('template_id', templateId);
      setValue('content', template.content);
      setValue('subject', template.subject || watchedValues.subject);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Campaign name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter campaign name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line *
              </label>
              <input
                type="text"
                {...register('subject', { required: 'Subject line is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name *
                </label>
                <input
                  type="text"
                  {...register('from_name', { required: 'From name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                />
                {errors.from_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.from_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email *
                </label>
                <input
                  type="email"
                  {...register('from_email', { 
                    required: 'From email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
                {errors.from_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.from_email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Account *
              </label>
              <select
                {...register('smtp_account_id', { required: 'SMTP account is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select SMTP Account</option>
                {smtpAccounts.filter(account => account.is_active).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.email})
                  </option>
                ))}
              </select>
              {errors.smtp_account_id && (
                <p className="mt-1 text-sm text-red-600">{errors.smtp_account_id.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Recipient Lists *
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recipientLists.map((list) => (
                  <label key={list.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      value={list.id}
                      {...register('recipient_list_ids', { required: 'At least one recipient list is required' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{list.name}</p>
                        <span className="text-sm text-gray-500">
                          {list.recipient_count || 0} recipients
                        </span>
                      </div>
                      {list.description && (
                        <p className="text-sm text-gray-500">{list.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {errors.recipient_list_ids && (
                <p className="mt-1 text-sm text-red-600">{errors.recipient_list_ids.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose Template (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {templates.slice(0, 6).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      watchedValues.template_id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content *
              </label>
              <textarea
                {...register('content', { required: 'Email content is required' })}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email content here..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Summary</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Campaign Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{watchedValues.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Subject Line</dt>
                  <dd className="mt-1 text-sm text-gray-900">{watchedValues.subject}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">From</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watchedValues.from_name} &lt;{watchedValues.from_email}&gt;
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Recipients</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watchedValues.recipient_list_ids?.length || 0} lists selected
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Schedule Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="immediate"
                    {...register('schedule_type')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Send immediately</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="scheduled"
                    {...register('schedule_type')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Schedule for later</span>
                </label>
              </div>
              
              {watchedValues.schedule_type === 'scheduled' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    {...register('scheduled_at')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Campaigns
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="mt-2 text-gray-600">Set up your email marketing campaign</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep > step.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : currentStep === step.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {stepIdx !== steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ml-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep === steps.length ? (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Campaign'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
