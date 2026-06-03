'use client';

import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useLocale } from 'next-intl';
import { ar, enUS, fr } from 'date-fns/locale';
import type { Locale as DateFnsLocale } from 'date-fns';
import { isRtl } from '@/i18n/routing';

const DATE_FNS_LOCALES: Record<string, DateFnsLocale> = {
  fr,
  ar,
  en: enUS,
};

interface CalendarViewProps {
  /** Selected date range (e.g. check-in / check-out). */
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  /** Dates that cannot be selected (booked / unavailable). */
  disabled?: React.ComponentProps<typeof DayPicker>['disabled'];
  numberOfMonths?: number;
}

/**
 * Locale + RTL aware range calendar. Reused by Availability (Feature 4) and the
 * booking flow (Feature 5). Wraps react-day-picker so callers stay decoupled.
 */
export function CalendarView({
  selected,
  onSelect,
  disabled,
  numberOfMonths = 1,
}: CalendarViewProps) {
  const locale = useLocale();
  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      numberOfMonths={numberOfMonths}
      locale={DATE_FNS_LOCALES[locale] ?? enUS}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      className="rounded-lg border p-3"
    />
  );
}
