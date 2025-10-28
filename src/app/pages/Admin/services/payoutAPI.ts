import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL + 'api';

// Add axios interceptor to handle OAuth2 redirects
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔍 401/403 Error - Authentication required');
      // Instead of redirecting to OAuth2 (which causes CORS), redirect to login page
      console.log('🔍 Redirecting to login page instead of OAuth2 to avoid CORS issues');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Payout interfaces
export interface PendingPayout {
  id: number;
  templateId: number;
  templateTitle: string;
  sellerId: number;
  sellerUsername: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  agreedPrice: number;
  status: 'PENDING';
  createdAt: string;
  adminNote?: string;
}

export interface PayoutHistory {
  id: number;
  templateId: number;
  templateTitle: string;
  sellerId: number;
  sellerUsername: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  agreedPrice: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  paidAt?: string;
  adminNote?: string;
}

export interface CreatePayoutRequest {
  agreedPrice: number;
  adminNote?: string;
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    // Decode token to check roles
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    console.log('🔐 Payout API Token payload:', tokenData);
    console.log('🔐 Payout API Token roles/authorities:', tokenData.authorities || tokenData.roles || 'No roles found');
    
    // Check if user has admin role in token
    const tokenRoles = tokenData.authorities || tokenData.roles || [];
    const hasAdminRole = Array.isArray(tokenRoles) && tokenRoles.some((role: string | { authority: string }) => 
      role === 'ROLE_ADMIN' || (typeof role === 'object' && role.authority === 'ROLE_ADMIN') || role === 'ADMIN'
    );
    
    // For development/testing, allow if user is logged in (bypass admin role check)
    const isDevelopment = import.meta.env.DEV || window.location.hostname.includes('vercel.app');
    const allowAccess = hasAdminRole || isDevelopment;
    
    if (!hasAdminRole) {
      console.warn('⚠️ User does not have admin role in token. Available roles:', tokenRoles);
      if (isDevelopment) {
        console.warn('🔧 Development mode: Allowing access despite missing admin role');
      }
    }
    
    if (!allowAccess) {
      throw new Error('Access denied. Admin role required.');
    }
    
    if (tokenData.exp && tokenData.exp < currentTime) {
      console.error('Token has expired');
      localStorage.removeItem('token');
      throw new Error('Session expired. Please login again.');
    }
  } catch {
    console.error('Invalid token format');
    localStorage.removeItem('token');
    throw new Error('Invalid session. Please login again.');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };
};

/**
 * GET /api/admin/payouts/pending
 * Get all pending payouts that need to be processed
 */
export const getPendingPayouts = async (): Promise<PendingPayout[]> => {
  try {
    const fullUrl = `${API_URL}/admin/payouts/pending`;
    console.log('GET Pending Payouts URL:', fullUrl);
    
    const response = await axios.get(fullUrl, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    // Check if response is HTML (ngrok error page)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.warn('Received HTML response instead of JSON, likely ngrok error page');
      throw new Error('Backend returned HTML instead of JSON');
    }
    
    console.log('Pending payouts fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    // Return empty array for development when API fails
    console.log('Using empty array for pending payouts');
    return [];
  }
};

/**
 * POST /api/admin/payouts/template/{templateId}
 * Create a payout for a specific template
 */
export const createTemplatePayout = async (templateId: number, payoutData: CreatePayoutRequest): Promise<void> => {
  try {
    const fullUrl = `${API_URL}/admin/payouts/template/${templateId}`;
    console.log('POST Create Template Payout URL:', fullUrl);
    console.log('Request body:', payoutData);
    
    // Validate payout data
    if (!payoutData.agreedPrice || payoutData.agreedPrice <= 0) {
      throw new Error('Agreed price must be greater than 0');
    }
    
    const response = await axios.post(fullUrl, payoutData, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('Template payout created successfully:', response.data);
  } catch (error) {
    console.error('Error creating template payout:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid payout data';
        
        // Check for specific duplicate payout error
        if (errorMessage.toLowerCase().includes('already') || 
            errorMessage.toLowerCase().includes('duplicate') ||
            errorMessage.toLowerCase().includes('existing') ||
            errorMessage.toLowerCase().includes('payout already exists')) {
          throw new Error('This template already has a payout. Cannot create duplicate payout.');
        }
        
        throw new Error(`Bad Request: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Template not found.');
      } else if (error.response?.status === 409) {
        throw new Error('This template already has a payout. Cannot create duplicate payout.');
      }
    }
    throw error;
  }
};

/**
 * PUT /api/admin/payouts/{payoutId}/mark-paid
 * Mark a payout as paid after manual bank transfer
 */
export const markPayoutAsPaid = async (payoutId: number): Promise<void> => {
  try {
    const fullUrl = `${API_URL}/admin/payouts/${payoutId}/mark-paid`;
    console.log('PUT Mark Payout as Paid URL:', fullUrl);
    
    const response = await axios.put(fullUrl, {}, {
      headers: getAuthHeaders()
    });
    
    console.log('Payout marked as paid successfully:', response.data);
  } catch (error) {
    console.error('Error marking payout as paid:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

/**
 * GET /api/admin/payouts/history
 * Get payout history for admin review
 */
export const getPayoutHistory = async (): Promise<PayoutHistory[]> => {
  try {
    const fullUrl = `${API_URL}/admin/payouts/history`;
    console.log('GET Payout History URL:', fullUrl);
    
    const response = await axios.get(fullUrl, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    // Check if response is HTML (ngrok error page)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.warn('Received HTML response instead of JSON, likely ngrok error page');
      throw new Error('Backend returned HTML instead of JSON');
    }
    
    console.log('Payout history fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching payout history:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    // Return empty array for development when API fails
    console.log('Using empty array for payout history');
    return [];
  }
};

