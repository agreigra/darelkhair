'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useApartmentReviews, useMyReview } from '../hooks/use-reviews';
import { ReviewSummary } from './review-summary';
import { ReviewList } from './review-list';
import { ReviewForm } from './review-form';

/** Full reviews block for an apartment detail page. */
export function ApartmentReviews({ apartmentId }: { apartmentId: string }) {
  const t = useTranslations('reviews');
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, isPlaceholderData } = useApartmentReviews(
    apartmentId,
    page,
  );
  const { data: my } = useMyReview(apartmentId);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">{t('title')}</h2>

      {isLoading || !data ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <>
          {data.summary.count > 0 ? (
            <ReviewSummary summary={data.summary} />
          ) : (
            <p className="text-muted-foreground">{t('empty')}</p>
          )}

          {isAuthenticated && my?.canReview ? (
            <ReviewForm apartmentId={apartmentId} existing={my.mine} />
          ) : null}

          {data.items.length > 0 ? (
            <ReviewList items={data.items} />
          ) : null}

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
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
          ) : null}
        </>
      )}
    </section>
  );
}
