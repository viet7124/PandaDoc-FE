import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const url = import.meta.env.VITE_BASE_URL + 'api/admin';

// use shared getAuthHeaders

export interface RevenueData {
  period: string;
  totalRevenue: number;
}

/**
 * Get revenue report data (Admin only)
 */
export const getRevenueData = async (): Promise<RevenueData> => {
  try {
    const response = await axios.get<RevenueData>(`${url}/revenue`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

