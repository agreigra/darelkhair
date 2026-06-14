'use client';

import { useTranslations } from 'next-intl';
import {
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Users,
  Building2,
  CalendarCheck,
  CreditCard,
  Mail,
  Star,
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useLogout } from '@/features/auth/hooks/use-auth';

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/** Header auth controls: login/register when anonymous, a user menu when signed in. */
export function HeaderAuth() {
  const t = useTranslations('nav');
  const { status, user, isAuthenticated, isAdmin } = useAuth();
  const logout = useLogout();
  const router = useRouter();

  if (status === 'loading') {
    return <Skeleton className="size-9 rounded-full" />;
  }

  if (!isAuthenticated || !user) {
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

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  function onLogout() {
    logout.mutate(undefined, { onSettled: () => router.push('/') });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={displayName}
        >
          <Avatar>
            <AvatarFallback>{initials(displayName, user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium">{displayName}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserIcon /> {t('account')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookings">
            <CalendarCheck /> {t('bookings')}
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                <LayoutDashboard /> {t('dashboard')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/apartments">
                <Building2 /> {t('apartments')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/bookings">
                <CalendarCheck /> {t('manageBookings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/payments">
                <CreditCard /> {t('payments')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users">
                <Users /> {t('users')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/contact">
                <Mail /> {t('contactMessages')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/reviews">
                <Star /> {t('reviews')}
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={onLogout}
          disabled={logout.isPending}
        >
          <LogOut /> {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
