import axios from 'axios';

const url = import.meta.env.VITE_BASE_URL + 'api';

// Add axios interceptor to handle OAuth2 redirects
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if the error response contains an OAuth2 redirect
      const redirectUrl = error.response?.headers?.location;
      if (redirectUrl && redirectUrl.includes('oauth2/authorization/google')) {
        // Force HTTPS for OAuth2 redirects
        const httpsRedirectUrl = redirectUrl.replace('http://', 'https://');
        console.log('🔄 Redirecting to OAuth2 with HTTPS:', httpsRedirectUrl);
        window.location.href = httpsRedirectUrl;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

interface Category {
  id: number;
  name: string;
}

interface Author {
  id: number;
  username: string;
}

export interface Template {
  id: number;
  title: string;
  description: string;
  price: number;
  fileUrl: string;
  category: Category;
  author: Author;
  status?: 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
}

interface TemplatesResponse {
  content: Template[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

interface CreateTemplateRequest {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  file: File;
}

interface UploadTemplateRequest {
  file: File;
  title: string;
  description: string;
  price: string;
  categoryId: string;
  isPremium?: boolean;
}

interface UpdateTemplateRequest {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  status?: 'PUBLISHED' | 'PENDING' | 'REJECTED' | 'APPROVED';
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication required. Please login again.');
  }
  
  // Check if token is expired (basic check)
  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    console.log('🔐 Token payload:', tokenData);
    console.log('🔐 Token roles/authorities:', tokenData.authorities || tokenData.roles || 'No roles found');
    
    // Check if user has admin role in token
    const tokenRoles = tokenData.authorities || tokenData.roles || [];
    const hasAdminRole = Array.isArray(tokenRoles) && tokenRoles.some((role: string | { authority: string }) => 
      role === 'ROLE_ADMIN' || (typeof role === 'object' && role.authority === 'ROLE_ADMIN') || role === 'ADMIN'
    );
    
    if (!hasAdminRole) {
      console.warn('⚠️ User does not have admin role in token. Available roles:', tokenRoles);
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
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  };
};

// Get all templates (with optional status filter)
export const getAllTemplates = async (status?: string, page: number = 0, size: number = 20): Promise<TemplatesResponse> => {
  try {
    // Use the admin-specific endpoint
    let fullUrl = `${url}/admin/templates?page=${page}&size=${size}`;
    if (status) {
      fullUrl += `&status=${status}`;
    }
    
    console.log('GET Admin Templates URL:', fullUrl);
    
    const response = await axios.get<TemplatesResponse>(fullUrl, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('Admin Templates Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin templates:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
    }
    throw error;
  }
};

// Get template by ID
export const getTemplateById = async (id: number): Promise<Template> => {
  try {
    const response = await axios.get<Template>(`${url}/templates/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
};

// Create new template (Seller/Admin)
export const createTemplate = async (data: CreateTemplateRequest): Promise<Template> => {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('categoryId', data.categoryId.toString());
    formData.append('file', data.file);

    // Check if current user is admin and automatically set status to PUBLISHED
    const userRolesString = localStorage.getItem('userRoles');
    let userRoles: string[] = [];
    try {
      userRoles = userRolesString ? JSON.parse(userRolesString) : [];
    } catch (error) {
      console.error('Error parsing user roles:', error);
    }

    const isAdmin = userRoles.includes('ROLE_ADMIN');
    if (isAdmin) {
      formData.append('status', 'PUBLISHED');
      console.log('Admin user detected - setting template status to PUBLISHED automatically');
    }

    console.log('Creating template with data:', {
      title: data.title,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      fileName: data.file.name,
      isAdmin: isAdmin,
      status: isAdmin ? 'PUBLISHED' : 'PENDING_REVIEW'
    });

    const response = await axios.post<Template>(`${url}/templates`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Template created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

// Update template (Admin)
export const updateTemplate = async (id: number, data: UpdateTemplateRequest): Promise<Template> => {
  try {
    // Use template controller for template updates
    const response = await axios.put<Template>(`${url}/templates/${id}`, data, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('Template updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating template:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Template not found.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid template data';
        throw new Error(`Bad Request: ${errorMessage}`);
      }
    }
    throw error;
  }
};

// Delete template
export const deleteTemplate = async (id: number): Promise<void> => {
  try {
    const fullUrl = `${url}/templates/${id}`;
    console.log('🗑️ DELETE Template URL:', fullUrl);

    const headers = getAuthHeaders();
    console.log('🗑️ Headers being sent:', headers);

    await axios.delete(fullUrl, {
      headers: headers,
      timeout: 10000,
      maxRedirects: 0  // Prevent automatic redirects
    });

    console.log('✅ Template deleted successfully:', id);
  } catch (error) {
    console.error('❌ Error deleting template:', error);

    if (axios.isAxiosError(error)) {
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);

      if (error.code === 'ERR_FOLLOW_REDIRECT' || error.message.includes('redirect')) {
        console.error('❌ Server is redirecting to OAuth - authentication failed');
        throw new Error('Server redirected to login. Your session may have expired.');
      }

      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Template not found.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Cannot delete template';
        throw new Error(`Bad Request: ${errorMessage}`);
      }
    }
    throw error;
  }
};

// Update template status via admin status endpoint
export const updateTemplateStatus = async (
  id: number,
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'
): Promise<void> => {
  try {
    const fullUrl = `${url}/admin/templates/${id}/status?status=${encodeURIComponent(status)}`;
    await axios.put(fullUrl, {}, { headers: getAuthHeaders(), timeout: 10000 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Invalid status value';
        throw new Error(`Bad Request: ${message}`);
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      if (error.response?.status === 404) {
        throw new Error('Template not found.');
      }
    }
    throw error;
  }
};

// Approve template (set status to PUBLISHED)
export const approveTemplate = async (id: number): Promise<void> => {
  return updateTemplateStatus(id, 'PUBLISHED');
};

// Reject template (set status to REJECTED)
export const rejectTemplate = async (id: number): Promise<void> => {
  return updateTemplateStatus(id, 'REJECTED');
};

// Get categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(`${url}/templates/categories`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Download template file
// GET /api/templates/{id}/download
// Returns both the blob and the filename from Content-Disposition header
export const downloadTemplate = async (id: number): Promise<{ blob: Blob; filename: string }> => {
  try {
    const response = await axios.get(`${url}/templates/${id}/download`, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'template.file';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        filename = decodeURIComponent(filename);
      }
      
      const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.*)/);
      if (filenameStarMatch && filenameStarMatch[1]) {
        filename = decodeURIComponent(filenameStarMatch[1]);
      }
    }
    
    console.log('📎 Admin extracted filename:', filename);
    
    return {
      blob: response.data,
      filename: filename
    };
  } catch (error) {
    console.error('Error downloading template:', error);
    throw error;
  }
};

// Get template preview images
export const getTemplatePreview = async (id: number): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(`${url}/templates/${id}/preview`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching template preview:', error);
    throw error;
  }
};

// Get popular templates
export const getPopularTemplates = async (): Promise<Template[]> => {
  try {
    const response = await axios.get<Template[]>(`${url}/templates/popular`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular templates:', error);
    throw error;
  }
};

// Upload template with file (Admin)
export const uploadTemplate = async (data: UploadTemplateRequest): Promise<Template> => {
  try {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('categoryId', data.categoryId);
    formData.append('isPremium', (data.isPremium || false).toString());

    // Check if current user is admin and automatically set status to PUBLISHED
    const userRolesString = localStorage.getItem('userRoles');
    let userRoles: string[] = [];
    try {
      userRoles = userRolesString ? JSON.parse(userRolesString) : [];
    } catch (error) {
      console.error('Error parsing user roles:', error);
    }

    const isAdmin = userRoles.includes('ROLE_ADMIN');
    if (isAdmin) {
      formData.append('status', 'PUBLISHED');
      console.log('Admin user detected - setting template status to PUBLISHED automatically');
    }

    console.log('Uploading template with data:', {
      title: data.title,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      isPremium: data.isPremium,
      fileName: data.file.name,
      isAdmin: isAdmin,
      status: isAdmin ? 'PUBLISHED' : 'PENDING_REVIEW'
    });

    const response = await axios.post<Template>(`${url}/templates/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Template uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading template:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Upload error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error during upload. Please try again.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please choose a smaller file.');
      } else if (error.response?.data?.message) {
        throw new Error(`Upload failed: ${error.response.data.message}`);
      }
    }
    
    throw error;
  }
};

