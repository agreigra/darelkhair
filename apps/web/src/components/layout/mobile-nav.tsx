'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/apartments', key: 'apartments' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

/**
 * Hamburger + slide-in drawer with the primary nav links, shown only below the
 * `md` breakpoint (the desktop nav handles larger screens). Auth/admin links
 * remain reachable on mobile via the avatar menu in HeaderAuth.
 */
export function MobileNav() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t('menu')}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="text-start">{tc('appName')}</SheetTitle>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
