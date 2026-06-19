import { setRequestLocale } from 'next-intl/server';
import { VerifyEmailForm } from '@/features/auth/components/verify-email-form';

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  return <VerifyEmailForm token={token} />;
}
