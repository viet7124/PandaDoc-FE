import axios from 'axios';

const url = import.meta.env.VITE_BASE_URL + 'api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
};

export interface DashboardData {
  dailyUsers: number;
  monthlyRevenue: number;
  rewardCosts: number;
  totalDownloads: number;
  totalTemplates: number;
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

