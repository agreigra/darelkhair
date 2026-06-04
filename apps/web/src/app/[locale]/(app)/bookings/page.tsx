import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { MyBookings } from '@/features/bookings/components/my-bookings';

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('bookings.list');

  return (
    <div className="container max-w-4xl space-y-6 py-10">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <MyBookings />
    </div>
  );
}
