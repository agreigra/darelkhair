'use client';

import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '../hooks/use-auth';

/**
 * Client-side RBAC gate for admin pages. Redirects non-admins home once the
 * session resolves. The API still enforces RBAC on every request — this is UX.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !isAdmin) {
      router.replace('/');
    }
  }, [status, isAdmin, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
