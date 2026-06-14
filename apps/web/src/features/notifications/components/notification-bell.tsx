'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/use-notifications';
import { NotificationItem } from './notification-item';
import type { AppNotification } from '../types/notification.types';

/** Header bell: unread badge + a dropdown of recent notifications. */
export function NotificationBell() {
  const t = useTranslations('notifications');
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  // Hidden for anonymous visitors (the query is also disabled when signed out).
  if (!isAuthenticated) return null;

  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;

  function onSelect(n: AppNotification) {
    if (!n.isRead) markRead.mutate(n.id);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t('title')}
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold leading-4 text-brand-orange-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-semibold">{t('title')}</span>
          {unread > 0 ? (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              {t('markAllRead')}
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          <div className="max-h-96 divide-y overflow-y-auto">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
