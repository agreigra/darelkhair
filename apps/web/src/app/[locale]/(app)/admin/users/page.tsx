import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { UsersTable } from '@/features/users/components/users-table';

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.users');

  return (
    <div className="container space-y-6 py-10">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <UsersTable />
    </div>
  );
}
