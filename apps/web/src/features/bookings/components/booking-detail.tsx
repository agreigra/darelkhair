'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BedDouble, CalendarDays, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { localized } from '@/lib/i18n-content';
import { getApiErrorMessage } from '@/lib/api-error';
import { PaymentSection } from '@/features/payments/components/payment-section';
import { useBooking, useCancelBooking } from '../hooks/use-bookings';
import { BookingStatusTimeline } from './booking-status-timeline';
import { formatDate, USER_CANCELLABLE } from '../lib/booking-ui';

export function BookingDetail({ id }: { id: string }) {
  const t = useTranslations('bookings.detail');
  const tErr = useTranslations('bookings.errors');
  const tc = useTranslations('common');
  const locale = useLocale();

  const { data: booking, isLoading, isError } = useBooking(id);
  const cancel = useCancelBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isError || !booking) {
    return <p className="text-muted-foreground">{t('notFound')}</p>;
  }

  const title = localized(booking.apartment.title, locale);
  const city = booking.apartment.city
    ? localized(booking.apartment.city, locale)
    : '';
  const canCancel = USER_CANCELLABLE.includes(booking.status);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link href="/bookings">
          <ArrowLeft /> {t('back')}
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">
                #{booking.reference}
                {city ? ` · ${city}` : ''}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {booking.apartment.coverImageUrl ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              <Image
                src={booking.apartment.coverImageUrl}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <PaymentSection
            bookingId={booking.id}
            status={booking.status}
            totalPrice={booking.totalPrice}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('timeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingStatusTimeline history={booking.history ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="space-y-4 pt-6 text-sm">
              <Row
                icon={<CalendarDays className="size-4" />}
                label={t('dates')}
                value={`${formatDate(booking.checkIn, locale)} → ${formatDate(
                  booking.checkOut,
                  locale,
                )}`}
              />
              <Row
                icon={<BedDouble className="size-4" />}
                label={t('nights')}
                value={String(booking.nights)}
              />
              <Row
                icon={<Users className="size-4" />}
                label={t('guests')}
                value={String(booking.guests)}
              />
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground">{t('total')}</span>
                <span className="text-lg font-semibold">
                  {booking.totalPrice}
                </span>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href={`/apartments/${booking.apartmentId}`}>
                  {t('viewApartment')}
                </Link>
              </Button>

              {canCancel ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setConfirmOpen(true)}
                >
                  {t('cancel')}
                </Button>
              ) : null}

              {cancel.isError ? (
                <p className="text-sm text-destructive">
                  {getApiErrorMessage(cancel.error, tErr('generic'))}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('cancelTitle')}
        description={t('cancelDescription')}
        confirmLabel={t('cancelConfirm')}
        cancelLabel={tc('cancel')}
        destructive
        isLoading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(booking.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
      />
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
