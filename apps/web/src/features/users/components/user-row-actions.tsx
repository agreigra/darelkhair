'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MoreHorizontal, Shield, ShieldOff, UserCheck, UserX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAdminUpdateUser, useDeleteUser } from '../hooks/use-users';
import type { ManagedUser } from '../types/user.types';

/** Per-row admin actions: toggle role, toggle active status, delete (with confirm). */
export function UserRowActions({ user }: { user: ManagedUser }) {
  const t = useTranslations('admin.users');
  const tc = useTranslations('common');
  const { user: me } = useAuth();
  const update = useAdminUpdateUser();
  const remove = useDeleteUser();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSelf = me?.id === user.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">{t('actions')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.role === 'USER' ? (
            <DropdownMenuItem
              disabled={update.isPending}
              onClick={() => update.mutate({ id: user.id, input: { role: 'ADMIN' } })}
            >
              <Shield /> {t('makeAdmin')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={isSelf || update.isPending}
              onClick={() => update.mutate({ id: user.id, input: { role: 'USER' } })}
            >
              <ShieldOff /> {t('makeUser')}
            </DropdownMenuItem>
          )}

          {user.isActive ? (
            <DropdownMenuItem
              disabled={isSelf || update.isPending}
              onClick={() =>
                update.mutate({ id: user.id, input: { isActive: false } })
              }
            >
              <UserX /> {t('deactivate')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={update.isPending}
              onClick={() =>
                update.mutate({ id: user.id, input: { isActive: true } })
              }
            >
              <UserCheck /> {t('activate')}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isSelf}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 /> {tc('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('deleteTitle')}
        description={t('deleteDescription', { email: user.email })}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        destructive
        isLoading={remove.isPending}
        onConfirm={() =>
          remove.mutate(user.id, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </>
  );
}
