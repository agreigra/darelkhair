import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** App footer — brand blurb, quick links, copyright. */
export function SiteFooter() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const th = useTranslations('home');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/40">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-2">
          <p className="text-lg font-semibold tracking-tight">{tc('appName')}</p>
          <p className="text-sm text-muted-foreground">{th('footerTagline')}</p>
        </div>
        <nav className="flex flex-col gap-3 text-sm">
          <p className="font-medium">{th('footerExplore')}</p>
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('home')}
          </Link>
          <Link
            href="/apartments"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('apartments')}
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('about')}
          </Link>
          <Link
            href="/bookings"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('bookings')}
          </Link>
        </nav>
      </div>
      <div className="border-t">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {year} {tc('appName')}. {th('footerRights')}
        </div>
      </div>
    </footer>
  );
}
