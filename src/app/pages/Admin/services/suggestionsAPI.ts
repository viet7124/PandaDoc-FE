import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const rawBase: string = import.meta.env.VITE_BASE_URL || '';
const normalizedBase: string = rawBase ? rawBase.replace(/\/?$/, '/') : '';
const url = `${normalizedBase}api`;

// use shared getAuthHeaders

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
    const data = response.data || [];
    return [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

