import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';
import StatCard from '../../components/StatCard';
import PayoutManagement from './components/PayoutManagement';
import { getDashboardData } from './services/dashboardAPI';
import { getPendingPayouts, getPayoutHistory } from './services/payoutAPI';
import type { DashboardData } from './services/dashboardAPI';

export default function Dashboard() {
  const toast = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [payoutStats, setPayoutStats] = useState({
    totalPendingAmount: 0,
    totalPaidAmount: 0,
    pendingPayoutsCount: 0,
    paidPayoutsCount: 0,
    totalPayoutsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'payouts'>('overview');

  useEffect(() => {
    fetchDashboardData();
    fetchPayoutStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      console.log('Dashboard API Response:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show toast if it's just a 404, might not have endpoint yet
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        toast.error('Error Loading Dashboard', 'Failed to load dashboard data. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutStats = async () => {
    try {
      // Calculate statistics from actual payout data
      const [pendingPayouts, payoutHistory] = await Promise.all([
        getPendingPayouts(),
        getPayoutHistory()
      ]);

      const totalPendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.agreedPrice, 0);
      const paidPayouts = payoutHistory.filter(payout => payout.status === 'PAID');
      const totalPaidAmount = paidPayouts.reduce((sum, payout) => sum + payout.agreedPrice, 0);

      setPayoutStats({
        totalPendingAmount,
        totalPaidAmount,
        pendingPayoutsCount: pendingPayouts.length,
        paidPayoutsCount: paidPayouts.length,
        totalPayoutsCount: pendingPayouts.length + payoutHistory.length
      });
    } catch (error) {
      console.error('Error fetching payout statistics:', error);
      // Set fallback data when API fails
      setPayoutStats({
        totalPendingAmount: 0,
        totalPaidAmount: 0,
        pendingPayoutsCount: 0,
        paidPayoutsCount: 0,
        totalPayoutsCount: 0
      });
    }
  };

  const formatChange = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6 ml-10 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 ml-10 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  // Safe number formatting
  const formatNumber = (num: number | undefined | null): string => {
    return (num ?? 0).toLocaleString('en-US');
  };

  return (
    <div className="p-6 ml-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of system statistics and performance</p>
        </div>

        {/* Section Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection('payouts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'payouts'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payout Management
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Monthly Revenue"
            value={`${formatNumber(dashboardData.monthlyRevenue)} VND`}
            change={formatChange(0)}
            changeType="positive"
            iconBg="bg-green-100"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          
          <StatCard
            title="Reward Costs"
            value={`${formatNumber(dashboardData.rewardCosts)} VND`}
            change={formatChange(0)}
            changeType="positive"
            iconBg="bg-orange-100"
            icon={
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
              </svg>
            }
          />
          
          <StatCard
            title="Total Templates"
            value={formatNumber(dashboardData.totalTemplates)}
            change={formatChange(0)}
            changeType="positive"
            iconBg="bg-blue-100"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          
          <StatCard
            title="Total Downloads"
            value={formatNumber(dashboardData.totalDownloads)}
            change={formatChange(0)}
            changeType="positive"
            iconBg="bg-purple-100"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Daily Users"
            value={formatNumber(dashboardData.dailyUsers)}
            change={formatChange(0)}
            changeType="positive"
            iconBg="bg-indigo-100"
            icon={
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
          />
        </div>

        {/* Payout Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending Payouts"
            value={`${payoutStats.totalPendingAmount.toLocaleString('vi-VN')} VND`}
            change={formatChange(0)}
            changeType="warning"
            iconBg="bg-yellow-100"
            icon={
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Paid Payouts"
            value={`${payoutStats.totalPaidAmount.toLocaleString('vi-VN')} VND`}
            change={formatChange(0)}
            changeType="positive"
            iconBg="bg-green-100"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Total Payouts"
            value={payoutStats.totalPayoutsCount.toString()}
            change={formatChange(0)}
            changeType="positive"
            iconBg="bg-blue-100"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>
          </>
        )}

        {/* Payout Management Section */}
        {activeSection === 'payouts' && (
          <PayoutManagement />
        )}
      </div>
    </div>
  );
}
