'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
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
  createForgotPasswordSchema,
  type ForgotPasswordValues,
} from '../schemas/auth.schemas';
import { useForgotPassword } from '../hooks/use-auth';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const tErr = useTranslations('auth.errors');
  const forgot = useForgotPassword();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(createForgotPasswordSchema(tErr)),
    defaultValues: { email: '' },
  });

  function onSubmit(values: ForgotPasswordValues) {
    forgot.mutate(values);
  }

  // Success is intentionally generic — the API never reveals whether the email
  // is registered, so we always show the same "check your inbox" message.
  if (forgot.isSuccess) {
    return (
      <FormWrapper
        title={t('forgotPassword.sentTitle')}
        description={t('forgotPassword.sentSubtitle')}
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('forgotPassword.backToLogin')}
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t('forgotPassword.sentBody')}
        </p>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper
      title={t('forgotPassword.title')}
      description={t('forgotPassword.subtitle')}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t('forgotPassword.backToLogin')}
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {forgot.isError ? (
            <p className="text-sm font-medium text-destructive">
              {tErr('generic')}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              t('forgotPassword.submit')
            )}
          </Button>
        </form>
      </Form>
    </FormWrapper>
  );
}
