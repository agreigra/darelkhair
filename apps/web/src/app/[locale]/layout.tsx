import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, getDirection, isValidLocale } from '@/i18n/routing';
import { QueryProvider } from '@/components/providers/query-provider';
import { SiteHeader } from '@/components/layout/site-header';

export const metadata: Metadata = {
  title: 'DarElKhair — Apartment booking',
  description: 'Browse, check availability, and book apartments.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
            </div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
