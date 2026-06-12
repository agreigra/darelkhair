'use client';

import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '../hooks/use-auth';

/**
 * Client-side gate for routes that require a signed-in user. While the initial
 * silent refresh resolves it shows a spinner; if the user is unauthenticated it
 * redirects to /login (with returnTo). The API enforces real auth on every
 * request — this is UX. Used instead of a middleware cookie check, which can't
 * work when the refresh cookie lives on a different (API) domain.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
