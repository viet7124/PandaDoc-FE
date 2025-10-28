import axios from 'axios';
const url = import.meta.env.VITE_BASE_URL + 'api';

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

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
        await axios.get(`${url}/auth/verify-email`, {
            params: { token },
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        throw error;
    }
};