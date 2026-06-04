'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useRejectPayment, useVerifyPayment } from '../hooks/use-admin-payments';

/**
 * Verify / reject controls for a SUBMITTED payment. Shared by the admin payments
 * list and the admin booking detail so the review logic lives in one place.
 */
export function PaymentReviewActions({
  paymentId,
  size = 'default',
}: {
  paymentId: string;
  size?: 'default' | 'sm';
}) {
  const t = useTranslations('paymentsAdmin');
  const tc = useTranslations('common');
  const verify = useVerifyPayment();
  const reject = useRejectPayment();
  const [confirmReject, setConfirmReject] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        size={size}
        disabled={verify.isPending}
        onClick={() => verify.mutate(paymentId)}
      >
        {verify.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        {t('verify')}
      </Button>
      <Button
        size={size}
        variant="outline"
        disabled={reject.isPending}
        onClick={() => setConfirmReject(true)}
      >
        <X className="size-4" />
        {t('reject')}
      </Button>

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title={t('rejectTitle')}
        description={t('rejectDescription')}
        confirmLabel={t('reject')}
        cancelLabel={tc('cancel')}
        destructive
        isLoading={reject.isPending}
        onConfirm={() =>
          reject.mutate(
            { id: paymentId },
            { onSuccess: () => setConfirmReject(false) },
          )
        }
      />
    </div>
  );
}
