import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const url = import.meta.env.VITE_BASE_URL + 'api';

export interface Template {
  id: number;
  title: string;
  description: string;
  price: number;
  previewImage: string;
  category: string;
  rating: number;
  downloads: number;
}

export interface ActionButton {
  type: 'BUY_NOW' | 'ADD_TO_LIBRARY' | 'VIEW_DETAILS' | 'CANCEL';
  label: string;
  templateId: number;
}

export interface SendMessageRequest {
  sessionId: null;
  message: string;
}

export interface ChatMessageResponse {
  sessionId: string;
  message: string;
  templates: Template[];
  actionButtons: ActionButton[] | null;
  conversationTitle: string | null;
}

export interface ChatMessage {
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: string;
}

export interface ChatSessionResponse {
  sessionId: string;
  conversationTitle: string | null;
  messageCount: number;
  createdAt: string;
  messages: ChatMessage[];
}

export interface PurchaseActionRequest {
  sessionId: string;
  templateId: number;
  action: string;
}

export interface PurchaseActionResponse {
  action: string;
  templateId: number;
  endpoint?: string;
  url?: string;
  message: string;
}

export interface RateLimitError {
  error: string;
  message: string;
  retryAfter: number;
}

/**
 * Send message to AI chat
 * POST /api/chat/message
 */
export const sendChatMessage = async (
  request: SendMessageRequest
): Promise<ChatMessageResponse> => {
  try {
    // Get headers first - this may throw if token is invalid
    let headers;
    try {
      headers = getAuthHeaders();
    } catch (headerError) {
      // If getAuthHeaders throws, it means token is missing or invalid
      const errorMsg = headerError instanceof Error ? headerError.message : 'Authentication failed';
      if (errorMsg.includes('token') || errorMsg.includes('authentication')) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      throw headerError;
    }

    const response = await axios.post<ChatMessageResponse>(
      `${url}/chat/message`,
      request,
      {
        headers
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        const rateLimitError = error.response.data as RateLimitError;
        throw new Error(rateLimitError.message || 'Rate limit exceeded');
      }
      if (error.response?.status === 401) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      const errorMessage = (error.response?.data as { message?: string })?.message;
      throw new Error(errorMessage || 'Failed to send message');
    }
    // Re-throw if it's already our custom error
    if (error instanceof Error && error.message.includes('JWT token')) {
      throw error;
    }
    throw new Error('Failed to send message');
  }
};

/**
 * Get session history
 * GET /api/chat/session/{sessionId}
 */
export const getChatSession = async (
  sessionId: string
): Promise<ChatSessionResponse> => {
  try {
    // Get headers first - this may throw if token is invalid
    let headers;
    try {
      headers = getAuthHeaders();
    } catch (headerError) {
      const errorMsg = headerError instanceof Error ? headerError.message : 'Authentication failed';
      if (errorMsg.includes('token') || errorMsg.includes('authentication')) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      throw headerError;
    }

    const response = await axios.get<ChatSessionResponse>(
      `${url}/chat/session/${sessionId}`,
      {
        headers
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      const errorMessage = (error.response?.data as { message?: string })?.message;
      throw new Error(errorMessage || 'Failed to get session');
    }
    // Re-throw if it's already our custom error
    if (error instanceof Error && error.message.includes('JWT token')) {
      throw error;
    }
    throw new Error('Failed to get session');
  }
};

/**
 * Clear session
 * DELETE /api/chat/session/{sessionId}
 */
export const clearChatSession = async (
  sessionId: string
): Promise<{ message: string }> => {
  try {
    // Get headers first - this may throw if token is invalid
    let headers;
    try {
      headers = getAuthHeaders();
    } catch (headerError) {
      const errorMsg = headerError instanceof Error ? headerError.message : 'Authentication failed';
      if (errorMsg.includes('token') || errorMsg.includes('authentication')) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      throw headerError;
    }

    const response = await axios.delete<{ message: string }>(
      `${url}/chat/session/${sessionId}`,
      {
        headers
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      const errorMessage = (error.response?.data as { message?: string })?.message;
      throw new Error(errorMessage || 'Failed to clear session');
    }
    // Re-throw if it's already our custom error
    if (error instanceof Error && error.message.includes('JWT token')) {
      throw error;
    }
    throw new Error('Failed to clear session');
  }
};

/**
 * Handle purchase action
 * POST /api/chat/purchase-action
 */
export const handlePurchaseAction = async (
  request: PurchaseActionRequest
): Promise<PurchaseActionResponse> => {
  try {
    // Get headers first - this may throw if token is invalid
    let headers;
    try {
      headers = getAuthHeaders();
    } catch (headerError) {
      const errorMsg = headerError instanceof Error ? headerError.message : 'Authentication failed';
      if (errorMsg.includes('token') || errorMsg.includes('authentication')) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      throw headerError;
    }

    const response = await axios.post<PurchaseActionResponse>(
      `${url}/chat/purchase-action`,
      request,
      {
        headers
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('JWT token is invalid or expired. Please log in again.');
      }
      const errorMessage = (error.response?.data as { message?: string })?.message;
      throw new Error(errorMessage || 'Failed to handle action');
    }
    // Re-throw if it's already our custom error
    if (error instanceof Error && error.message.includes('JWT token')) {
      throw error;
    }
    throw new Error('Failed to handle action');
  }
};

