'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarCheck,
  Banknote,
  CreditCard,
  Building2,
  Users,
  Mail,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { DashboardCard } from '@/components/shared/dashboard-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '../hooks/use-dashboard';
import { RevenueTrend } from './revenue-trend';
import { StatusBreakdown } from './status-breakdown';
import { RecentBookings } from './recent-bookings';

export function DashboardOverview() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="py-16 text-center text-muted-foreground">{t('error')}</p>
    );
  }

  const money = new Intl.NumberFormat(locale);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title={t('cards.bookings')}
          value={data.bookings.total}
          icon={<CalendarCheck className="size-4" />}
          hint={t('cards.upcoming', { count: data.bookings.upcoming })}
        />
        <DashboardCard
          title={t('cards.revenue')}
          value={money.format(data.revenue.total)}
          icon={<Banknote className="size-4" />}
          hint={t('cards.thisMonth', {
            amount: money.format(data.revenue.thisMonth),
          })}
        />
        <Link href="/admin/payments" className="block">
          <DashboardCard
            title={t('cards.pendingPayments')}
            value={data.payments.pendingReview}
            icon={<CreditCard className="size-4" />}
            hint={t('cards.reviewHint')}
            className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          />
        </Link>
        <Link href="/admin/apartments" className="block">
          <DashboardCard
            title={t('cards.apartments')}
            value={data.apartments.published}
            icon={<Building2 className="size-4" />}
            hint={t('cards.ofTotal', { total: data.apartments.total })}
            className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          />
        </Link>
        <Link href="/admin/users" className="block">
          <DashboardCard
            title={t('cards.users')}
            value={data.users.total}
            icon={<Users className="size-4" />}
            className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          />
        </Link>
        <Link href="/admin/contact" className="block">
          <DashboardCard
            title={t('cards.newMessages')}
            value={data.contact.newMessages}
            icon={<Mail className="size-4" />}
            hint={t('cards.messagesHint')}
            className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueTrend trend={data.trend} />
        <StatusBreakdown
          byStatus={data.bookings.byStatus}
          total={data.bookings.total}
        />
      </div>

      <RecentBookings rows={data.recentBookings} />
    </div>
  );
}
