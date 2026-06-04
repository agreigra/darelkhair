'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, LogIn } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/api-error';
import { parseDateOnly } from '@/lib/date';
import { AvailabilityCalendar } from '@/features/availability/components/availability-calendar';
import { useAvailabilityCheck } from '@/features/availability/hooks/use-availability';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { Apartment } from '@/features/apartments/types/apartment.types';
import { useCreateBooking } from '../hooks/use-bookings';

type Range = { checkIn: string; checkOut: string } | null;

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (parseDateOnly(checkOut).getTime() - parseDateOnly(checkIn).getTime()) /
      86_400_000,
  );
}

/**
 * The booking flow on the apartment detail page: pick dates (reusing Feature 4's
 * availability calendar), set guests, then create a PENDING booking. Anonymous
 * visitors are routed to sign in first and returned here.
 */
export function BookingPanel({ apartment }: { apartment: Apartment }) {
  const t = useTranslations('bookings.create');
  const tErr = useTranslations('bookings.errors');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [range, setRange] = useState<Range>(null);
  const [guests, setGuests] = useState(1);

  const { data: check } = useAvailabilityCheck(
    apartment.id,
    range?.checkIn,
    range?.checkOut,
  );
  const create = useCreateBooking();

  const nights = range ? nightsBetween(range.checkIn, range.checkOut) : 0;
  const total = nights * apartment.pricePerNight;
  const guestsValid = guests >= 1 && guests <= apartment.maxGuests;
  const canBook =
    Boolean(range) && check?.available === true && guestsValid && !create.isPending;

  function onSubmit() {
    if (!range) return;
    create.mutate(
      { apartmentId: apartment.id, ...range, guests },
      { onSuccess: (booking) => router.push(`/bookings/${booking.id}`) },
    );
  }

  return (
    <div className="space-y-4">
      <AvailabilityCalendar
        apartmentId={apartment.id}
        pricePerNight={apartment.pricePerNight}
        onRangeChange={setRange}
      />

      {range ? (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="guests">{t('guests')}</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={apartment.maxGuests}
                value={guests}
                onChange={(e) =>
                  setGuests(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-24"
              />
            </div>
            <p className="pb-2 text-xs text-muted-foreground">
              {t('maxGuests', { count: apartment.maxGuests })}
            </p>
          </div>

          {!guestsValid ? (
            <p className="text-sm text-destructive">
              {t('maxGuests', { count: apartment.maxGuests })}
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              {t('summary', { nights })}
            </span>
            <span className="text-lg font-semibold">{total}</span>
          </div>

          {create.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(create.error, tErr('generic'))}
            </p>
          ) : null}

          {isAuthenticated ? (
            <Button
              className="w-full"
              size="lg"
              disabled={!canBook}
              onClick={onSubmit}
            >
              {create.isPending ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {t('confirm')}
            </Button>
          ) : (
            <Button asChild className="w-full" size="lg">
              <Link href={`/login?returnTo=/apartments/${apartment.id}`}>
                <LogIn /> {t('loginToBook')}
              </Link>
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
