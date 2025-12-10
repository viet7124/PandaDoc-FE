import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { getDashboardData } from "./services/dashboardAPI";
import { getBuyers, getRevenueData } from "./services/revenueAPI";
import type { Buyer, RevenueData, RevenuePeriod } from "./services/revenueAPI";
import type { DashboardData } from "./services/dashboardAPI";

export default function Revenue() {
  const toast = useToast();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<RevenuePeriod>("month");

  const fetchRevenueData = useCallback(async (selectedPeriod: RevenuePeriod) => {
    try {
      setLoading(true);
      const [revenueResponse, dashboardResponse, buyersResponse] = await Promise.all([
        getRevenueData(selectedPeriod),
        getDashboardData(),
        getBuyers()
      ]);

      setRevenueData(revenueResponse);
      setDashboardData(dashboardResponse);
      setBuyers(buyersResponse);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Error Loading Revenue", "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchRevenueData(period);
  }, [period, fetchRevenueData]);

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

  if (!revenueData) {
    return (
      <div className="p-6 ml-10 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load revenue data</p>
        </div>
      </div>
    );
  }

  const getPeriodLabel = (value: RevenuePeriod): string => {
    const labels: Record<RevenuePeriod, string> = {
      week: "This Week",
      month: "This Month",
      quarter: "This Quarter",
      year: "This Year",
    };
    return labels[value];
  };

  // Safely format revenue with default value
  const formattedRevenue = (revenueData.totalRevenue ?? 0).toLocaleString("en-US");
  const totalBuyers = dashboardData?.totalBuyers ?? 0;
  const periodLabel: RevenuePeriod = revenueData.period || "month";

  const sortedBuyers = useMemo(
    () =>
      [...buyers].sort((a, b) => b.purchasedCount - a.purchasedCount || a.username.localeCompare(b.username)),
    [buyers]
  );

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
            {(["week", "month", "quarter", "year"] as RevenuePeriod[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  period === option
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
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
                  {formattedRevenue} VND
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Buyers</p>
                  <p className="text-sm font-semibold text-gray-900">{totalBuyers}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date().toLocaleDateString("en-US")}</p>
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
                Data shows total revenue and total buyers. Refresh the page to update with the latest data.
              </p>
            </div>
          </div>
        </div>

        {/* Buyers Table */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Buyers</h2>
              <p className="text-sm text-gray-600">All buyers with their purchased templates count.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total buyers</p>
              <p className="text-lg font-semibold text-gray-900">{totalBuyers}</p>
            </div>
          </div>

          {sortedBuyers.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No buyers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Buyer</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Purchased Templates</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedBuyers.map((buyer) => (
                    <tr key={buyer.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {buyer.avatar ? (
                              <img className="h-10 w-10 rounded-full" src={buyer.avatar} alt={buyer.username} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                {buyer.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{buyer.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{buyer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{buyer.purchasedCount}</span>
                      </td>
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
