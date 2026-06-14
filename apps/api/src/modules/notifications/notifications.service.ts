import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  NotificationType,
  type BookingStatus,
  type Notification,
} from '@prisma/client';
import { NotificationsRepository } from './notifications.repository';
import { NotificationQueryDto } from './dto/notification-query.dto';
import type {
  NotificationDto,
  NotificationMetadata,
  PaginatedNotifications,
} from './types/notification.types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly repo: NotificationsRepository) {}

  // ── event emitters (called by other features) ──
  // Failures are swallowed + logged so a notification problem never breaks the
  // user-facing operation that triggered it (same rule as the audit log).

  async notifyBookingCreated(
    userId: string,
    data: { bookingId: string; reference: string; status: BookingStatus },
  ): Promise<void> {
    await this.emit(userId, NotificationType.BOOKING_CREATED, data.reference, {
      bookingId: data.bookingId,
      reference: data.reference,
      status: data.status,
    });
  }

  async notifyBookingStatusChanged(
    userId: string,
    data: {
      bookingId: string;
      reference: string;
      status: BookingStatus;
      note?: string | null;
    },
  ): Promise<void> {
    await this.emit(
      userId,
      NotificationType.BOOKING_STATUS_CHANGED,
      data.reference,
      {
        bookingId: data.bookingId,
        reference: data.reference,
        status: data.status,
        note: data.note ?? null,
      },
    );
  }

  // ── user-facing queries ──

  async list(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<PaginatedNotifications> {
    const { items, total, unreadCount } = await this.repo.list({
      userId,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      unreadOnly: query.unreadOnly,
    });
    return {
      items: items.map((n) => this.toDto(n)),
      total,
      page: query.page,
      pageSize: query.pageSize,
      unreadCount,
    };
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    return { count: await this.repo.unreadCount(userId) };
  }

  async markRead(userId: string, id: string): Promise<NotificationDto> {
    const existing = await this.repo.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    await this.repo.markRead(id, userId);
    return this.toDto({ ...existing, isRead: true });
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const { count } = await this.repo.markAllRead(userId);
    return { updated: count };
  }

  // ── internals ──

  private async emit(
    userId: string,
    type: NotificationType,
    title: string,
    metadata: NotificationMetadata,
  ): Promise<void> {
    try {
      await this.repo.create({
        user: { connect: { id: userId } },
        type,
        title,
        metadata: metadata as object,
      });
    } catch (err) {
      this.logger.warn(
        `Failed to create ${type} notification for user ${userId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private toDto(n: Notification): NotificationDto {
    return {
      id: n.id,
      type: n.type,
      isRead: n.isRead,
      metadata: (n.metadata as NotificationMetadata | null) ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  }
}
