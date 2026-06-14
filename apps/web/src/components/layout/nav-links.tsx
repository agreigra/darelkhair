'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/apartments', key: 'apartments' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

/** Active when the path matches exactly, or is a child of a section (e.g. /apartments/3). */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Primary navigation links with active-route highlighting. Shared by the desktop
 * header bar and the mobile drawer so both stay in sync.
 */
export function NavLinks({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const t = useTranslations('nav');
  const isActive = useIsActive();

  return (
    <>
      {LINKS.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'transition-colors',
              variant === 'desktop'
                ? active
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                : cn(
                    'rounded-md px-3 py-2 text-base font-medium',
                    active
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  ),
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </>
  );
}
