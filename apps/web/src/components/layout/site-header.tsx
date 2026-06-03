import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';

/** App top bar. Auth-aware nav (login/logout) is wired in Feature 1. */
export function SiteHeader() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {tc('appName')}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/apartments"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('apartments')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{t('login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">{t('register')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
