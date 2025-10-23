import axios from 'axios';

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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
};

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

