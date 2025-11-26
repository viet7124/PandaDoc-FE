import axios from 'axios';
import { getAuthHeaders } from '../utils/authUtils';

const rawBase: string = import.meta.env.VITE_BASE_URL || '';
const normalizedBase: string = rawBase ? rawBase.replace(/\/?$/, '/') : '';
const url = `${normalizedBase}api`;

export type ChatRole = 'USER' | 'ASSISTANT';

export interface ChatTemplate {
  id: number;
  title: string;
  description: string;
  price: number;
  fileUrl?: string;
  previewImage?: string;
  category?: string;
  rating?: number;
  downloads?: number;
}

export interface ChatActionButton {
  type: 'BUY_NOW' | 'ADD_TO_LIBRARY' | 'VIEW_DETAILS' | 'CANCEL';
  label: string;
  templateId: number;
}

export interface ChatMessageResponse {
  sessionId: string;
  message: string;
  templates?: ChatTemplate[];
  actionButtons?: ChatActionButton[] | null;
  conversationTitle?: string | null;
}

export interface SendChatRequest {
  message: string;
  sessionId?: string | null;
}

export const sendChatMessage = async (payload: SendChatRequest): Promise<ChatMessageResponse> => {
  const body = {
    sessionId: payload.sessionId ?? null,
    message: payload.message,
  };

  const response = await axios.post<ChatMessageResponse>(`${url}/chat/message`, body, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return response.data;
};


