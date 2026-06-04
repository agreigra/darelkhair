'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { formatDate } from '@/features/bookings/lib/booking-ui';
import { useAdminPayments } from '../hooks/use-admin-payments';
import { PaymentStatusBadge } from './payment-status-badge';
import { PaymentReviewActions } from './payment-review-actions';
import {
  type AdminPayment,
  type PaymentStatus,
} from '../types/payment.types';

const PAGE_SIZE = 10;
const STATUSES: PaymentStatus[] = ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'];

export function AdminPaymentsTable() {
  const t = useTranslations('paymentsAdmin');
  const tMethod = useTranslations('payments.methods');
  const tStatus = useTranslations('paymentStatus');
  const locale = useLocale();

  // Default to the queue that needs action.
  const [status, setStatus] = useState<PaymentStatus | undefined>('SUBMITTED');
  const [page, setPage] = useState(1);

  const { data, isLoading, isPlaceholderData } = useAdminPayments({
    page,
    pageSize: PAGE_SIZE,
    status,
  });

  function pick(next: PaymentStatus | undefined) {
    setStatus(next);
    setPage(1);
  }

  const columns: DataTableColumn<AdminPayment>[] = [
    {
      key: 'reference',
      header: t('columns.booking'),
      cell: (p) => (
        <Link
          href={`/admin/bookings/${p.booking.id}`}
          className="font-mono text-xs hover:underline"
        >
          {p.booking.reference}
        </Link>
      ),
    },
    {
      key: 'guest',
      header: t('columns.guest'),
      cell: (p) => p.booking.guestName ?? p.booking.guestEmail,
    },
    {
      key: 'method',
      header: t('columns.method'),
      cell: (p) => tMethod(p.method),
    },
    {
      key: 'amount',
      header: t('columns.amount'),
      cell: (p) => p.amount,
    },
    {
      key: 'submitted',
      header: t('columns.submitted'),
      cell: (p) => formatDate(p.createdAt.slice(0, 10), locale),
    },
    {
      key: 'status',
      header: t('columns.status'),
      cell: (p) => <PaymentStatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: (p) =>
        p.status === 'SUBMITTED' ? (
          <PaymentReviewActions paymentId={p.id} size="sm" />
        ) : null,
    },
  ];

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={status ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => pick(undefined)}
        >
          {t('all')}
        </Button>
        {STATUSES.map((s) => (
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

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(p) => p.id}
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
