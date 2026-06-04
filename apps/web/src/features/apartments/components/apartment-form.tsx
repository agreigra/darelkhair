'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getApiErrorMessage } from '@/lib/api-error';
import type { LocalizedText } from '@/lib/i18n-content';
import {
  createApartmentSchema,
  type ApartmentFormValues,
} from '../schemas/apartment.schemas';
import {
  useCreateApartment,
  useUpdateApartment,
} from '../hooks/use-admin-apartments';
import { LocalizedField } from './localized-field';
import type { Apartment } from '../types/apartment.types';

const EMPTY_LOCALIZED = { fr: '', ar: '', en: '' };

function toFormLocalized(value: LocalizedText | null | undefined) {
  return {
    fr: value?.fr ?? '',
    ar: value?.ar ?? '',
    en: value?.en ?? '',
  };
}

/** Drop a localized field if every locale is empty, else send the filled object. */
function cleanLocalized(
  value: { fr?: string; ar?: string; en?: string } | undefined,
): LocalizedText | undefined {
  if (!value) return undefined;
  const filled = Object.values(value).some(
    (v) => (v ?? '').trim().length > 0,
  );
  return filled ? value : undefined;
}

export function ApartmentForm({ apartment }: { apartment?: Apartment }) {
  const t = useTranslations('apartments.form');
  const tErr = useTranslations('apartments.errors');
  const router = useRouter();
  const isEdit = Boolean(apartment);

  const create = useCreateApartment();
  const update = useUpdateApartment(apartment?.id ?? '');
  const mutation = isEdit ? update : create;

  const form = useForm<ApartmentFormValues>({
    resolver: zodResolver(createApartmentSchema(tErr)),
    defaultValues: {
      title: toFormLocalized(apartment?.title),
      description: toFormLocalized(apartment?.description),
      city: toFormLocalized(apartment?.city),
      address: toFormLocalized(apartment?.address),
      pricePerNight: apartment?.pricePerNight ?? 0,
      bedrooms: apartment?.bedrooms ?? 1,
      bathrooms: apartment?.bathrooms ?? 1,
      maxGuests: apartment?.maxGuests ?? 2,
      isPublished: apartment?.isPublished ?? false,
    },
  });

  function onSubmit(values: ApartmentFormValues) {
    const payload = {
      title: values.title,
      description: cleanLocalized(values.description),
      city: cleanLocalized(values.city),
      address: cleanLocalized(values.address),
      pricePerNight: values.pricePerNight,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      maxGuests: values.maxGuests,
      isPublished: values.isPublished,
    };

    if (isEdit) {
      update.mutate(payload);
    } else {
      create.mutate(payload, {
        onSuccess: (created) =>
          router.push(`/admin/apartments/${created.id}/edit`),
      });
    }
  }

  const NUMERIC: {
    name: 'pricePerNight' | 'bedrooms' | 'bathrooms' | 'maxGuests';
    label: string;
    step?: string;
  }[] = [
    { name: 'pricePerNight', label: t('pricePerNight'), step: '0.01' },
    { name: 'bedrooms', label: t('bedrooms') },
    { name: 'bathrooms', label: t('bathrooms') },
    { name: 'maxGuests', label: t('maxGuests') },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('contentSection')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <LocalizedField
              control={form.control}
              name="title"
              label={t('title')}
              required
            />
            <LocalizedField
              control={form.control}
              name="description"
              label={t('description')}
              multiline
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <LocalizedField
                control={form.control}
                name="city"
                label={t('city')}
              />
              <LocalizedField
                control={form.control}
                name="address"
                label={t('address')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('detailsSection')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {NUMERIC.map((n) => (
                <FormField
                  key={n.name}
                  control={form.control}
                  name={n.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{n.label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={n.step ?? '1'}
                          min={0}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('published')}</FormLabel>
                    <FormDescription>{t('publishedHint')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {mutation.isError ? (
          <p className="text-sm font-medium text-destructive">
            {getApiErrorMessage(mutation.error, tErr('generic'))}
          </p>
        ) : null}
        {isEdit && update.isSuccess ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="size-4" /> {t('saved')}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : isEdit ? (
              t('save')
            ) : (
              t('createSubmit')
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/apartments')}
          >
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
