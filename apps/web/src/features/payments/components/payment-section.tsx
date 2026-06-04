'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Check,
  Clock,
  Loader2,
  Phone,
  Wallet,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api-error';
import type { BookingStatus } from '@/components/shared/types';
import {
  useBookingPayment,
  usePaymentInstructions,
  useSubmitPayment,
} from '../hooks/use-payments';
import { PaymentStatusBadge } from './payment-status-badge';
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from '../types/payment.types';

const METHOD_ICON: Record<PaymentMethod, typeof Building2> = {
  BANK_TRANSFER: Building2,
  MOBILE_MONEY: Phone,
  CASH: Wallet,
};

interface PaymentSectionProps {
  bookingId: string;
  status: BookingStatus;
  totalPrice: number;
}

/**
 * Guest payment flow on the booking detail. Visible once the host moves the
 * booking to WAITING_PAYMENT; collects an offline payment claim (method +
 * reference) and submits it for admin review.
 */
export function PaymentSection({
  bookingId,
  status,
  totalPrice,
}: PaymentSectionProps) {
  const t = useTranslations('payments');
  const tErr = useTranslations('payments.errors');

  // Payment record is only meaningful once the booking enters the payment arc.
  const showPayment =
    status === 'WAITING_PAYMENT' ||
    status === 'PROOF_SUBMITTED' ||
    status === 'CONFIRMED';

  const { data: payment, isLoading } = useBookingPayment(bookingId, showPayment);
  const { data: instructions } = usePaymentInstructions();
  const submit = useSubmitPayment(bookingId);

  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [reference, setReference] = useState('');

  if (status === 'PENDING') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('awaitingApproval')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!showPayment) return null;

  const whatsappHref = instructions?.whatsappNumber
    ? `https://wa.me/${instructions.whatsappNumber}`
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t('title')}</CardTitle>
        {payment ? <PaymentStatusBadge status={payment.status} /> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-lg" />
        ) : status === 'CONFIRMED' ? (
          <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <Check className="mt-0.5 size-5 text-success" />
            <div>
              <p className="font-medium">{t('verified.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('verified.body')}
              </p>
            </div>
          </div>
        ) : status === 'PROOF_SUBMITTED' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Clock className="mt-0.5 size-5 text-warning" />
              <div>
                <p className="font-medium">{t('underReview.title')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('underReview.body')}
                </p>
              </div>
            </div>
            {payment ? (
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">{t('submittedMethod')}</dt>
                <dd className="text-end font-medium">
                  {t(`methods.${payment.method}`)}
                </dd>
                {payment.reference ? (
                  <>
                    <dt className="text-muted-foreground">
                      {t('referenceLabel')}
                    </dt>
                    <dd className="text-end font-medium">{payment.reference}</dd>
                  </>
                ) : null}
              </dl>
            ) : null}
          </div>
        ) : (
          // WAITING_PAYMENT — collect the payment claim.
          <div className="space-y-4">
            {payment?.status === 'REJECTED' ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {t('rejected.title')}
              </p>
            ) : null}

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">{t('amount')}</span>
              <span className="text-lg font-semibold">{totalPrice}</span>
            </div>

            <div className="space-y-2">
              <Label>{t('chooseMethod')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = METHOD_ICON[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition-colors',
                        method === m
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/30',
                      )}
                    >
                      <Icon className="size-5" />
                      {t(`methods.${m}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method-specific instructions */}
            {instructions ? (
              <div className="rounded-lg border p-4 text-sm">
                {method === 'BANK_TRANSFER' ? (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                    <dt className="text-muted-foreground">{t('bank.name')}</dt>
                    <dd className="text-end font-medium">
                      {instructions.bank.name}
                    </dd>
                    <dt className="text-muted-foreground">
                      {t('bank.accountName')}
                    </dt>
                    <dd className="text-end font-medium">
                      {instructions.bank.accountName}
                    </dd>
                    <dt className="text-muted-foreground">
                      {t('bank.accountNumber')}
                    </dt>
                    <dd className="text-end font-mono font-medium">
                      {instructions.bank.accountNumber}
                    </dd>
                    {instructions.bank.iban ? (
                      <>
                        <dt className="text-muted-foreground">
                          {t('bank.iban')}
                        </dt>
                        <dd className="text-end font-mono font-medium">
                          {instructions.bank.iban}
                        </dd>
                      </>
                    ) : null}
                  </dl>
                ) : method === 'MOBILE_MONEY' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t('mobileMoney.number')}
                    </span>
                    <span className="font-mono font-medium">
                      {instructions.mobileMoneyNumber}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t('cash.note')}</p>
                )}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="reference">{t('referenceLabel')}</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={t('referencePlaceholder')}
              />
            </div>

            {submit.isError ? (
              <p className="text-sm text-destructive">
                {getApiErrorMessage(submit.error, tErr('generic'))}
              </p>
            ) : null}

            <Button
              className="w-full"
              disabled={submit.isPending}
              onClick={() =>
                submit.mutate({ method, reference: reference.trim() || undefined })
              }
            >
              {submit.isPending ? <Loader2 className="animate-spin" /> : null}
              {t('submit')}
            </Button>

            {whatsappHref ? (
              <Button asChild variant="outline" className="w-full">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> {t('whatsapp')}
                </a>
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
