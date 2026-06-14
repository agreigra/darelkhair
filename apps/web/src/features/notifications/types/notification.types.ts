import type { BookingStatus } from '@/components/shared/types';

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_STATUS_CHANGED'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_REJECTED'
  | 'SYSTEM';

export interface NotificationMetadata {
  bookingId?: string;
  reference?: string;
  status?: BookingStatus;
  note?: string | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  metadata: NotificationMetadata | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: AppNotification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}
