'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/components/shared/types';
import type { AppNotification } from '../types/notification.types';

/** Pick the localized message for a notification from its type + status. */
function useMessage(n: AppNotification): string {
  const t = useTranslations('notifications.messages');
  const reference = n.metadata?.reference ?? '';
  if (n.type === 'BOOKING_CREATED') return t('created', { reference });
  if (n.type === 'BOOKING_STATUS_CHANGED' && n.metadata?.status) {
    return t(n.metadata.status, { reference });
  }
  return t('generic', { reference });
}

const STATUS_ICON: Record<BookingStatus, LucideIcon> = {
  PENDING: Clock,
  WAITING_PAYMENT: Clock,
  PROOF_SUBMITTED: FileCheck,
  CONFIRMED: CheckCircle2,
  CANCELLED: XCircle,
};

const STATUS_TONE: Record<BookingStatus, string> = {
  PENDING: 'text-muted-foreground',
  WAITING_PAYMENT: 'text-warning',
  PROOF_SUBMITTED: 'text-primary',
  CONFIRMED: 'text-success',
  CANCELLED: 'text-destructive',
};

/** Relative time like "3h", "2d", falling back to a localized date. */
function useRelativeTime(iso: string): string {
  const locale = useLocale();
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (mins < 1) return rtf.format(0, 'minute');
  if (mins < 60) return rtf.format(-mins, 'minute');
  const hours = Math.round(mins / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(then);
}

export function NotificationItem({
  notification,
  onSelect,
}: {
  notification: AppNotification;
  onSelect: (n: AppNotification) => void;
}) {
  const message = useMessage(notification);
  const time = useRelativeTime(notification.createdAt);
  const status = notification.metadata?.status;
  const Icon = status ? STATUS_ICON[status] : Bell;
  const tone = status ? STATUS_TONE[status] : 'text-muted-foreground';
  const bookingId = notification.metadata?.bookingId;

  const content = (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon className={cn('mt-0.5 size-5 shrink-0', tone)} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm leading-snug',
            !notification.isRead && 'font-medium',
          )}
        >
          {message}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{time}</p>
      </div>
      {!notification.isRead ? (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      ) : null}
    </div>
  );

  const className = cn(
    'block w-full text-start transition-colors hover:bg-accent',
    !notification.isRead && 'bg-accent/40',
  );

  if (bookingId) {
    return (
      <Link
        href={`/bookings/${bookingId}`}
        className={className}
        onClick={() => onSelect(notification)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => onSelect(notification)}
    >
      {content}
    </button>
  );
}
