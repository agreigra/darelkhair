import { setRequestLocale } from 'next-intl/server';
import { RegisterForm } from '@/features/auth/components/register-form';

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { returnTo } = await searchParams;
  return <RegisterForm redirectTo={returnTo || '/'} />;
}
