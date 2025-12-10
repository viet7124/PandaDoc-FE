import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const rawBase: string = import.meta.env.VITE_BASE_URL || '';
const normalizedBase: string = rawBase ? rawBase.replace(/\/?$/, '/') : '';
const url = `${normalizedBase}api/admin`;

// use shared getAuthHeaders

export type RevenuePeriod = 'week' | 'month' | 'quarter' | 'year';

export interface AdminOrderItem {
  templateId: number;
  templateTitle: string;
  price: number;
}

export interface AdminOrder {
  id: number;
  userId: number;
  totalAmount: number;
  createdAt: string;
  status: string;
  orderItems: AdminOrderItem[];
}

/**
 * Get admin order history for revenue view.
 */
export const getAdminOrders = async (): Promise<AdminOrder[]> => {
  try {
    const response = await axios.get<AdminOrder[]>(`${url}/orders`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
};

