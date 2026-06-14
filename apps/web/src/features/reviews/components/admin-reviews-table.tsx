'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { localized } from '@/lib/i18n-content';
import { StarRating } from './star-rating';
import { useAdminDeleteReview, useAdminReviews } from '../hooks/use-reviews';
import type { AdminReview } from '../types/review.types';

const PAGE_SIZE = 10;

export function AdminReviewsTable() {
  const t = useTranslations('admin.reviews');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminReview | null>(null);
  const { data, isLoading, isPlaceholderData } = useAdminReviews(page);
  const remove = useAdminDeleteReview();

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale],
  );

  const columns: DataTableColumn<AdminReview>[] = [
    {
      key: 'apartment',
      header: t('columns.apartment'),
      cell: (r) => (
        <Link
          href={`/apartments/${r.apartmentId}`}
          className="font-medium text-primary hover:underline"
        >
          {r.apartmentTitle ? localized(r.apartmentTitle, locale) : '—'}
        </Link>
      ),
    },
    {
      key: 'rating',
      header: t('columns.rating'),
      cell: (r) => <StarRating value={r.rating} size="sm" />,
    },
    {
      key: 'comment',
      header: t('columns.comment'),
      cell: (r) =>
        r.comment ? (
          <span className="line-clamp-2 max-w-md text-muted-foreground">
            {r.comment}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'author',
      header: t('columns.author'),
      cell: (r) => (
        <div className="flex flex-col">
          <span>{r.authorName}</span>
          <span className="text-xs text-muted-foreground">{r.authorEmail}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: t('columns.date'),
      cell: (r) => dateFmt.format(new Date(r.createdAt)),
      className: 'text-muted-foreground whitespace-nowrap',
    },
    {
      key: 'actions',
      header: <span className="sr-only">{tc('delete')}</span>,
      cell: (r) => (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={() => setTarget(r)}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">{tc('delete')}</span>
        </Button>
      ),
      className: 'w-12 text-end',
    },
  ];

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
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

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        destructive
        isLoading={remove.isPending}
        onConfirm={() => {
          if (target) {
            remove.mutate(target.id, { onSuccess: () => setTarget(null) });
          }
        }}
      />
    </div>
  );
}
