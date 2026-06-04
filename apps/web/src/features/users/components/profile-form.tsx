'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/api-error';
import { createProfileSchema, type ProfileValues } from '../schemas/user.schemas';
import { useUpdateProfile } from '../hooks/use-profile';
import type { ManagedUser } from '../types/user.types';

export function ProfileForm({ user }: { user: ManagedUser }) {
  const t = useTranslations('account');
  const tf = useTranslations('auth.fields');
  const tErr = useTranslations('auth.errors');
  const update = useUpdateProfile();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(createProfileSchema(tErr)),
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
    },
  });

  function onSubmit(values: ProfileValues) {
    update.mutate({
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      phone: values.phone || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.title')}</CardTitle>
        <CardDescription>{t('profile.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{tf('email')}</Label>
              <Input value={user.email} disabled readOnly />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tf('firstName')}</FormLabel>
                    <FormControl>
                      <Input autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tf('lastName')}</FormLabel>
                    <FormControl>
                      <Input autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tf('phone')}</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {update.isError ? (
              <p className="text-sm font-medium text-destructive">
                {getApiErrorMessage(update.error, tErr('generic'))}
              </p>
            ) : null}
            {update.isSuccess ? (
              <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="size-4" /> {t('saved')}
              </p>
            ) : null}

            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? <Loader2 className="animate-spin" /> : t('save')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
