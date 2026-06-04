import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthShell>{children}</AuthShell>;
}

function AuthShell({ children }: { children: ReactNode }) {
  const t = useTranslations('common');
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 py-12">
      <Link href="/" className="text-center">
        <span className="text-2xl font-semibold tracking-tight text-primary">
          {t('appName')}
        </span>
        <p className="mt-1 text-sm text-muted-foreground">{t('tagline')}</p>
      </Link>
      {children}
    </div>
  );
}
