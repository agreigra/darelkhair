'use client';

import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { CalendarView } from '@/components/shared/calendar-view';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, formatDateOnly, today } from '@/lib/date';
import { useAvailabilityCheck, useUnavailableRanges } from '../hooks/use-availability';
import { rangesToDisabled } from '../utils/calendar';

interface AvailabilityCalendarProps {
  apartmentId: string;
  pricePerNight: number;
  onRangeChange?: (range: { checkIn: string; checkOut: string } | null) => void;
}

function nightsBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Range calendar that disables unavailable dates and confirms the chosen stay.
 * Drives the booking flow in Feature 5 (via onRangeChange).
 */
export function AvailabilityCalendar({
  apartmentId,
  pricePerNight,
  onRangeChange,
}: AvailabilityCalendarProps) {
  const t = useTranslations('availability');
  const start = today();
  const from = formatDateOnly(start);
  const to = formatDateOnly(addDays(start, 365));

  const { data: ranges, isLoading } = useUnavailableRanges(apartmentId, from, to);
  const [selected, setSelected] = useState<DateRange | undefined>();

  const disabled = useMemo(
    () => [{ before: start }, ...rangesToDisabled(ranges ?? [])],
    [ranges, start],
  );

  const checkIn = selected?.from ? formatDateOnly(selected.from) : undefined;
  const checkOut = selected?.to ? formatDateOnly(selected.to) : undefined;
  const { data: check } = useAvailabilityCheck(apartmentId, checkIn, checkOut);

  const nights =
    selected?.from && selected?.to
      ? nightsBetween(selected.from, selected.to)
      : 0;

  function onSelect(range: DateRange | undefined) {
    setSelected(range);
    onRangeChange?.(
      range?.from && range?.to
        ? { checkIn: formatDateOnly(range.from), checkOut: formatDateOnly(range.to) }
        : null,
    );
  }

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-lg" />;
  }

  return (
    <div className="space-y-3">
      <CalendarView
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        numberOfMonths={2}
      />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-muted" /> {t('legendUnavailable')}
        </span>
      </div>

      {nights > 0 ? (
        <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <span>
            {t('nights', { count: nights })} ·{' '}
            <span className="font-semibold">{nights * pricePerNight}</span>
          </span>
          {check ? (
            check.available ? (
              <Badge variant="success" className="gap-1">
                <Check className="size-3" /> {t('available')}
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <X className="size-3" /> {t('unavailable')}
              </Badge>
            )
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('pickDates')}</p>
      )}
    </div>
  );
}
