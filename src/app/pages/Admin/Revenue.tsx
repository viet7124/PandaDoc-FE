import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { getAdminOrders, type AdminOrder, type RevenuePeriod } from './services/revenueAPI';

interface TransactionRow {
  orderId: number;
  templateId: number;
  templateTitle: string;
  price: number;
  createdAt: string;
  status: string;
  userId: number;
}

export default function Revenue() {
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<RevenuePeriod>('month');

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Error Loading Revenue', 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (value: RevenuePeriod): string => {
    const labels: Record<RevenuePeriod, string> = {
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year'
    };
    return labels[value];
  };

  const getPeriodStartDate = (value: RevenuePeriod): Date => {
    const now = new Date();
    switch (value) {
      case 'week': {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        return start;
      }
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter': {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        return new Date(now.getFullYear(), quarterStartMonth, 1);
      }
      case 'year':
      default:
        return new Date(now.getFullYear(), 0, 1);
    }
  };

  const filteredOrders = useMemo(() => {
    const startDate = getPeriodStartDate(period);
    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }
      return createdAt >= startDate;
    });
  }, [orders, period]);

  const transactions = useMemo<TransactionRow[]>(() => {
    return filteredOrders
      .flatMap((order) =>
        order.orderItems.map((item) => ({
          orderId: order.id,
          templateId: item.templateId,
          templateTitle: item.templateTitle,
          price: Number.isFinite(item.price) ? item.price : 0,
          createdAt: order.createdAt,
          status: order.status,
          userId: order.userId
        }))
      )
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [filteredOrders]);

  const totalRevenue = useMemo(
    () => transactions.reduce((sum, transaction) => sum + transaction.price, 0),
    [transactions]
  );

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('vi-VN').format(value);

  const formatDate = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }
    return parsed.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="p-6 ml-10 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  const periodLabel: RevenuePeriod = period || 'month';

  return (
    <div className="p-6 ml-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue</h1>
            <p className="text-gray-600">Track income and revenue performance of the website</p>
          </div>

          {/* Period Selector */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            {(['week', 'month', 'quarter', 'year'] as RevenuePeriod[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  period === option
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                  Total Revenue
                </h3>
                <p className="text-4xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalRevenue)} VND
                </p>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700">
                {getPeriodLabel(periodLabel)}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reporting Period</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{periodLabel}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transactions</p>
                  <p className="text-sm font-semibold text-gray-900">{transactions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">Revenue Information</p>
              <p className="text-sm text-blue-700 mt-1">
                Data shows total revenue and transaction history for <span className="font-semibold">{getPeriodLabel(periodLabel)}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Transaction history by template</h2>
              <p className="text-sm text-gray-600">Showing orders within the selected period.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Orders</p>
                <p className="text-lg font-semibold text-gray-900">{filteredOrders.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Templates sold</p>
                <p className="text-lg font-semibold text-gray-900">{transactions.length}</p>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">
              No transactions found for {getPeriodLabel(periodLabel)}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Template</th>
                    <th className="px-6 py-3 text-left">Order</th>
                    <th className="px-6 py-3 text-left">Buyer</th>
                    <th className="px-6 py-3 text-left">Price (VND)</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={`${transaction.orderId}-${transaction.templateId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{transaction.templateTitle}</p>
                        <p className="text-xs text-gray-500">Template ID: {transaction.templateId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-medium">#{transaction.orderId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-medium">User ID: {transaction.userId}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        {formatCurrency(transaction.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(transaction.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
