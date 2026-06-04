import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { AdminBookingsTable } from '@/features/bookings/components/admin-bookings-table';

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('bookings.admin');

  return (
    <div className="container space-y-6 py-10">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <AdminBookingsTable />
    </div>
  );
}
