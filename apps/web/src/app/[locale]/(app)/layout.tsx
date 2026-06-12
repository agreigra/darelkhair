import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { AuthGuard } from '@/features/auth/components/auth-guard';

/**
 * All routes in the (app) group require a signed-in user. Admin routes nest an
 * additional AdminGuard for the role check.
 */
export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthGuard>{children}</AuthGuard>;
}
