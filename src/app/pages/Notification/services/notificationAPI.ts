import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const url = import.meta.env.VITE_BASE_URL + 'api';

// use shared auth headers to support session/local tokens

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationsResponse {
  content: Notification[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (page: number = 0, size: number = 20): Promise<NotificationsResponse> => {
  try {
    const response = await axios.get<NotificationsResponse>(`${url}/notifications`, {
      headers: getAuthHeaders(),
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    await axios.put(
      `${url}/notifications/${notificationId}/read`,
      {},
      {
        headers: getAuthHeaders()
      }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await axios.put(
      `${url}/notifications/read-all`,
      {},
      {
        headers: getAuthHeaders()
      }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Optionally send a notification (backend may or may not expose this)
 * We attempt a POST to /api/admin/notifications or /api/notifications
 * and swallow 404/405 errors so UI flow is not broken in environments
 * where sending is not enabled yet.
 */
export interface SendNotificationRequest {
  username?: string; // target user by username (admin flows)
  userId?: number;   // alternative target by userId
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
}

export const trySendNotification = async (payload: SendNotificationRequest): Promise<boolean> => {
  const endpoints = [
    `${url}/admin/notifications`,
    `${url}/notifications`
  ];

  for (const endpoint of endpoints) {
    try {
      await axios.post(endpoint, payload, { headers: getAuthHeaders() });
      return true;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        if (status && (status === 404 || status === 405)) {
          // Endpoint not available; try next
          continue;
        }
      }
      // Other errors mean endpoint exists but failed, stop trying
      break;
    }
  }
  return false;
};

