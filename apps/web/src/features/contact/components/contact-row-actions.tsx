'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, CheckCircle2, RotateCcw, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDeleteContact, useUpdateContactStatus } from '../hooks/use-contact';
import type { ContactMessage } from '../types/contact.types';

/** Per-row admin actions: read the full message, triage, delete. */
export function ContactRowActions({ message }: { message: ContactMessage }) {
  const t = useTranslations('admin.contact');
  const tc = useTranslations('common');
  const locale = useLocale();
  const update = useUpdateContactStatus();
  const remove = useDeleteContact();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isHandled = message.status === 'HANDLED';
  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  function toggleStatus() {
    update.mutate({ id: message.id, status: isHandled ? 'NEW' : 'HANDLED' });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setOpen(true)}
        >
          <Eye className="size-4" />
          <span className="sr-only">{t('view')}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={update.isPending}
          onClick={toggleStatus}
          title={isHandled ? t('markNew') : t('markHandled')}
        >
          {isHandled ? (
            <RotateCcw className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <span className="sr-only">
            {isHandled ? t('markNew') : t('markHandled')}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">{tc('delete')}</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{message.subject}</DialogTitle>
            <DialogDescription>
              {message.name} · {dateFmt.format(new Date(message.createdAt))}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(
                `Re: ${message.subject}`,
              )}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Mail className="size-4" /> {message.email}
            </a>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {message.message}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={update.isPending}
              onClick={() => {
                toggleStatus();
                setOpen(false);
              }}
            >
              {isHandled ? t('markNew') : t('markHandled')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          remove.mutate(message.id, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </>
  );
}
