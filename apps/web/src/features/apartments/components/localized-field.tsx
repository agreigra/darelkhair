'use client';

import { type Control, type FieldPath, useFormState } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { locales, isRtl, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { ApartmentFormValues } from '../schemas/apartment.schemas';

const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

type LocalizedFieldName = 'title' | 'description' | 'city' | 'address';

interface LocalizedFieldProps {
  control: Control<ApartmentFormValues>;
  name: LocalizedFieldName;
  label: string;
  required?: boolean;
  multiline?: boolean;
}

/**
 * Per-language tabbed editor for a localized field. The admin fills FR / AR / EN
 * under tabs; a dot marks a tab whose locale has a validation error. Arabic
 * inputs render RTL. Submitting assembles `{ fr, ar, en }` for the JSON column.
 */
export function LocalizedField({
  control,
  name,
  label,
  required = false,
  multiline = false,
}: LocalizedFieldProps) {
  const { errors } = useFormState({ control, name });
  const fieldErrors = errors[name] as
    | Partial<Record<Locale, unknown>>
    | undefined;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Tabs defaultValue={locales[0]}>
        <TabsList>
          {locales.map((loc) => (
            <TabsTrigger key={loc} value={loc} className="gap-1.5">
              {LOCALE_LABELS[loc]}
              {fieldErrors?.[loc] ? (
                <span className="size-1.5 rounded-full bg-destructive" />
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        {locales.map((loc) => (
          <TabsContent key={loc} value={loc} className="mt-2">
            <FormField
              control={control}
              name={`${name}.${loc}` as FieldPath<ApartmentFormValues>}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    {multiline ? (
                      <Textarea
                        dir={isRtl(loc) ? 'rtl' : 'ltr'}
                        className={cn('min-h-28', isRtl(loc) && 'text-right')}
                        {...field}
                        value={(field.value as string) ?? ''}
                      />
                    ) : (
                      <Input
                        dir={isRtl(loc) ? 'rtl' : 'ltr'}
                        className={cn(isRtl(loc) && 'text-right')}
                        {...field}
                        value={(field.value as string) ?? ''}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
