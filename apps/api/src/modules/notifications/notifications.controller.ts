import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import type {
  NotificationDto,
  PaginatedNotifications,
} from './types/notification.types';

/** A signed-in user's own notifications (bell + list). */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotifications> {
    return this.notifications.list(userId, query);
  }

  @Get('unread-count')
  unreadCount(
    @CurrentUser('id') userId: string,
  ): Promise<{ count: number }> {
    return this.notifications.unreadCount(userId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllRead(
    @CurrentUser('id') userId: string,
  ): Promise<{ updated: number }> {
    return this.notifications.markAllRead(userId);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<NotificationDto> {
    return this.notifications.markRead(userId, id);
  }
}
