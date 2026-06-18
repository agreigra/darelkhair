'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useRouter, Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormWrapper } from '@/components/shared/form-wrapper';
import {
  createResetPasswordSchema,
  type ResetPasswordValues,
} from '../schemas/auth.schemas';
import { useResetPassword } from '../hooks/use-auth';

export function ResetPasswordForm({ token }: { token?: string }) {
  const t = useTranslations('auth');
  const tErr = useTranslations('auth.errors');
  const router = useRouter();
  const reset = useResetPassword();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(createResetPasswordSchema(tErr)),
    defaultValues: { password: '' },
  });

  function onSubmit(values: ResetPasswordValues) {
    if (!token) return;
    reset.mutate(
      { token, password: values.password },
      { onSuccess: () => router.push('/login') },
    );
  }

  // No token in the URL → the link is malformed; offer to request a new one.
  if (!token) {
    return (
      <FormWrapper
        title={t('resetPassword.invalidTitle')}
        description={t('resetPassword.invalidSubtitle')}
        footer={
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            {t('resetPassword.requestNew')}
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t('resetPassword.invalidBody')}
        </p>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper
      title={t('resetPassword.title')}
      description={t('resetPassword.subtitle')}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t('resetPassword.backToLogin')}
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('resetPassword.newPassword')}</FormLabel>
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

          {reset.isError ? (
            <p className="text-sm font-medium text-destructive">
              {tErr('resetTokenInvalid')}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              t('resetPassword.submit')
            )}
          </Button>
        </form>
      </Form>
    </FormWrapper>
  );
}
