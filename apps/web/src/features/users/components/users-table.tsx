'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { useUsers } from '../hooks/use-users';
import { UserRowActions } from './user-row-actions';
import type { ManagedUser, UserRole, UsersQuery } from '../types/user.types';

const PAGE_SIZE = 10;

export function UsersTable() {
  const t = useTranslations('admin.users');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Debounce the search box; reset to page 1 on a new term.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const query: UsersQuery = {
    page,
    pageSize: PAGE_SIZE,
    search: debounced || undefined,
    role,
  };
  const { data, isLoading, isPlaceholderData } = useUsers(query);

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale],
  );

  const columns: DataTableColumn<ManagedUser>[] = [
    {
      key: 'name',
      header: t('columns.name'),
      cell: (u) =>
        [u.firstName, u.lastName].filter(Boolean).join(' ') || (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: 'email', header: t('columns.email'), cell: (u) => u.email },
    {
      key: 'role',
      header: t('columns.role'),
      cell: (u) => (
        <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
          {t(`roles.${u.role}`)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      cell: (u) => (
        <Badge variant={u.isActive ? 'success' : 'destructive'}>
          {u.isActive ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'joined',
      header: t('columns.joined'),
      cell: (u) => dateFmt.format(new Date(u.createdAt)),
      className: 'text-muted-foreground',
    },
    {
      key: 'actions',
      header: <span className="sr-only">{t('actions')}</span>,
      cell: (u) => <UserRowActions user={u} />,
      className: 'w-12 text-end',
    },
  ];

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const ROLE_FILTERS: { label: string; value: UserRole | undefined }[] = [
    { label: t('filters.all'), value: undefined },
    { label: t('roles.USER'), value: 'USER' },
    { label: t('roles.ADMIN'), value: 'ADMIN' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="ps-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {ROLE_FILTERS.map((f) => (
            <Button
              key={f.label}
              size="sm"
              variant={role === f.value ? 'default' : 'outline'}
              onClick={() => {
                setRole(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        emptyMessage={t('empty')}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('total', { count: total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1 || isPlaceholderData}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <span>{t('pageOf', { page, total: totalPages })}</span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages || isPlaceholderData}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
