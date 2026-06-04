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
import { getApiErrorStatus } from '@/lib/api-error';
import {
  createPasswordSchema,
  type PasswordValues,
} from '../schemas/user.schemas';
import { useChangePassword } from '../hooks/use-profile';

export function ChangePasswordForm() {
  const t = useTranslations('account');
  const tErr = useTranslations('auth.errors');
  const change = useChangePassword();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(createPasswordSchema(tErr)),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  function onSubmit(values: PasswordValues) {
    change.mutate(values, { onSuccess: () => form.reset() });
  }

  const serverError =
    change.isError &&
    (getApiErrorStatus(change.error) === 401
      ? t('password.currentWrong')
      : tErr('generic'));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('password.title')}</CardTitle>
        <CardDescription>{t('password.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password.current')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password.new')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError ? (
              <p className="text-sm font-medium text-destructive">{serverError}</p>
            ) : null}
            {change.isSuccess ? (
              <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="size-4" /> {t('password.changed')}
              </p>
            ) : null}

            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                t('password.submit')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
