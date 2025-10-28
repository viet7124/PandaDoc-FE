import axios from 'axios';

const url = import.meta.env.VITE_BASE_URL + 'api'

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
  rating?: number;
  reviewCount?: number;
  downloads?: number;
  documentType?: string;
  slides?: number;
  fileSize?: string;
  features?: string[];
  images?: string[];
  isPurchased?: boolean; // Indicates if the current user has purchased this template
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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
};

export const getTemplates = async (): Promise<TemplatesResponse> => {
  try {
    const fullUrl = `${url}/templates`;
    console.log('GET Templates URL:', fullUrl);
    
    const response = await axios.get<TemplatesResponse>(fullUrl, {
      headers: getAuthHeaders()
    });
    
    console.log('Templates Response Status:', response.status);
    console.log('Templates Response Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const fullUrl = `${url}/templates/categories`;
    console.log('GET Categories URL:', fullUrl);
    
    const response = await axios.get<Category[]>(fullUrl, {
      headers: getAuthHeaders()
    });
    
    console.log('Categories Response Status:', response.status);
    console.log('Categories Response Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

/**
 * GET /api/templates/{id}
 * Get template by ID
 */
export const getTemplateById = async (id: number): Promise<Template> => {
  try {
    const fullUrl = `${url}/templates/${id}`;
    console.log('GET Template by ID URL:', fullUrl);
    
    const response = await axios.get<Template>(fullUrl, {
      headers: getAuthHeaders()
    });
    
    console.log('Template Response:', response.data);
    console.log('🖼️ Template Images:', response.data.images);
    console.log('🖼️ Images Count:', response.data.images?.length || 0);
    console.log('🖼️ Images Array:', JSON.stringify(response.data.images));
    return response.data;
  } catch (error) {
    console.error('Error fetching template:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

/**
 * GET /api/templates/{id}/download
 * Download template file (requires purchase or admin)
 * Returns both the blob and the filename from Content-Disposition header
 */
export const downloadTemplate = async (id: number): Promise<{ blob: Blob; filename: string }> => {
  try {
    const fullUrl = `${url}/templates/${id}/download`;
    console.log('GET Download Template URL:', fullUrl);
    
    const response = await axios.get(fullUrl, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });
    
    console.log('Download Response:', response);
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'template.file';
    
    if (contentDisposition) {
      // Try to extract filename from Content-Disposition header
      // Format: attachment; filename="filename.ext" or filename*=UTF-8''filename.ext
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        // Decode URI encoded filename
        filename = decodeURIComponent(filename);
      }
      
      // Also try filename* for UTF-8 encoded filenames
      const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.*)/);
      if (filenameStarMatch && filenameStarMatch[1]) {
        filename = decodeURIComponent(filenameStarMatch[1]);
      }
    }
    
    console.log('📎 Extracted filename:', filename);
    
    return {
      blob: response.data,
      filename: filename
    };
  } catch (error) {
    console.error('Error downloading template:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

/**
 * POST /api/purchases
 * Purchase a template
 */
// PayOS Response interface
export interface PayOSResponse {
  orderId: string;
  paymentUrl: string;
  qrCode: string;
  status: string;
}

export const purchaseTemplate = async (templateId: number): Promise<PayOSResponse> => {
  try {
    const fullUrl = `${url}/purchases`;
    console.log('POST Purchase Template URL:', fullUrl);
    console.log('Request body:', { templateId });
    
    const response = await axios.post(fullUrl, { templateId }, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Template purchase order created successfully');
    
    // Create PayOS response object
    const payosResponse: PayOSResponse = {
      orderId: response.data.orderId,
      paymentUrl: response.data.paymentUrl,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(response.data.paymentUrl)}`,
      status: 'PENDING'
    };
    
    return payosResponse;
  } catch (error) {
    console.error('Error purchasing template:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

// Payment verification interface
export interface PaymentVerificationResponse {
  orderId: string;
  paymentStatus: 'PAID' | 'PENDING' | 'CANCELLED' | 'FAILED';
  message: string;
  templateId?: number;
  templateTitle?: string;
}

/**
 * POST /api/payments/complete/{orderId}
 * Complete payment and mark template as purchased
 */
export const completePayment = async (orderId: string): Promise<PaymentVerificationResponse> => {
  try {
    const fullUrl = `${url}/payments/complete/${orderId}`;
    console.log('POST Payment Complete URL:', fullUrl);
    
    const response = await axios.post(fullUrl, {}, {
      headers: {
        ...getAuthHeaders()
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Payment completion successful:', response.data);
    
    // Since the API returns empty {}, we'll create a success response
    return {
      orderId: orderId,
      paymentStatus: 'PAID',
      message: 'Payment completed successfully',
      templateId: undefined, // Backend doesn't return templateId in response
      templateTitle: undefined
    };
  } catch (error) {
    console.error('Error completing payment:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      // Handle network errors
      if (error.code === 'ERR_INTERNET_DISCONNECTED' || error.code === 'ERR_NETWORK') {
        throw new Error('Network error: Unable to connect to payment completion service');
      }
      
      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: Payment completion took too long');
      }
    }
    throw error;
  }
};

// Keep the old verifyPayment function for backward compatibility
export const verifyPayment = async (orderCode: string): Promise<PaymentVerificationResponse> => {
  // Use the new completePayment API instead
  return await completePayment(orderCode);
};

// ============== Preview Images ==============

/**
 * GET /api/templates/{id}/preview
 * Get preview image URL
 */
export const getTemplatePreview = async (id: number): Promise<string> => {
  try {
    const fullUrl = `${url}/templates/${id}/preview`;
    console.log('GET Template Preview URL:', fullUrl);
    
    const response = await axios.get<string>(fullUrl, {
      headers: getAuthHeaders()
    });
    
    console.log('Preview Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching preview:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

/**
 * GET /api/templates/{id}/preview-images
 * Get all preview images for a template
 * Returns an array of image URLs
 * Note: This endpoint requires backend configuration to allow access for regular users
 */
export const getPreviewImages = async (id: number): Promise<string[]> => {
  try {
    const fullUrl = `${url}/templates/${id}/preview`;
    console.log('🔍 GET Preview Images URL:', fullUrl);
    
    const response = await axios.get<string[]>(fullUrl, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Preview Images Response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching preview images:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      // If 404, return empty array (no images uploaded yet)
      if (error.response?.status === 404) {
        console.log('ℹ️ No preview images found for template:', id);
        return [];
      }
      
      // If 403, this is a permission issue on the backend
      if (error.response?.status === 403) {
        console.error('🚫 403 Forbidden: Backend is blocking access to preview images for non-admin users');
        console.error('⚠️ BACKEND ACTION REQUIRED: Configure the backend to allow GET /api/templates/{id}/preview-images for all authenticated users');
        return [];
      }
    }
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * POST /api/templates/{id}/preview-images
 * Upload preview images for a template
 * @param id - Template ID
 * @param files - Array of image files to upload
 */
export const uploadPreviewImages = async (id: number, files: File[]): Promise<void> => {
  try {
    // Enforce a maximum of 4 images client-side
    const limitedFiles = files.slice(0, 4);
    const fullUrl = `${url}/templates/${id}/preview-images`;
    console.log('POST Preview Images URL:', fullUrl);
    console.log('Number of files (limited to 4):', limitedFiles.length);
    
    const formData = new FormData();
    limitedFiles.forEach((file, index) => {
      // Use 'files' as the field name (match backend expectation)
      formData.append('files', file);
      console.log(`Added file ${index + 1}:`, {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });
    });
    
    const token = localStorage.getItem('token');
    console.log('Token present:', !!token);
    
    const response = await axios.post(fullUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        // Note: Don't set Content-Type for FormData, let browser set it with boundary
      }
    });
    
    console.log('✅ Preview images uploaded successfully:', response.data);
  } catch (error) {
    console.error('❌ Error uploading preview images:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request headers:', error.config?.headers);
      
      // Provide more specific error messages
      if (error.response?.status === 403) {
        throw new Error('Permission denied. You may not have access to upload images for this template.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 413) {
        throw new Error('Files too large. Each image must be under 3MB.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error;
  }
};

// ============== Reviews ==============

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  username: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

/**
 * GET /api/templates/{id}/reviews
 * Get all reviews for a template
 */
export const getTemplateReviews = async (id: number): Promise<Review[]> => {
  try {
    const fullUrl = `${url}/templates/${id}/reviews`;
    console.log('GET Template Reviews URL:', fullUrl);
    
    const response = await axios.get<Review[]>(fullUrl, {
      headers: getAuthHeaders()
    });
    
    console.log('Reviews Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

/**
 * POST /api/templates/{id}/reviews
 * Post a review for a template
 */
export const postTemplateReview = async (
  id: number,
  reviewData: CreateReviewRequest
): Promise<void> => {
  try {
    const fullUrl = `${url}/templates/${id}/reviews`;
    console.log('POST Template Review URL:', fullUrl);
    console.log('Review data:', reviewData);
    
    await axios.post(fullUrl, reviewData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Review posted successfully');
  } catch (error) {
    console.error('Error posting review:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

