import { apiClient, unwrap } from '@/lib/api-client';
import type {
  AppNotification,
  PaginatedNotifications,
} from '../types/notification.types';

export const notificationsApi = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  }): Promise<PaginatedNotifications> {
    const { data } = await apiClient.get('/notifications', { params });
    return unwrap<PaginatedNotifications>(data);
  },

  async markRead(id: string): Promise<AppNotification> {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return unwrap<AppNotification>(data);
  },

  async markAllRead(): Promise<{ updated: number }> {
    const { data } = await apiClient.patch('/notifications/read-all');
    return unwrap<{ updated: number }>(data);
  },
};
