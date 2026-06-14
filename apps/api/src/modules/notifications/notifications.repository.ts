import { Injectable } from '@nestjs/common';
import type { Notification, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  /** Paginated list for a user + the total and unread counts in one round-trip. */
  async list(params: {
    userId: string;
    skip: number;
    take: number;
    unreadOnly?: boolean;
  }): Promise<{ items: Notification[]; total: number; unreadCount: number }> {
    const where: Prisma.NotificationWhereInput = { userId: params.userId };
    if (params.unreadOnly) where.isRead = false;

    const [items, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId: params.userId, isRead: false },
      }),
    ]);
    return { items, total, unreadCount };
  }

  unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /** Mark one notification read — scoped to the owner so users can't touch others'. */
  markRead(id: string, userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.updateMany({
      where: { id, userId, isRead: false },
      data: { isRead: true },
    });
  }

  markAllRead(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
