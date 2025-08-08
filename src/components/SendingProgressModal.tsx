import { useState, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import campaignService from '../services/campaignService';

interface SendingProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number | null;
}

export const SendingProgressModal: React.FC<SendingProgressModalProps> = ({
  isOpen,
  onClose,
  campaignId
}) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(null);

  // Poll campaign status every 2 seconds while sending
  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignId ? campaignService.getCampaign(campaignId) : null,
    enabled: isOpen && !!campaignId,
    refetchInterval: (data) => {
      // Stop polling if campaign is no longer sending
      if ((data as any)?.status === 'sent' || (data as any)?.status === 'failed' || (data as any)?.status === 'draft') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Timer for elapsed time
  useEffect(() => {
    if (!isOpen || !campaign) return;

    // Set start time when modal opens and campaign is sending
    if ((campaign as any).status === 'sending' && !startTime) {
      setStartTime(new Date());
    }

    const timer = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);

        // Calculate estimated time left based on sending rate
        if ((campaign as any).sent_count > 0 && (campaign as any).recipient_count > (campaign as any).sent_count) {
          const sendingRate = (campaign as any).sent_count / elapsed; // emails per second
          const remaining = (campaign as any).recipient_count - (campaign as any).sent_count;
          const estimatedSeconds = Math.ceil(remaining / sendingRate);
          setEstimatedTimeLeft(estimatedSeconds);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, campaign, startTime]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStartTime(null);
      setElapsedTime(0);
      setEstimatedTimeLeft(null);
    }
  }, [isOpen]);

  if (!isOpen || !campaign) return null;

  const progress = (campaign as any).recipient_count > 0 
    ? ((campaign as any).sent_count / (campaign as any).recipient_count) * 100 
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch ((campaign as any).status) {
      case 'sending':
        return <PaperAirplaneIcon className="h-6 w-6 text-blue-600 animate-pulse" />;
      case 'sent':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch ((campaign as any).status) {
      case 'sending':
        return 'Sending emails...';
      case 'sent':
        return 'All emails sent successfully';
      case 'failed':
        return 'Sending failed';
      default:
        return 'Preparing to send...';
    }
  };

  const getStatusColor = () => {
    switch ((campaign as any).status) {
      case 'sending':
        return 'text-blue-600';
      case 'sent':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Campaign Sending Progress
              </h2>
              <p className="text-sm text-gray-600">
                {(campaign as any).name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Content */}
        <div className="p-6">
          {/* Status */}
          <div className="text-center mb-6">
            <p className={`text-lg font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{(campaign as any).sent_count} of {(campaign as any).recipient_count} sent</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold text-blue-600">{progress.toFixed(1)}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{(campaign as any).sent_count}</div>
              <div className="text-sm text-gray-600">Sent</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{(campaign as any).failed_count}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{formatTime(elapsedTime)}</div>
              <div className="text-sm text-gray-600">Elapsed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {estimatedTimeLeft ? formatTime(estimatedTimeLeft) : '--:--'}
              </div>
              <div className="text-sm text-gray-600">Est. Left</div>
            </div>
          </div>

          {/* Sending Rate */}
          {(campaign as any).status === 'sending' && elapsedTime > 0 && (
            <div className="text-center text-sm text-gray-600 mb-4">
              Sending rate: {(((campaign as any).sent_count / elapsedTime) * 60).toFixed(1)} emails/minute
            </div>
          )}

          {/* Completion Message */}
          {(campaign as any).status === 'sent' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">Campaign sent successfully!</p>
                  <p className="text-green-700 text-sm">
                    All {(campaign as any).recipient_count} emails have been delivered.
                    {(campaign as any).sent_at && ` Completed at ${new Date((campaign as any).sent_at).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(campaign as any).status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">Campaign sending failed</p>
                  <p className="text-red-700 text-sm">
                    {(campaign as any).sent_count} of {(campaign as any).recipient_count} emails were sent before the error occurred.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {(campaign as any).status === 'sending' ? 'Close (Keep Sending)' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
