'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { localized } from '@/lib/i18n-content';
import { getApiErrorMessage } from '@/lib/api-error';
import { AdminBookingPaymentCard } from '@/features/payments/components/admin-booking-payment-card';
import {
  useAdminBooking,
  useUpdateBookingStatus,
} from '../hooks/use-admin-bookings';
import { BookingStatusTimeline } from './booking-status-timeline';
import { ALLOWED_NEXT, formatDate } from '../lib/booking-ui';
import type { BookingStatus } from '../types/booking.types';

export function AdminBookingManage({ id }: { id: string }) {
  const t = useTranslations('bookings.admin');
  const tDetail = useTranslations('bookings.detail');
  const tStatus = useTranslations('status');
  const tErr = useTranslations('bookings.errors');
  const locale = useLocale();

  const { data: booking, isLoading, isError } = useAdminBooking(id);
  const update = useUpdateBookingStatus(id);
  const [note, setNote] = useState('');

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isError || !booking) {
    return <p className="text-muted-foreground">{tDetail('notFound')}</p>;
  }

  const title = localized(booking.apartment.title, locale);
  const nextStatuses = ALLOWED_NEXT[booking.status];

  function transition(status: BookingStatus) {
    update.mutate(
      { status, note: note.trim() || undefined },
      { onSuccess: () => setNote('') },
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link href="/admin/bookings">
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
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {/* Guest + stay summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('detailsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label={t('columns.guest')} value={guestLine(booking.user)} />
              {booking.user?.email ? (
                <Row label={tDetail('email')} value={booking.user.email} />
              ) : null}
              {booking.user?.phone ? (
                <Row label={tDetail('phone')} value={booking.user.phone} />
              ) : null}
              <Row
                label={tDetail('dates')}
                value={`${formatDate(booking.checkIn, locale)} → ${formatDate(
                  booking.checkOut,
                  locale,
                )}`}
              />
              <Row label={tDetail('nights')} value={String(booking.nights)} />
              <Row label={tDetail('guests')} value={String(booking.guests)} />
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">{tDetail('total')}</span>
                <span className="text-lg font-semibold">
                  {booking.totalPrice}
                </span>
              </div>
            </CardContent>
          </Card>

          <AdminBookingPaymentCard bookingId={booking.id} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{tDetail('timeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingStatusTimeline history={booking.history ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* Status actions */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">{t('updateStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextStatuses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('terminal')}</p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="note">{t('note')}</Label>
                    <Input
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('notePlaceholder')}
                    />
                  </div>
                  <div className="grid gap-2">
                    {nextStatuses.map((s) => (
                      <Button
                        key={s}
                        variant={s === 'CANCELLED' ? 'destructive' : 'default'}
                        disabled={update.isPending}
                        onClick={() => transition(s)}
                      >
                        {t('moveTo', { status: tStatus(s) })}
                      </Button>
                    ))}
                  </div>
                </>
              )}

              {update.isError ? (
                <p className="text-sm text-destructive">
                  {getApiErrorMessage(update.error, tErr('generic'))}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function guestLine(user: { firstName: string | null; lastName: string | null; email: string } | undefined): string {
  if (!user) return '—';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium">{value}</span>
    </div>
  );
}
