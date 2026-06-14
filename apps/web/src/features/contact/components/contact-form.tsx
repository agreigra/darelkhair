'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
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
import { getApiErrorMessage } from '@/lib/api-error';
import { createContactSchema, type ContactValues } from '../schemas/contact.schemas';
import { useSubmitContact } from '../hooks/use-contact';

/** Public "Send us a message" form. Shows a success panel after submitting. */
export function ContactForm() {
  const t = useTranslations('contact');
  const tErr = useTranslations('contact.errors');
  const submit = useSubmitContact();

  const form = useForm<ContactValues>({
    resolver: zodResolver(createContactSchema(tErr)),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  function onSubmit(values: ContactValues) {
    submit.mutate(values, { onSuccess: () => form.reset() });
  }

  const serverError =
    submit.isError && getApiErrorMessage(submit.error, tErr('generic'));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t('formTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {submit.isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="size-12 text-success" />
            <p className="text-lg font-medium">{t('successTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('successBody')}</p>
            <Button variant="outline" onClick={() => submit.reset()}>
              {t('sendAnother')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.name')}</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.subject')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.message')}</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError ? (
                <p className="text-sm font-medium text-destructive">
                  {serverError}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={submit.isPending}
              >
                {submit.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  t('submit')
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
