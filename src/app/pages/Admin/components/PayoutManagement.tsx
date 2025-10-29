import { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, AlertCircle, Eye, CreditCard } from 'lucide-react';
import { trySendNotification } from '../../Notification/services/notificationAPI';
import { 
  getPendingPayouts, 
  markPayoutAsPaid, 
  getPayoutHistory,
  type PendingPayout, 
  type PayoutHistory 
} from '../services/payoutAPI';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';

export default function PayoutManagement() {
  const toast = useToast();
  const { confirm } = useConfirm();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'pending') {
        const data = await getPendingPayouts();
        setPendingPayouts(data);
      } else if (activeTab === 'history') {
        const data = await getPayoutHistory();
        setPayoutHistory(data);
      }
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast.error('Error', 'Failed to load payout data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (payoutId: number, sellerName: string, amount: number) => {
    const result = await confirm({
      title: 'Mark Payout as Paid',
      message: `Confirm that you have manually transferred ${amount.toLocaleString('vi-VN')} VND to ${sellerName}?\n\nThis action cannot be undone and will notify the seller.`,
      type: 'success',
      confirmText: 'Mark as Paid',
      cancelText: 'Cancel'
    });

    if (!result) return;

    try {
      setProcessing(payoutId);
      await markPayoutAsPaid(payoutId);
      toast.success('Payout Updated', `Payout of ${amount.toLocaleString('vi-VN')} VND has been marked as paid. Seller has been notified.`);
      // Best-effort notification
      trySendNotification({
        username: sellerName,
        title: 'Payout Paid',
        message: `Your payout of ${amount.toLocaleString('vi-VN')} VND has been marked as PAID.`,
        type: 'SUCCESS',
        link: '/seller-profile?tab=earnings'
      });
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking payout as paid:', error);
      if (error instanceof Error) {
        toast.error('Error', `Failed to mark payout as paid: ${error.message}`);
      } else {
        toast.error('Error', 'Failed to mark payout as paid. Please try again.');
      }
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payout Management</h2>
          <p className="text-gray-600">Manage seller payouts and earnings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pending', name: 'Pending Payouts', count: pendingPayouts.length },
            { id: 'history', name: 'Payout History', count: payoutHistory.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payout data...</p>
        </div>
      ) : (
        <>
          {/* Pending Payouts Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              {pendingPayouts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No pending payouts</p>
                  <p className="text-gray-400 mt-2">All payouts have been processed</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pendingPayouts.map((payout) => (
                    <div key={payout.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Payout #{payout.id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Template: {payout.templateTitle}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Seller</p>
                              <p className="text-sm text-gray-900">{payout.sellerUsername}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Amount</p>
                              <p className="text-lg font-bold text-green-600">
                                {payout.agreedPrice.toLocaleString('vi-VN')} VND
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Bank Account</p>
                              <p className="text-sm text-gray-900">{payout.bankAccountNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Account Holder</p>
                              <p className="text-sm text-gray-900">{payout.bankAccountHolderName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Bank</p>
                              <p className="text-sm text-gray-900">{payout.bankName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Created</p>
                              <p className="text-sm text-gray-900">{formatDate(payout.createdAt)}</p>
                            </div>
                          </div>

                          {payout.adminNote && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">Admin Note</p>
                              <p className="text-sm text-gray-900">{payout.adminNote}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-6">
                          <button
                            onClick={() => handleMarkAsPaid(payout.id, payout.sellerUsername, payout.agreedPrice)}
                            disabled={processing === payout.id}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {processing === payout.id ? 'Processing...' : 'Mark as Paid'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payout History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {payoutHistory.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No payout history</p>
                  <p className="text-gray-400 mt-2">Payout history will appear here</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Payout ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Template
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Seller
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Paid Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payoutHistory.map((payout) => (
                          <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-semibold text-gray-900">
                                #{payout.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">{payout.templateTitle}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{payout.sellerUsername}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-lg text-green-600">
                                {payout.agreedPrice.toLocaleString('vi-VN')} VND
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(payout.status)}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                              {formatDate(payout.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                              {payout.paidAt ? formatDate(payout.paidAt) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </>
      )}
    </div>
  );
}
