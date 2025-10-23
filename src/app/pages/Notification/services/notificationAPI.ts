import axios from 'axios';

const url = import.meta.env.VITE_BASE_URL + 'api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

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

