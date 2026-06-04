'use client';

import { useLocale } from 'next-intl';
import { StatusBadge } from '@/components/shared/status-badge';
import type { BookingStatusHistoryItem } from '../types/booking.types';

/** Append-only trail of a booking's status transitions (newest last). */
export function BookingStatusTimeline({
  history,
}: {
  history: BookingStatusHistoryItem[];
}) {
  const locale = useLocale();

  if (!history.length) return null;

  return (
    <ol className="space-y-4">
      {history.map((h) => (
        <li key={h.id} className="flex gap-3">
          <div className="mt-1 flex flex-col items-center">
            <span className="size-2.5 rounded-full bg-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={h.toStatus} />
              <time className="text-xs text-muted-foreground">
                {new Date(h.createdAt).toLocaleString(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </time>
            </div>
            {h.note ? (
              <p className="text-sm text-muted-foreground">{h.note}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
