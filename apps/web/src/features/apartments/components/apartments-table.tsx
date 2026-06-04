'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { localized } from '@/lib/i18n-content';
import {
  useAdminApartments,
  useDeleteApartment,
} from '../hooks/use-admin-apartments';
import type { Apartment, ApartmentFilters } from '../types/apartment.types';

const PAGE_SIZE = 10;

function RowActions({ apartment }: { apartment: Apartment }) {
  const t = useTranslations('apartments.table');
  const tc = useTranslations('common');
  const remove = useDeleteApartment();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/apartments/${apartment.id}/edit`}>
              <Pencil /> {tc('edit')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
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
        description={t('deleteDescription')}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        destructive
        isLoading={remove.isPending}
        onConfirm={() =>
          remove.mutate(apartment.id, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </>
  );
}

export function ApartmentsTable() {
  const t = useTranslations('apartments.table');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const filters: ApartmentFilters = {
    page,
    pageSize: PAGE_SIZE,
    search: debounced || undefined,
  };
  const { data, isLoading, isPlaceholderData } = useAdminApartments(filters);

  const columns: DataTableColumn<Apartment>[] = [
    {
      key: 'cover',
      header: '',
      className: 'w-16',
      cell: (a) => (
        <div className="relative h-10 w-14 overflow-hidden rounded bg-muted">
          {a.coverImageUrl ? (
            <Image
              src={a.coverImageUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : null}
        </div>
      ),
    },
    {
      key: 'title',
      header: t('columns.title'),
      cell: (a) => (
        <span className="font-medium">{localized(a.title, locale)}</span>
      ),
    },
    {
      key: 'city',
      header: t('columns.city'),
      cell: (a) =>
        a.city ? localized(a.city, locale) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'price',
      header: t('columns.price'),
      cell: (a) => a.pricePerNight,
    },
    {
      key: 'status',
      header: t('columns.status'),
      cell: (a) => (
        <Badge variant={a.isPublished ? 'success' : 'secondary'}>
          {a.isPublished ? t('status.published') : t('status.draft')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-end',
      cell: (a) => <RowActions apartment={a} />,
    },
  ];

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="ps-9"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(a) => a.id}
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
