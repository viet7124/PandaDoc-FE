import axios from 'axios';
import { getAuthHeaders } from '../utils/authUtils';

const rawBase: string = import.meta.env.VITE_BASE_URL || '';
const normalizedBase: string = rawBase ? rawBase.replace(/\/?$/, '/') : '';
const url = `${normalizedBase}api`;

interface SubmitSuggestionResponse {
  message: string;
}

export const submitSuggestion = async (payload: string): Promise<SubmitSuggestionResponse> => {
  const response = await axios.post<SubmitSuggestionResponse>(
    `${url}/suggestions`,
    { message: payload },
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

