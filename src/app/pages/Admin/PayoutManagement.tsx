import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingPayouts, 
  getPayoutHistory, 
  createTemplatePayout, 
  markPayoutAsPaid 
} from './services/payoutAPI';
import { getAllTemplates, updateTemplateStatus } from './services/templateManagementAPI';
import type { PendingPayout, PayoutHistory, CreatePayoutRequest } from './services/payoutAPI';
import type { Template } from './services/templateManagementAPI';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

export default function PayoutManagement() {
  console.log('🎯 PayoutManagement component rendered');
  const toast = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔒 No authentication token found, redirecting to login');
      toast.error('Authentication Required', 'Please login to access admin functions');
      navigate('/login');
      return;
    }
    
    // Check if user has admin role
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const hasAdminRole = user.roles && user.roles.includes('ROLE_ADMIN');
        if (!hasAdminRole) {
          console.log('🔒 User does not have ROLE_ADMIN, redirecting to login');
          toast.error('Access Denied', 'Admin privileges required');
          navigate('/login');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
      navigate('/login');
      return;
    }
  }, [navigate, toast]);
  
  // State
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<number | null>(null);
  
  // Create payout modal state
  const [showCreatePayoutModal, setShowCreatePayoutModal] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [payoutForm, setPayoutForm] = useState<CreatePayoutRequest>({
    agreedPrice: 0,
    adminNote: ''
  });
  const [payoutErrors, setPayoutErrors] = useState<Record<string, string>>({});

  // Fetch data - using regular functions to avoid infinite loops
  const fetchPendingPayouts = async () => {
    try {
      const data = await getPendingPayouts();
      setPendingPayouts(data);
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      toast.error('Failed to load pending payouts', 'Please try again later');
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const data = await getPayoutHistory();
      setPayoutHistory(data);
    } catch (error) {
      console.error('Error fetching payout history:', error);
      toast.error('Failed to load payout history', 'Please try again later');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates();
      console.log('🔍 All templates fetched:', response.content);
      console.log('🔍 Template statuses:', response.content.map(t => ({ id: t.id, title: t.title, status: t.status })));
      
      // Only show APPROVED templates uploaded by SELLERS for payout creation
      // (PUBLISHED templates should not appear here as they're already processed)
      const approvedTemplates = response.content.filter(
        template => {
          const status = template.status?.toUpperCase();
          const isApproved = status === 'APPROVED'; // Only APPROVED, not PUBLISHED
          // Include templates from non-admin users (sellers, regular users, etc.)
          // Exclude only admin-uploaded templates
          const isSellerTemplate = !template.author?.username?.includes('admin') && 
                                 template.author?.username !== 'admin_user';
          
          console.log(`🔍 Template ${template.id} (${template.title}): status="${template.status}" -> normalized="${status}" -> approved=${isApproved} -> seller=${isSellerTemplate} -> author="${template.author?.username}"`);
          
          return isApproved && isSellerTemplate;
        }
      );
      console.log('✅ Approved templates for payout:', approvedTemplates);
      console.log('✅ Number of approved templates:', approvedTemplates.length);
      setTemplates(approvedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates', 'Please try again later');
    }
  };

  useEffect(() => {
    console.log('🚀 Payout Management useEffect triggered');
    const loadData = async () => {
      console.log('🔄 Loading payout management data...');
      setLoading(true);
      await Promise.all([
        fetchPendingPayouts(),
        fetchPayoutHistory(),
        fetchTemplates()
      ]);
      setLoading(false);
      console.log('✅ Payout management data loaded');
    };
    
    loadData();
  }, []); // Remove callback dependencies to prevent infinite loop

  // Handle mark as paid
  const handleMarkAsPaid = async (payoutId: number, sellerUsername: string, amount: number) => {
    const result = await confirm({
      title: 'Mark as Paid',
      message: `Are you sure you have manually transferred ${amount.toLocaleString()} VND to ${sellerUsername}? This will move the template back to Template Management for final publishing.`,
      type: 'success',
      confirmText: 'Mark as Paid',
      cancelText: 'Cancel'
    });

    if (!result) return;

    try {
      setProcessing(payoutId);
      
      // Mark payout as paid
      await markPayoutAsPaid(payoutId);
      
      // Find the template associated with this payout and update its status to APPROVED
      // This will move the template back to Template Management for final publishing
      const payout = pendingPayouts.find(p => p.id === payoutId);
      if (payout && payout.templateId) {
        console.log(`🔄 Updating template ${payout.templateId} status to APPROVED`);
        await updateTemplateStatus(payout.templateId, 'APPROVED');
        console.log(`✅ Template ${payout.templateId} status updated to APPROVED`);
      }
      
      // Refresh all data
      await fetchPendingPayouts();
      await fetchPayoutHistory();
      await fetchTemplates(); // Refresh templates to show status change
      
      toast.success('Payout Marked as Paid', `Payment of ${amount.toLocaleString()} VND has been recorded for ${sellerUsername}. Template is now ready for final publishing in Template Management.`);
    } catch (error) {
      console.error('Error marking payout as paid:', error);
      toast.error('Failed to mark as paid', 'An error occurred while updating the payout status');
    } finally {
      setProcessing(null);
    }
  };

  // Handle create payout
  const handleCreatePayout = (template: Template) => {
    // Check if template already has a payout in history OR pending payouts
    const hasExistingPayoutInHistory = payoutHistory.some(payout => payout.templateId === template.id);
    const hasExistingPayoutPending = pendingPayouts.some(payout => payout.templateId === template.id);
    
    if (hasExistingPayoutInHistory || hasExistingPayoutPending) {
      toast.error('Duplicate Payout', 'This template already has a payout. Cannot create duplicate payout.');
      return;
    }
    
    setSelectedTemplate(template);
    setPayoutForm({
      agreedPrice: template.price || 0,
      adminNote: ''
    });
    setPayoutErrors({});
    setShowCreatePayoutModal(true);
  };

  const handlePayoutFormChange = (field: keyof CreatePayoutRequest, value: string | number) => {
    setPayoutForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (payoutErrors[field]) {
      setPayoutErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePayoutForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!payoutForm.agreedPrice || payoutForm.agreedPrice <= 0) {
      errors.agreedPrice = 'Payout amount must be greater than 0';
    }

    if (payoutForm.agreedPrice > 10000000) {
      errors.agreedPrice = 'Payout amount cannot exceed 10,000,000 VND';
    }

    setPayoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPayout = async () => {
    if (!selectedTemplate || !validatePayoutForm()) {
      return;
    }

    try {
      setProcessing(selectedTemplate.id);
      await createTemplatePayout(selectedTemplate.id, payoutForm);
      
      // Refresh ALL data to ensure pending payouts list is updated
      await Promise.all([
        fetchPendingPayouts(),
        fetchPayoutHistory(),
        fetchTemplates()
      ]);
      
      setShowCreatePayoutModal(false);
      setSelectedTemplate(null);
      setPayoutForm({ agreedPrice: 0, adminNote: '' });
      toast.success('Payout Created', `Payout of ${payoutForm.agreedPrice.toLocaleString()} VND has been created for ${selectedTemplate.title}`);
    } catch (error) {
      console.error('Error creating payout:', error);
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create payout. Please try again.';
      
      toast.error('Failed to create payout', errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleCloseCreatePayoutModal = () => {
    setShowCreatePayoutModal(false);
    setSelectedTemplate(null);
    setPayoutForm({ agreedPrice: 0, adminNote: '' });
    setPayoutErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payout Management</h1>
        <p className="text-gray-600">Manage seller payouts and payment history</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Payouts ({pendingPayouts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment History ({payoutHistory.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Pending Payouts Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Create Payout Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create New Payout</h2>
              <p className="text-sm text-gray-500">Select an approved non-admin template to create a payout (only APPROVED status templates)</p>
            </div>
            
            {templates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No approved non-admin templates available for payout</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  // Check for existing payout in both history and pending
                  const hasExistingPayoutInHistory = payoutHistory.some(payout => payout.templateId === template.id);
                  const hasExistingPayoutPending = pendingPayouts.some(payout => payout.templateId === template.id);
                  const hasExistingPayout = hasExistingPayoutInHistory || hasExistingPayoutPending;
                  
                  return (
                    <div key={template.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      hasExistingPayout ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}>
                      {/* Template Preview Image */}
                      <div className="relative h-24 mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                        {template.images && template.images.length > 0 ? (
                          <img
                            src={template.images[0]}
                            alt={`${template.title} preview`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to default image if preview fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        {/* Default fallback image */}
                        <div className={`absolute inset-0 flex items-center justify-center ${template.images && template.images.length > 0 ? 'hidden' : ''}`}>
                          <div className="text-center">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <div className="text-xs font-medium text-gray-500">No Preview</div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2">{template.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Author: {template.author.username}</p>
                      <p className="text-sm text-gray-600 mb-3">Price: {template.price.toLocaleString()} VND</p>
                      
                      {hasExistingPayout ? (
                        <div className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg text-center font-medium">
                          Already Has Payout
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCreatePayout(template)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Payout
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Payouts List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Payouts</h2>
            </div>
            
            {pendingPayouts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No pending payouts
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingPayouts.map((payout) => (
                  <div key={payout.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{payout.templateTitle}</h3>
                            <p className="text-sm text-gray-600">Seller: {payout.sellerUsername}</p>
                            <p className="text-sm text-gray-600">Business: {payout.sellerUsername}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              {payout.agreedPrice.toLocaleString()} VND
                            </p>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(payout.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Bank Details:</p>
                            <p className="text-sm text-gray-600">{payout.bankName}</p>
                            <p className="text-sm text-gray-600">Account: {payout.bankAccountNumber}</p>
                            <p className="text-sm text-gray-600">Holder: {payout.bankAccountHolderName}</p>
                          </div>
                          {payout.adminNote && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Admin Note:</p>
                              <p className="text-sm text-gray-600">{payout.adminNote}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <button
                          onClick={() => handleMarkAsPaid(payout.id, payout.sellerUsername, payout.agreedPrice)}
                          disabled={processing === payout.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === payout.id ? 'Processing...' : 'Mark as Paid'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          
          {payoutHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No payment history available
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {payoutHistory.map((payout) => (
                <div key={payout.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{payout.templateTitle}</h3>
                          <p className="text-sm text-gray-600">Seller: {payout.sellerUsername}</p>
                          <p className="text-sm text-gray-600">Business: {payout.sellerUsername}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            {payout.agreedPrice.toLocaleString()} VND
                          </p>
                          <p className="text-sm text-gray-500">
                            {payout.paidAt ? `Paid: ${new Date(payout.paidAt).toLocaleDateString()}` : `Created: ${new Date(payout.createdAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payout.status === 'PAID' 
                            ? 'bg-green-100 text-green-800' 
                            : payout.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payout.status}
                        </span>
                        {payout.adminNote && (
                          <p className="text-sm text-gray-600">Note: {payout.adminNote}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Payout Modal */}
      {showCreatePayoutModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create Payout</h3>
              <p className="text-sm text-gray-600">Template: {selectedTemplate.title}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Amount (VND)
                  </label>
                  <input
                    type="number"
                    value={payoutForm.agreedPrice}
                    onChange={(e) => handlePayoutFormChange('agreedPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter payout amount"
                  />
                  {payoutErrors.agreedPrice && (
                    <p className="text-red-500 text-sm mt-1">{payoutErrors.agreedPrice}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Note (Optional)
                  </label>
                  <textarea
                    value={payoutForm.adminNote}
                    onChange={(e) => handlePayoutFormChange('adminNote', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Add a note about this payout"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseCreatePayoutModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayout}
                disabled={processing === selectedTemplate.id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === selectedTemplate.id ? 'Creating...' : 'Create Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
