'use client';

import { useTranslations } from 'next-intl';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, useLogout } from '@/features/auth/hooks/use-auth';

/** Client-side auth controls in the header: login/register or the user's session. */
export function HeaderAuth() {
  const t = useTranslations('nav');
  const { status, user, isAuthenticated, isAdmin } = useAuth();
  const logout = useLogout();

  if (status === 'loading') {
    return <Skeleton className="h-9 w-32" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">{t('login')}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">{t('register')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/dashboard">
            <LayoutDashboard className="size-4" />
            <span className="hidden sm:inline">{t('dashboard')}</span>
          </Link>
        </Button>
      ) : null}
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {user?.firstName || user?.email}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">{t('logout')}</span>
      </Button>
    </div>
  );
}
