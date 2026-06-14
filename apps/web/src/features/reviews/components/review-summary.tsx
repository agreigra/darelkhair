'use client';

import { useLocale, useTranslations } from 'next-intl';
import { StarRating } from './star-rating';
import type { ReviewSummary as Summary } from '../types/review.types';

/** Average rating + total + per-star distribution bars. */
export function ReviewSummary({ summary }: { summary: Summary }) {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex flex-col items-center gap-1 sm:w-40">
        <span className="text-4xl font-semibold tracking-tight">
          {fmt.format(summary.average)}
        </span>
        <StarRating value={summary.average} />
        <span className="text-sm text-muted-foreground">
          {t('count', { count: summary.count })}
        </span>
      </div>

      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const n = summary.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0;
          const pct = summary.count > 0 ? Math.round((n / summary.count) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-muted-foreground">{star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-orange"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-end text-xs tabular-nums text-muted-foreground">
                {n}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
