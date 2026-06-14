'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from './star-rating';
import type { Review } from '../types/review.types';

export function ReviewList({ items }: { items: Review[] }) {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  if (items.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <ul className="divide-y">
      {items.map((r) => (
        <li key={r.id} className="flex gap-4 py-5">
          <Avatar className="size-10">
            <AvatarFallback>
              {r.authorName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{r.authorName}</span>
              <span className="text-xs text-muted-foreground">
                {dateFmt.format(new Date(r.createdAt))}
              </span>
            </div>
            <StarRating value={r.rating} size="sm" />
            {r.comment ? (
              <p className="whitespace-pre-line pt-1 leading-relaxed text-foreground/90">
                {r.comment}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
