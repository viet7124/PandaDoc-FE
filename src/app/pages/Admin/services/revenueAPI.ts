import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const rawBase: string = import.meta.env.VITE_BASE_URL || '';
const normalizedBase: string = rawBase ? rawBase.replace(/\/?$/, '/') : '';
const url = `${normalizedBase}api/admin`;

// use shared getAuthHeaders

export type RevenuePeriod = 'week' | 'month' | 'quarter' | 'year';

export interface RevenueData {
  period: RevenuePeriod;
  totalRevenue: number;
}

/**
 * Get revenue report data (Admin only)
 * Default period is "month" if not specified.
 */
export const getRevenueData = async (period: RevenuePeriod = 'month'): Promise<RevenueData> => {
  try {
    const response = await axios.get<RevenueData>(`${url}/revenue`, {
      headers: getAuthHeaders(),
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

