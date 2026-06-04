import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { AdminPaymentsTable } from '@/features/payments/components/admin-payments-table';

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('paymentsAdmin');

  return (
    <div className="container space-y-6 py-10">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <AdminPaymentsTable />
    </div>
  );
}
