'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NavLinks } from './nav-links';

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
          <NavLinks variant="mobile" onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
