import axios from "axios";
import { getAuthHeaders } from '../../../utils/authUtils';
const url = import.meta.env.VITE_BASE_URL + 'api';

export const getPopularTemplates = async () => {
    try {
        const response = await axios.get(`${url}/templates/popular`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching popular templates:', error);
        throw error;
    }
}
