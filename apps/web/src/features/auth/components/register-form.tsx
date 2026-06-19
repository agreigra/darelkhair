'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormWrapper } from '@/components/shared/form-wrapper';
import { getApiErrorStatus } from '@/lib/api-error';
import {
  createRegisterSchema,
  type RegisterValues,
} from '../schemas/auth.schemas';
import { useRegister, useResendVerification } from '../hooks/use-auth';

export function RegisterForm() {
  const t = useTranslations('auth');
  const tErr = useTranslations('auth.errors');
  const register = useRegister();
  const resend = useResendVerification();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(createRegisterSchema(tErr)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  function onSubmit(values: RegisterValues) {
    // Drop empty optional strings before sending.
    register.mutate({
      email: values.email,
      password: values.password,
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      phone: values.phone || undefined,
    });
  }

  // After signup the user is NOT logged in — they must verify their email.
  if (register.isSuccess) {
    const email = register.data.email;
    return (
      <FormWrapper
        title={t('verifyEmail.sentTitle')}
        description={t('verifyEmail.sentSubtitle', { email })}
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('verifyEmail.backToLogin')}
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t('verifyEmail.sentBody')}
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={resend.isPending || resend.isSuccess}
          onClick={() => resend.mutate({ email })}
        >
          {resend.isPending ? (
            <Loader2 className="animate-spin" />
          ) : resend.isSuccess ? (
            t('verifyEmail.resent')
          ) : (
            t('verifyEmail.resend')
          )}
        </Button>
      </FormWrapper>
    );
  }

  const serverError =
    register.isError &&
    (getApiErrorStatus(register.error) === 409
      ? tErr('emailTaken')
      : tErr('generic'));

  return (
    <FormWrapper
      title={t('register.title')}
      description={t('register.subtitle')}
      footer={
        <span>
          {t('register.hasAccount')}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('register.loginLink')}
          </Link>
        </span>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.firstName')}</FormLabel>
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
                  <FormLabel>{t('fields.lastName')}</FormLabel>
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.phone')}</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.password')}</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError ? (
            <p className="text-sm font-medium text-destructive">{serverError}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              t('register.submit')
            )}
          </Button>
        </form>
      </Form>
    </FormWrapper>
  );
}
