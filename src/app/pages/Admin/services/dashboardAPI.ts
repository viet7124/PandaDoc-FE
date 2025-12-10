import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const url = import.meta.env.VITE_BASE_URL + 'api';

// use shared getAuthHeaders

export interface DashboardData {
  dailyUsers: number;
  monthlyRevenue: number;
  rewardCosts: number;
  totalDownloads: number;
  totalTemplates: number;
  totalUsers?: number;
  totalBuyers?: number;
  approvedTemplates?: number;
  pendingTemplates?: number;
  publishedTemplates?: number;
  rejectedTemplates?: number;
}

/**
 * Get admin dashboard data
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await axios.get<DashboardData>(`${url}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

