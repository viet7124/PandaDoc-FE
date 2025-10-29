import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const url = import.meta.env.VITE_BASE_URL + 'api';
const baseUrl = import.meta.env.VITE_BASE_URL;

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  roles: string[];
  name?: string;
  avatar?: string;
  status?: string;
  createdAt?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
}

// Use shared auth header builder that supports session/local storage

/**
 * Helper function to construct full avatar URL
 * If avatar starts with http/https, return as is
 * Otherwise, prepend the base URL
 */
export const getAvatarUrl = (avatar?: string): string | undefined => {
  if (!avatar) return undefined;
  
  // If already a full URL, return it
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // If it's a relative path, prepend base URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = avatar.startsWith('/') ? avatar.substring(1) : avatar;
  return `${baseUrl}${cleanPath}`;
};

/**
 * GET /api/users/me/profile
 * Get logged in user's detailed information
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    console.log('Fetching current user from:', `${url}/users/me/profile`);
    
    const response = await axios.get<UserProfile>(`${url}/users/me/profile`, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Current user response:', response.data);
    console.log('✅ Avatar value from API:', response.data.avatar);
    console.log('✅ Full avatar URL:', getAvatarUrl(response.data.avatar));
    
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * PUT /api/users/me/profile
 * Update personal information (name, avatarFile) using form data
 */
export const updateProfile = async (
  name: string,
  avatar?: File
): Promise<UserProfile> => {
  try {
    console.log('🔄 Updating profile:', { name, hasAvatar: !!avatar });
    
    const formData = new FormData();
    formData.append('name', name);
    
    if (avatar) {
      // Backend expects 'avatarFile' as the field name for the file upload
      formData.append('avatarFile', avatar);
      console.log('📎 Avatar file added to FormData:', {
        name: avatar.name,
        type: avatar.type,
        size: avatar.size,
        sizeInMB: (avatar.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }
    
    console.log('📤 Sending request to:', `${url}/users/me/profile`);
    
    const response = await axios.put<UserProfile>(`${url}/users/me/profile`, formData, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Update profile response:', response.data);
    console.log('✅ New avatar value:', response.data.avatar);
    console.log('✅ Full avatar URL:', getAvatarUrl(response.data.avatar));
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API Error:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
    }
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};

