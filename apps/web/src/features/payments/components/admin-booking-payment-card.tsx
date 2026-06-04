'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminBookingPayment } from '../hooks/use-admin-payments';
import { PaymentStatusBadge } from './payment-status-badge';
import { PaymentReviewActions } from './payment-review-actions';

/** Payment summary + review actions for a booking, on the admin booking page. */
export function AdminBookingPaymentCard({ bookingId }: { bookingId: string }) {
  const t = useTranslations('payments');
  const tAdmin = useTranslations('paymentsAdmin');
  const { data: payment, isLoading } = useAdminBookingPayment(bookingId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t('title')}</CardTitle>
        {payment ? <PaymentStatusBadge status={payment.status} /> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : !payment ? (
          <p className="text-sm text-muted-foreground">{tAdmin('noPayment')}</p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">{tAdmin('columns.method')}</dt>
              <dd className="text-end font-medium">
                {t(`methods.${payment.method}`)}
              </dd>
              <dt className="text-muted-foreground">{t('amount')}</dt>
              <dd className="text-end font-medium">{payment.amount}</dd>
              {payment.reference ? (
                <>
                  <dt className="text-muted-foreground">
                    {t('referenceLabel')}
                  </dt>
                  <dd className="text-end font-medium">{payment.reference}</dd>
                </>
              ) : null}
            </dl>

            {payment.proofUrl ? (
              <a
                href={payment.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payment.proofUrl}
                  alt={tAdmin('proof')}
                  className="max-h-64 w-full object-contain bg-muted"
                />
              </a>
            ) : null}

            {payment.status === 'SUBMITTED' ? (
              <PaymentReviewActions paymentId={payment.id} />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
