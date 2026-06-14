import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './language-switcher';
import { HeaderAuth } from './header-auth';
import { MobileNav } from './mobile-nav';
import { NavLinks } from './nav-links';
import { NotificationBell } from '@/features/notifications';

/** App top bar. Auth controls (login/logout) are client-rendered via HeaderAuth. */
export function SiteHeader() {
  const tc = useTranslations('common');

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <MobileNav />
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {tc('appName')}
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <NavLinks variant="desktop" />
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationBell />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
