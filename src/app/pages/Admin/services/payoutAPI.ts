import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';


const API_URL = import.meta.env.VITE_BASE_URL + 'api';

// Note: Removed global axios interceptor to prevent unwanted redirects
// Individual API calls now handle their own error cases

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

// Use shared auth header builder for consistency across modules

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

