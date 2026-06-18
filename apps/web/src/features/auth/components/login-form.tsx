'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
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
import { Link } from '@/i18n/navigation';
import { getApiErrorStatus } from '@/lib/api-error';
import { createLoginSchema, type LoginValues } from '../schemas/auth.schemas';
import { useLogin } from '../hooks/use-auth';

export function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const t = useTranslations('auth');
  const tErr = useTranslations('auth.errors');
  const router = useRouter();
  const login = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(createLoginSchema(tErr)),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values: LoginValues) {
    login.mutate(values, {
      onSuccess: () => router.push(redirectTo),
    });
  }

  const serverError =
    login.isError &&
    (getApiErrorStatus(login.error) === 401
      ? tErr('invalidCredentials')
      : tErr('generic'));

  return (
    <FormWrapper
      title={t('login.title')}
      description={t('login.subtitle')}
      footer={
        <span>
          {t('login.noAccount')}{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t('login.registerLink')}
          </Link>
        </span>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.password')}</FormLabel>
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

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>

          {serverError ? (
            <p className="text-sm font-medium text-destructive">{serverError}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              t('login.submit')
            )}
          </Button>
        </form>
      </Form>
    </FormWrapper>
  );
}
