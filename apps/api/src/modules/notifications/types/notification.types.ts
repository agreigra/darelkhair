import type { BookingStatus, NotificationType } from '@prisma/client';

/** Structured payload stored on each notification, used by the client to render + link. */
export interface NotificationMetadata {
  bookingId?: string;
  reference?: string;
  status?: BookingStatus;
  note?: string | null;
}

/** Notification shape returned to the client (rendered/localized on the frontend). */
export interface NotificationDto {
  id: string;
  type: NotificationType;
  isRead: boolean;
  metadata: NotificationMetadata | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: NotificationDto[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}
