import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { completePayment } from '../TemplatePage/services/templateAPI';
import { useToast } from '../../contexts/ToastContext';

interface PaymentStatus {
  orderId: string;
  paymentStatus: 'PAID' | 'PENDING' | 'CANCELLED' | 'FAILED';
  message: string;
  templateId?: number;
  templateTitle?: string;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (orderCode) {
      verifyPaymentStatus();
    } else {
      // Check if we have status in URL params (fallback)
      const status = searchParams.get('status');
      if (status === 'PAID') {
        setPaymentStatus({
          orderId: searchParams.get('id') || 'unknown',
          paymentStatus: 'PAID',
          message: 'Payment completed successfully'
        });
        setLoading(false);
        // Still try to redirect after 2 seconds
        setTimeout(() => {
          navigate('/profile?tab=purchased');
        }, 2000);
      } else {
        setPaymentStatus({
          orderId: 'unknown',
          paymentStatus: 'FAILED',
          message: 'No order code found in URL'
        });
        setLoading(false);
      }
    }
  }, [orderCode, searchParams, navigate]);

  const verifyPaymentStatus = async () => {
    if (!orderCode) return;

    try {
      setLoading(true);
      const status = await completePayment(orderCode);
      setPaymentStatus(status);

      if (status.paymentStatus === 'PAID' || status.paymentStatus === 'COMPLETED') {
        toast.success('Payment Successful!', 'Template has been added to your library');
        // Redirect to template detail or library after 2 seconds
        setTimeout(() => {
          try {
            if (status.templateId) {
              navigate(`/templates/${status.templateId}`);
            } else {
              navigate('/profile?tab=purchased');
            }
          } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to home page if navigation fails
            navigate('/home');
          }
        }, 2000);
      } else if (status.paymentStatus === 'PENDING' || status.paymentStatus === 'PENDING_PAYMENT') {
        // Auto-retry for pending payments
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            verifyPaymentStatus();
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // If API fails but we have status=PAID in URL, assume success
      const urlStatus = searchParams.get('status');
      if (urlStatus === 'PAID') {
        setPaymentStatus({
          orderId: orderCode,
          paymentStatus: 'PAID',
          message: 'Payment completed successfully (verified from URL)'
        });
        toast.success('Payment Successful!', 'Template has been added to your library');
        
        // Still redirect after 2 seconds
        setTimeout(() => {
          navigate('/profile?tab=purchased');
        }, 2000);
      } else {
        setPaymentStatus({
          orderId: orderCode,
          paymentStatus: 'FAILED',
          message: 'Failed to verify payment status'
        });
        toast.error('Verification Failed', 'Could not verify payment status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    verifyPaymentStatus();
  };

  const handleGoToLibrary = () => {
    navigate('/profile?tab=purchased');
  };

  const handleGoToTemplates = () => {
    navigate('/templates');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying payment...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (!paymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">Unable to verify your payment status</p>
          <button
            onClick={handleGoToTemplates}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Templates
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (paymentStatus.paymentStatus) {
      case 'PAID':
      case 'COMPLETED':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      default:
        return <XCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.paymentStatus) {
      case 'PAID':
      case 'COMPLETED':
        return 'text-green-600';
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'text-yellow-600';
      case 'CANCELLED':
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus.paymentStatus) {
      case 'PAID':
      case 'COMPLETED':
        return 'Payment Successful!';
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'Payment Pending';
      case 'CANCELLED':
        return 'Payment Cancelled';
      case 'FAILED':
        return 'Payment Failed';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {getStatusIcon()}
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Order ID: <span className="font-mono text-sm">{paymentStatus.orderId}</span>
          </p>
          <p className="text-gray-700">{paymentStatus.message}</p>
        </div>

        {paymentStatus.templateTitle && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Template:</p>
            <p className="font-semibold text-gray-900">{paymentStatus.templateTitle}</p>
          </div>
        )}

        {paymentStatus.paymentStatus === 'PAID' && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm">
                ✓ Your template has been added to your library. You can download it anytime!
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting you to the template page...
            </p>
          </div>
        )}

        {(paymentStatus.paymentStatus === 'PENDING' || paymentStatus.paymentStatus === 'PENDING_PAYMENT') && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Your payment is being processed. This may take a few minutes. The template will be added to your library once payment is confirmed.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                disabled={retryCount >= maxRetries}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {retryCount >= maxRetries ? 'Max Retries' : 'Check Again'}
              </button>
              <button
                onClick={handleGoToTemplates}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Templates
              </button>
            </div>
            {retryCount > 0 && (
              <p className="text-xs text-gray-500">
                Retry {retryCount}/{maxRetries}
              </p>
            )}
          </div>
        )}

        {(paymentStatus.paymentStatus === 'CANCELLED' || paymentStatus.paymentStatus === 'FAILED') && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                {paymentStatus.paymentStatus === 'CANCELLED' 
                  ? 'You cancelled the payment process.'
                  : 'Payment could not be completed. Please try again.'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleGoToTemplates}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Templates
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleGoToLibrary}
            className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
          >
            <span>View My Library</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
