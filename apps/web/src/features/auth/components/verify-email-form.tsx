'use client';

import { useEffect, useRef } from 'react';
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
import { useVerifyEmail, useResendVerification } from '../hooks/use-auth';

export function VerifyEmailForm({ token }: { token?: string }) {
  const t = useTranslations('auth');
  const verify = useVerifyEmail();

  // Auto-verify once on mount when a token is present (the click is the intent).
  // The ref guards against React's double-invoked effects in dev/StrictMode.
  const fired = useRef(false);
  useEffect(() => {
    if (token && !fired.current) {
      fired.current = true;
      verify.mutate({ token });
    }
  }, [token, verify]);

  if (verify.isSuccess) {
    return (
      <FormWrapper
        title={t('verifyEmail.successTitle')}
        description={t('verifyEmail.successSubtitle')}
      >
        <Button asChild className="w-full">
          <Link href="/login">{t('verifyEmail.goToLogin')}</Link>
        </Button>
      </FormWrapper>
    );
  }

  // Still working (or about to fire): show a spinner.
  if (token && !verify.isError) {
    return (
      <FormWrapper title={t('verifyEmail.verifyingTitle')}>
        <div className="flex justify-center py-4">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </FormWrapper>
    );
  }

  // No token, or verification failed → explain + let them request a new link.
  return (
    <FormWrapper
      title={t('verifyEmail.invalidTitle')}
      description={t('verifyEmail.invalidSubtitle')}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t('verifyEmail.backToLogin')}
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground">
        {t('verifyEmail.invalidBody')}
      </p>
      <ResendForm />
    </FormWrapper>
  );
}

/** Inline "send me a new link" form shown on the invalid/expired screen. */
function ResendForm() {
  const t = useTranslations('auth');
  const tErr = useTranslations('auth.errors');
  const resend = useResendVerification();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(createForgotPasswordSchema(tErr)),
    defaultValues: { email: '' },
  });

  if (resend.isSuccess) {
    return (
      <p className="text-sm font-medium text-primary">
        {t('verifyEmail.resent')}
      </p>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => resend.mutate(v))}
        className="space-y-4"
      >
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
        <Button type="submit" className="w-full" disabled={resend.isPending}>
          {resend.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            t('verifyEmail.resend')
          )}
        </Button>
      </form>
    </Form>
  );
}
