import axios from 'axios';

const url = import.meta.env.VITE_BASE_URL + 'api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
};

export interface Suggestion {
  id: number;
  message: string;
  status: string;
  response: string | null;
  createdAt: string;
  respondedAt: string | null;
  username: string;
}

/**
 * Get all suggestions (Admin only)
 */
export const getSuggestions = async (): Promise<Suggestion[]> => {
  try {
    const response = await axios.get<Suggestion[]>(`${url}/admin/suggestions`, {
      headers: getAuthHeaders()
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
};

/**
 * Respond to a suggestion and update its status
 */
export const respondToSuggestion = async (
  suggestionId: number,
  status: 'REVIEWED' | 'RESOLVED' | 'REJECTED',
  response?: string
): Promise<Suggestion> => {
  try {
    const result = await axios.post<Suggestion>(
      `${url}/admin/suggestions/${suggestionId}/respond`,
      { status, response },
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    return result.data;
  } catch (error) {
    console.error('Error responding to suggestion:', error);
    throw error;
  }
};

