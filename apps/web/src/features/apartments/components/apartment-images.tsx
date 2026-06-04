'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Loader2, Star, Trash2, Upload } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api-error';
import { useApartmentImages } from '../hooks/use-admin-apartments';
import type { ApartmentImage } from '../types/apartment.types';

/** Edit-mode image manager: upload files (→ Cloudflare R2 / local), set cover, remove. */
export function ApartmentImages({
  apartmentId,
  images,
}: {
  apartmentId: string;
  images: ApartmentImage[];
}) {
  const t = useTranslations('apartments.images');
  const { uploadImage, removeImage, setCover } = useApartmentImages(apartmentId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    // Upload sequentially so cover/sort order stays deterministic.
    for (const file of Array.from(files)) {
      await uploadImage.mutateAsync(file).catch(() => undefined);
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => void uploadFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void uploadFiles(e.dataTransfer.files);
          }}
          disabled={uploadImage.isPending}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground',
            dragOver && 'border-primary bg-accent',
          )}
        >
          {uploadImage.isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Upload className="size-6" />
          )}
          <span>{uploadImage.isPending ? t('uploading') : t('dropzone')}</span>
          <span className="text-xs">{t('hint')}</span>
        </button>

        {uploadImage.isError ? (
          <p className="text-sm font-medium text-destructive">
            {getApiErrorMessage(uploadImage.error, t('uploadFailed'))}
          </p>
        ) : null}

        {images.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-lg border"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={img.url}
                    alt={img.alt ?? ''}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                {img.isCover ? (
                  <Badge className="absolute start-2 top-2 gap-1">
                    <Star className="size-3" /> {t('cover')}
                  </Badge>
                ) : null}
                <div className="flex items-center justify-between gap-1 p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={img.isCover || setCover.isPending}
                    onClick={() => setCover.mutate(img.id)}
                  >
                    <Star className="size-3.5" /> {t('makeCover')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    disabled={removeImage.isPending}
                    onClick={() => removeImage.mutate(img.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
