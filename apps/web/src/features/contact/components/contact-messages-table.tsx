'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { useContactMessages } from '../hooks/use-contact';
import { ContactRowActions } from './contact-row-actions';
import type { ContactMessage, ContactStatus, ContactQuery } from '../types/contact.types';

const PAGE_SIZE = 10;

/** Admin contact inbox: search + status filter + paginated table. */
export function ContactMessagesTable() {
  const t = useTranslations('admin.contact');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState<ContactStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const query: ContactQuery = {
    page,
    pageSize: PAGE_SIZE,
    search: debounced || undefined,
    status,
  };
  const { data, isLoading, isPlaceholderData } = useContactMessages(query);

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale],
  );

  const columns: DataTableColumn<ContactMessage>[] = [
    {
      key: 'name',
      header: t('columns.from'),
      cell: (m) => (
        <div className="flex flex-col">
          <span className="font-medium">{m.name}</span>
          <span className="text-xs text-muted-foreground">{m.email}</span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: t('columns.subject'),
      cell: (m) => <span className="line-clamp-1">{m.subject}</span>,
    },
    {
      key: 'status',
      header: t('columns.status'),
      cell: (m) => (
        <Badge variant={m.status === 'HANDLED' ? 'success' : 'secondary'}>
          {t(`status.${m.status}`)}
        </Badge>
      ),
    },
    {
      key: 'received',
      header: t('columns.received'),
      cell: (m) => dateFmt.format(new Date(m.createdAt)),
      className: 'text-muted-foreground',
    },
    {
      key: 'actions',
      header: <span className="sr-only">{t('actions')}</span>,
      cell: (m) => <ContactRowActions message={m} />,
      className: 'w-28 text-end',
    },
  ];

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const STATUS_FILTERS: { label: string; value: ContactStatus | undefined }[] = [
    { label: t('filters.all'), value: undefined },
    { label: t('status.NEW'), value: 'NEW' },
    { label: t('status.HANDLED'), value: 'HANDLED' },
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
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.label}
              size="sm"
              variant={status === f.value ? 'default' : 'outline'}
              onClick={() => {
                setStatus(f.value);
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
        rowKey={(m) => m.id}
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
