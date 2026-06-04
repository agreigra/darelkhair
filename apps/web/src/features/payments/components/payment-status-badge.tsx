import { useTranslations } from 'next-intl';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { PaymentStatus } from '../types/payment.types';

const VARIANT: Record<PaymentStatus, BadgeProps['variant']> = {
  PENDING: 'secondary',
  SUBMITTED: 'warning',
  VERIFIED: 'success',
  REJECTED: 'destructive',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations('paymentStatus');
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>;
}
