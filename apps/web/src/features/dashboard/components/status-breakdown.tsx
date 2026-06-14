'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import type { BookingStatus } from '@/components/shared/types';

const ORDER: BookingStatus[] = [
  'WAITING_PAYMENT',
  'PROOF_SUBMITTED',
  'CONFIRMED',
  'HONORED',
  'CANCELLED',
];

const BAR_TONE: Record<BookingStatus, string> = {
  WAITING_PAYMENT: 'bg-warning',
  PROOF_SUBMITTED: 'bg-primary',
  CONFIRMED: 'bg-success',
  HONORED: 'bg-brand-gold',
  CANCELLED: 'bg-destructive',
};

/** Booking counts per status with proportional bars. */
export function StatusBreakdown({
  byStatus,
  total,
}: {
  byStatus: Record<BookingStatus, number>;
  total: number;
}) {
  const t = useTranslations('dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('byStatusTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ORDER.map((status) => {
          const count = byStatus[status] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status} className="flex items-center gap-3">
              <div className="w-32 shrink-0">
                <StatusBadge status={status} />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${BAR_TONE[status]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-end text-sm font-medium tabular-nums">
                {count}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
