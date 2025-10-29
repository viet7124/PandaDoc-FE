import axios from 'axios';
import { clearAuthData } from '../../../utils/authUtils';

// Normalize backend base URL and guard against missing env in production
const rawBase: string = import.meta.env.VITE_BASE_URL || '';
const normalizedBase: string = rawBase
  ? rawBase.replace(/\/?$/, '/')
  : '';

if (!normalizedBase) {
    console.warn('[authAPI] VITE_BASE_URL is not defined. API calls will fail.');
}

const url = `${normalizedBase}api`;

export interface LoginResponse {
    id: number;
    username: string;
    email: string;
    roles: string[];
    token: string; // JWT from backend
    type?: string; // e.g., "Bearer"
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export const register = async (username: string, email: string, password: string) => {
    try {
        const response = await axios.post(`${url}/auth/signup`, { username, email, password }, {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${url}/auth/signin`, { username, password }, {
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
    return response.data;
};

export const logout = async () => {
    try {
        const response = await axios.post(`${url}/auth/logout`);
        
        // Clear all authentication data from localStorage using utility
        clearAuthData();
        
        return response.data;
    } catch (error) {
        console.error('Error logging out user:', error);
        
        // Clear localStorage even if logout request fails
        clearAuthData();
        
        throw error;
    }
};

// Request password reset link
export const requestPasswordReset = async (email: string): Promise<void> => {
    try {
        const body: ForgotPasswordRequest = { email };
        await axios.post(`${url}/auth/forgot-password`, body, {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        throw error;
    }
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
        const body: ResetPasswordRequest = { token, newPassword };
        await axios.post(`${url}/auth/reset-password`, body, {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};

// Verify email via token query param
export const verifyEmail = async (token: string): Promise<void> => {
    try {
        const fullUrl = `${url}/auth/verify-email`;
        await axios.get(fullUrl, {
            params: { token },
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        throw error;
    }
};