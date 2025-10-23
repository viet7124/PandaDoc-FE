import axios from 'axios';
const url = import.meta.env.VITE_BASE_URL + 'api';

export const register = async (username: string, email: string, password: string) => {
    try {
        const response = await axios.post(`${url}/auth/signup`, { username, email, password });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${url}/auth/signin`, { username, password });
        return response.data;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await axios.post(`${url}/auth/logout`);
        localStorage.removeItem('token');
        return response.data;
    } catch (error) {
        console.error('Error logging out user:', error);
        localStorage.removeItem('token');
        throw error;
    }
};