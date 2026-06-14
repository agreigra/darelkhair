'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { localized } from '@/lib/i18n-content';
import type { DashboardRecentBooking } from '../types/dashboard.types';

export function RecentBookings({ rows }: { rows: DashboardRecentBooking[] }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale],
  );

  const columns: DataTableColumn<DashboardRecentBooking>[] = [
    {
      key: 'reference',
      header: t('recent.reference'),
      cell: (b) => (
        <Link
          href={`/admin/bookings/${b.id}`}
          className="font-medium text-primary hover:underline"
        >
          {b.reference}
        </Link>
      ),
    },
    {
      key: 'guest',
      header: t('recent.guest'),
      cell: (b) => (
        <div className="flex flex-col">
          <span>{b.guestName ?? '—'}</span>
          <span className="text-xs text-muted-foreground">{b.guestEmail}</span>
        </div>
      ),
    },
    {
      key: 'apartment',
      header: t('recent.apartment'),
      cell: (b) =>
        b.apartmentTitle ? localized(b.apartmentTitle, locale) : '—',
    },
    {
      key: 'dates',
      header: t('recent.dates'),
      cell: (b) =>
        `${dateFmt.format(new Date(b.checkIn))} → ${dateFmt.format(
          new Date(b.checkOut),
        )}`,
      className: 'text-muted-foreground whitespace-nowrap',
    },
    {
      key: 'status',
      header: t('recent.status'),
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: 'total',
      header: t('recent.total'),
      cell: (b) => (
        <span className="font-medium tabular-nums">
          {new Intl.NumberFormat(locale).format(b.totalPrice)}
        </span>
      ),
      className: 'text-end',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t('recent.title')}</CardTitle>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t('recent.viewAll')}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(b) => b.id}
          emptyMessage={t('recent.empty')}
        />
      </CardContent>
    </Card>
  );
}
