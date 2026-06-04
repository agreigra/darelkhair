'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Loader2, Star, Trash2, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApartmentImages } from '../hooks/use-admin-apartments';
import type { ApartmentImage } from '../types/apartment.types';

/** Edit-mode image manager: add by URL, set cover, remove. (Uploads come in Feature 7.) */
export function ApartmentImages({
  apartmentId,
  images,
}: {
  apartmentId: string;
  images: ApartmentImage[];
}) {
  const t = useTranslations('apartments.images');
  const { addImage, removeImage, setCover } = useApartmentImages(apartmentId);
  const [url, setUrl] = useState('');

  function onAdd() {
    const value = url.trim();
    if (!value) return;
    addImage.mutate(
      { url: value, isCover: images.length === 0 },
      { onSuccess: () => setUrl('') },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAdd();
              }
            }}
          />
          <Button type="button" onClick={onAdd} disabled={addImage.isPending}>
            {addImage.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus />
            )}
            {t('add')}
          </Button>
        </div>

        {images.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
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
