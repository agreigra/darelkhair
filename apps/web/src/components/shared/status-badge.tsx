import { useTranslations } from 'next-intl';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { BookingStatus } from './types';

/** Maps each booking status to a badge variant. Single source of truth for status colors. */
const STATUS_VARIANT: Record<BookingStatus, BadgeProps['variant']> = {
  PENDING: 'secondary',
  WAITING_PAYMENT: 'warning',
  PROOF_SUBMITTED: 'default',
  CONFIRMED: 'success',
  HONORED: 'outline',
  CANCELLED: 'destructive',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations('status');
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
