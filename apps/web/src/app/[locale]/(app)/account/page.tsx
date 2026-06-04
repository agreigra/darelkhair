import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { AccountView } from '@/features/users/components/account-view';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('account');

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <AccountView />
    </div>
  );
}
