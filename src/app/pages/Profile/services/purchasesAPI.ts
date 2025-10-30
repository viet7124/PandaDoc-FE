import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const url = import.meta.env.VITE_BASE_URL + 'api';

export interface PurchasedTemplate {
  libraryId: number;
  template: {
    id: number;
    title: string;
    description: string;
    price: number;
    fileUrl: string;
    documentType?: string;
    category: {
      id: number;
      name: string;
    };
    author: {
      id: number;
      username: string;
    };
  };
  acquiredAt: string;
}

/**
 * GET /api/users/me/purchases
 * Fetch all purchased templates for the current user
 */
export const getPurchasedTemplates = async (): Promise<PurchasedTemplate[]> => {
  try {
    console.log('Fetching purchased templates from:', `${url}/users/me/purchases`);
    
    const response = await axios.get<PurchasedTemplate[]>(`${url}/users/me/purchases`, {
      headers: getAuthHeaders()
    });
    
    console.log('Purchased templates response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchased templates:', error);
    throw error;
  }
};

