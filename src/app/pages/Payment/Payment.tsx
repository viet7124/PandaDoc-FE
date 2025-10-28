import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { getTemplateById, purchaseTemplate, type Template, type PayOSResponse } from '../TemplatePage/services/templateAPI';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
// Removed PayOS SDK hook; we'll redirect to paymentUrl directly

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}


export default function Payment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('payos');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  // Keep last PayOS response (optional)
  const [, setPayosData] = useState<PayOSResponse | null>(null);

  // PayOS redirect URL - use current origin to match dev server port
  const payosReturnUrl = `${window.location.origin}/payment/success`;

  // Card payment form (fallback)
  // Removed card/bank form as we only use PayOS

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'payos',
      name: 'PayOS Gateway',
      icon: <Wallet className="w-5 h-5" />,
      description: 'QR Code, Banking, E-Wallet (Recommended)'
    }
  ];

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const data = await getTemplateById(Number(id));
      setTemplate(data);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Error', 'Failed to load template details');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const validatePayment = (): boolean => true;

  const handlePayOSPayment = async () => {
    if (!template) return;

    const result = await confirm({
      title: 'Create PayOS Payment',
      message: `Create payment order for "${template.title}" - ${template.price.toLocaleString('vi-VN')} VND?`,
      type: 'info',
      confirmText: 'Create Payment',
      cancelText: 'Cancel'
    });

    if (!result) return;

    try {
      setProcessing(true);

      // Use templateAPI to create PayOS payment order
      const payosResponse = await purchaseTemplate(template.id);
      setPayosData(payosResponse);

      // Redirect user to PayOS checkout page (SDK-free)
      const url = new URL(payosResponse.paymentUrl);
      // ensure returnUrl is set (backend should include it, this is fallback)
      if (!url.searchParams.get('returnUrl')) {
        url.searchParams.set('returnUrl', payosReturnUrl);
      }
      window.location.href = url.toString();
    } catch (error) {
      console.error('PayOS error:', error);
      toast.error('Payment Failed', 'Failed to create payment link. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!template) return;

    // Only PayOS supported
    await handlePayOSPayment();
    return;

    const result = await confirm({
      title: 'Confirm Payment',
      message: `You are about to pay ${template.price.toLocaleString('vi-VN')} VND for "${template.title}". This action cannot be undone.`,
      type: 'success',
      confirmText: 'Pay Now',
      cancelText: 'Cancel'
    });

    if (!result) return;

    try {
      setProcessing(true);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call purchase API
      await purchaseTemplate(template.id);

      setPaymentSuccess(true);
      toast.success('Payment Successful!', 'Template has been added to your library');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(`/templates/${template.id}`);
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Template not found</h2>
          <button
            onClick={() => navigate('/templates')}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. The template has been added to your library.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Template</p>
            <p className="font-semibold text-gray-900">{template.title}</p>
            <p className="text-sm text-gray-600 mt-2">Amount Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {template.price.toLocaleString('vi-VN')} VND
            </p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to template page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">Secure payment powered by PandaDocs</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              
              {/* Payment Method Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className={`${selectedMethod === method.id ? 'text-green-600' : 'text-gray-600'}`}>
                        {method.icon}
                      </div>
                    </div>
                    <p className={`font-semibold text-sm ${
                      selectedMethod === method.id ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {method.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                  </button>
                ))}
              </div>

              {/* Card/Bank options removed */}

              {/* PayOS Payment */}
              {selectedMethod === 'payos' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">PayOS Payment Gateway</h3>
                    <p className="text-sm text-blue-700">Fast, secure, and convenient payment solution</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Supported Payment Methods:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        QR Code Payment
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Internet Banking
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Momo Wallet
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ZaloPay
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        VNPay
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Credit/Debit Card
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">How it works:</p>
                        <ol className="list-decimal ml-4 space-y-1">
                          <li>Click "Pay Now" to create payment link</li>
                          <li>Scan QR code or open payment link</li>
                          <li>Complete payment using your preferred method</li>
                          <li>Template will be added to your library automatically</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank transfer removed */}
            </div>

            {/* Security Badge */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
              <Lock className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Template Price</span>
                  <span className="font-semibold text-gray-900">
                    {template.price.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-semibold text-gray-900">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {template.price.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Pay ${template.price.toLocaleString('vi-VN')} VND`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* PayOS handled by redirect; no embedded iframe */}
      </div>
    </div>
  );
}

