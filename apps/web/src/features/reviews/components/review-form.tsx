'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { getApiErrorMessage } from '@/lib/api-error';
import { StarRating } from './star-rating';
import { useDeleteMyReview, useUpsertReview } from '../hooks/use-reviews';
import type { Review } from '../types/review.types';

/** Create / edit / delete the signed-in guest's own review for an apartment. */
export function ReviewForm({
  apartmentId,
  existing,
}: {
  apartmentId: string;
  existing: Review | null;
}) {
  const t = useTranslations('reviews');
  const tc = useTranslations('common');
  const upsert = useUpsertReview(apartmentId);
  const remove = useDeleteMyReview(apartmentId);

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Reflect server state when the existing review loads/changes.
  useEffect(() => {
    setRating(existing?.rating ?? 0);
    setComment(existing?.comment ?? '');
  }, [existing]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return;
    upsert.mutate({ rating, comment: comment.trim() || undefined });
  }

  const error = upsert.isError && getApiErrorMessage(upsert.error, t('errorGeneric'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {existing ? t('editTitle') : t('writeTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('ratingLabel')}</label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('commentLabel')}</label>
            <Textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}
          {upsert.isSuccess ? (
            <p className="text-sm font-medium text-success">{t('saved')}</p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={rating < 1 || upsert.isPending}>
              {upsert.isPending ? (
                <Loader2 className="animate-spin" />
              ) : existing ? (
                tc('save')
              ) : (
                t('submit')
              )}
            </Button>
            {existing ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                {tc('delete')}
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        destructive
        isLoading={remove.isPending}
        onConfirm={() =>
          remove.mutate(undefined, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </Card>
  );
}
