'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { localized } from '@/lib/i18n-content';
import { useAdminBookings } from '../hooks/use-admin-bookings';
import { BOOKING_STATUSES, formatDate } from '../lib/booking-ui';
import type { Booking, BookingFilters, BookingStatus } from '../types/booking.types';

const PAGE_SIZE = 10;

export function AdminBookingsTable() {
  const t = useTranslations('bookings.admin');
  const tStatus = useTranslations('status');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const filters: BookingFilters = {
    page,
    pageSize: PAGE_SIZE,
    status,
    search: debounced || undefined,
  };
  const { data, isLoading, isPlaceholderData } = useAdminBookings(filters);

  function guestName(b: Booking): string {
    const u = b.user;
    if (!u) return '—';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return name || u.email;
  }

  const columns: DataTableColumn<Booking>[] = [
    {
      key: 'reference',
      header: t('columns.reference'),
      cell: (b) => <span className="font-mono text-xs">{b.reference}</span>,
    },
    {
      key: 'apartment',
      header: t('columns.apartment'),
      cell: (b) => (
        <span className="font-medium">{localized(b.apartment.title, locale)}</span>
      ),
    },
    {
      key: 'guest',
      header: t('columns.guest'),
      cell: (b) => guestName(b),
    },
    {
      key: 'dates',
      header: t('columns.dates'),
      cell: (b) =>
        `${formatDate(b.checkIn, locale)} → ${formatDate(b.checkOut, locale)}`,
    },
    {
      key: 'total',
      header: t('columns.total'),
      cell: (b) => b.totalPrice,
    },
    {
      key: 'status',
      header: t('columns.status'),
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20 text-end',
      cell: (b) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/bookings/${b.id}`}>{t('manage')}</Link>
        </Button>
      ),
    },
  ];

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="ps-9"
          />
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={status ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => {
            setStatus(undefined);
            setPage(1);
          }}
        >
          {t('all')}
        </Button>
        {BOOKING_STATUSES.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {tStatus(s)}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(b) => b.id}
        isLoading={isLoading}
        emptyMessage={t('empty')}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('total', { count: total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1 || isPlaceholderData}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <span>{t('pageOf', { page, total: totalPages })}</span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages || isPlaceholderData}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
