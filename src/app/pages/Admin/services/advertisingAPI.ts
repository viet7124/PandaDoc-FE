import axios from 'axios';

const url = import.meta.env.VITE_BASE_URL + 'api/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
};

export interface Campaign {
  id?: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  targetAudience: string[];
  budget: number;
}

export interface CreateCampaignResponse {
  success: boolean;
  message: string;
  data: Campaign;
}

/**
 * Create a new advertising campaign (Admin only)
 */
export const createCampaign = async (campaign: Campaign): Promise<CreateCampaignResponse> => {
  try {
    const response = await axios.post<CreateCampaignResponse>(`${url}/advertising`, campaign, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

/**
 * Get all advertising campaigns (Admin only)
 */
export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await axios.get<Campaign[]>(`${url}/advertising`, {
      headers: getAuthHeaders()
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

