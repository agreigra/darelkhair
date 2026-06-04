'use client';

import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarOff, Loader2, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/shared/calendar-view';
import { addDays, formatDateOnly, parseDateOnly, today } from '@/lib/date';
import {
  useAvailabilitySlots,
  useCreateBlock,
  useDeleteBlock,
  useUnavailableRanges,
} from '../hooks/use-availability';
import { rangesToDisabled } from '../utils/calendar';

/** Admin: block / unblock date ranges for an apartment. */
export function AdminAvailabilityManager({
  apartmentId,
}: {
  apartmentId: string;
}) {
  const t = useTranslations('availability');
  const locale = useLocale();
  const start = today();
  const from = formatDateOnly(start);
  const to = formatDateOnly(addDays(start, 365));

  const { data: ranges } = useUnavailableRanges(apartmentId, from, to);
  const { data: slots, isLoading } = useAvailabilitySlots(apartmentId);
  const createBlock = useCreateBlock(apartmentId);
  const deleteBlock = useDeleteBlock(apartmentId);
  const [selected, setSelected] = useState<DateRange | undefined>();

  const disabled = useMemo(
    () => [{ before: start }, ...rangesToDisabled(ranges ?? [])],
    [ranges, start],
  );

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale],
  );

  function onBlock() {
    if (!selected?.from || !selected?.to) return;
    createBlock.mutate(
      {
        startDate: formatDateOnly(selected.from),
        endDate: formatDateOnly(selected.to),
      },
      { onSuccess: () => setSelected(undefined) },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('manage.title')}</CardTitle>
        <CardDescription>{t('manage.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <CalendarView
            selected={selected}
            onSelect={setSelected}
            disabled={disabled}
            numberOfMonths={2}
          />
          <Button
            onClick={onBlock}
            disabled={!selected?.from || !selected?.to || createBlock.isPending}
          >
            {createBlock.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CalendarOff />
            )}
            {t('manage.block')}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('manage.blockedTitle')}</h4>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('manage.loading')}</p>
          ) : !slots?.length ? (
            <p className="text-sm text-muted-foreground">{t('manage.none')}</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {slots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span>
                    {dateFmt.format(parseDateOnly(slot.startDate))} —{' '}
                    {dateFmt.format(parseDateOnly(slot.endDate))}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    disabled={deleteBlock.isPending}
                    onClick={() => deleteBlock.mutate(slot.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
