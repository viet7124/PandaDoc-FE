import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const rawBase: string = import.meta.env.VITE_BASE_URL || '';
const normalizedBase: string = rawBase ? rawBase.replace(/\/?$/, '/') : '';
const url = `${normalizedBase}api`;

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar: string;
  status: string;
  createdAt: string;
  roles: string[];
}

export interface UserActivity {
  type: string;
  description: string;
  timestamp: string;
}

export interface UsersResponse {
  content: User[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// use shared getAuthHeaders to support session/local tokens

/**
 * GET /api/admin/users
 * Get list of all users (Admin only)
 */
export const getAllUsers = async (page: number = 0, size: number = 100): Promise<User[]> => {
  try {
    console.log('Fetching all users from:', `${url}/admin/users?page=${page}&size=${size}`);
    
    const response = await axios.get<UsersResponse>(`${url}/admin/users`, {
      headers: getAuthHeaders(),
      params: { page, size }
    });
    
    console.log('Users response:', response.data);
    // Extract content array from paginated response
    return response.data.content || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * GET /api/admin/users (paged)
 * Returns full page info for pagination controls
 */
export const getUsersPage = async (page: number = 0, size: number = 50): Promise<UsersResponse> => {
  try {
    const response = await axios.get<UsersResponse>(`${url}/admin/users`, {
      headers: getAuthHeaders(),
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users page:', error);
    throw error;
  }
};

/**
 * GET /api/admin/users/{id}
 * Get specific user information (Admin only)
 */
export const getUserById = async (id: number): Promise<User> => {
  try {
    console.log('Fetching user by ID:', id);
    
    const response = await axios.get<User>(`${url}/admin/users/${id}`, {
      headers: getAuthHeaders()
    });
    
    console.log('User response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * PUT /api/admin/users/{id}
 * Update user information (Admin only)
 */
export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  try {
    console.log('Updating user:', id, userData);
    
    const response = await axios.put<User>(`${url}/admin/users/${id}`, userData, {
      headers: getAuthHeaders()
    });
    
    console.log('Update user response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * DELETE /api/admin/users/{id}
 * Delete a user (Admin only)
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    console.log('Deleting user:', id);
    
    await axios.delete(`${url}/admin/users/${id}`, {
      headers: getAuthHeaders()
    });
    
    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * PUT /api/admin/users/{id}/status
 * Change user status (ACTIVE/INACTIVE) (Admin only)
 */
export const updateUserStatus = async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<void> => {
  try {
    console.log('Updating user status:', id, status);
    
    await axios.put(`${url}/admin/users/${id}/status`, null, {
      headers: getAuthHeaders(),
      params: { status }
    });
    
    console.log('User status updated successfully');
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * GET /api/admin/users/{id}/activity
 * Get user activity history (Admin only)
 */
export const getUserActivity = async (id: number): Promise<UserActivity[]> => {
  try {
    console.log('Fetching user activity:', id);
    
    const response = await axios.get<UserActivity[]>(`${url}/admin/users/${id}/activity`, {
      headers: getAuthHeaders()
    });
    
    console.log('User activity response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

