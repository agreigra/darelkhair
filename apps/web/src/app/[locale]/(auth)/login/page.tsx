import { setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/features/auth/components/login-form';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { returnTo } = await searchParams;
  return <LoginForm redirectTo={returnTo || '/'} />;
}
