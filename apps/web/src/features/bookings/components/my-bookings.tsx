'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingCard } from '@/components/shared/booking-card';
import { localized } from '@/lib/i18n-content';
import { useMyBookings } from '../hooks/use-bookings';
import { BOOKING_STATUSES, formatDate } from '../lib/booking-ui';
import type { Booking, BookingStatus } from '../types/booking.types';

const PAGE_SIZE = 10;

export function MyBookings() {
  const t = useTranslations('bookings.list');
  const tStatus = useTranslations('status');
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | undefined>();

  const { data, isLoading } = useMyBookings({
    page,
    pageSize: PAGE_SIZE,
    status,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  function pick(next: BookingStatus | undefined) {
    setStatus(next);
    setPage(1);
  }

  function toSummary(b: Booking) {
    return {
      id: b.id,
      reference: b.reference,
      apartmentTitle: localized(b.apartment.title, locale),
      checkIn: formatDate(b.checkIn, locale),
      checkOut: formatDate(b.checkOut, locale),
      guests: b.guests,
      totalPrice: b.totalPrice,
      status: b.status,
    };
  }

  return (
    <div className="space-y-6">
      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={status ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => pick(undefined)}
        >
          {t('all')}
        </Button>
        {BOOKING_STATUSES.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => pick(s)}
          >
            {tStatus(s)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t('empty')}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`} className="block">
                <BookingCard booking={toSummary(b)} />
              </Link>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('prev')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('pageOf', { page, total: totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('next')}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
