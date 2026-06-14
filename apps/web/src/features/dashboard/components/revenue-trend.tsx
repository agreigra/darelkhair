'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyPoint } from '../types/dashboard.types';

/** Dependency-free CSS bar chart of confirmed revenue over the last 6 months. */
export function RevenueTrend({ trend }: { trend: MonthlyPoint[] }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const max = Math.max(1, ...trend.map((p) => p.revenue));
  const numberFmt = new Intl.NumberFormat(locale);
  const monthFmt = new Intl.DateTimeFormat(locale, { month: 'short' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('trendTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end justify-between gap-3">
          {trend.map((p) => {
            const [year, month] = p.month.split('-').map(Number);
            const label = monthFmt.format(new Date(Date.UTC(year, month - 1, 1)));
            const heightPct = Math.round((p.revenue / max) * 100);
            return (
              <div
                key={p.month}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-full w-full items-end">
                  <div
                    className="relative w-full rounded-t bg-primary/80 transition-colors group-hover:bg-primary"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  >
                    <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-xs font-medium text-foreground group-hover:block">
                      {numberFmt.format(p.revenue)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
