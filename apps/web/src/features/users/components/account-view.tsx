'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '../hooks/use-profile';
import { ProfileForm } from './profile-form';
import { ChangePasswordForm } from './change-password-form';

/** Account page body: loads the profile, then renders the profile + password forms. */
export function AccountView() {
  const { data, isLoading } = useProfile();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileForm user={data} />
      <ChangePasswordForm />
    </div>
  );
}
