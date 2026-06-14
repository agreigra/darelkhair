import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { ContactMessagesTable } from '@/features/contact';

export default async function AdminContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.contact');

  return (
    <div className="container space-y-6 py-10">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ContactMessagesTable />
    </div>
  );
}
