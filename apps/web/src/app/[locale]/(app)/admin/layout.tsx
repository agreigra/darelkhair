import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { AdminGuard } from '@/features/auth/components/admin-guard';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminGuard>{children}</AdminGuard>;
}
