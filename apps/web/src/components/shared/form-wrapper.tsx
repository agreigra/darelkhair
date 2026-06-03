import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FormWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Consistent shell for every form (auth, apartments, bookings…). Keeps spacing
 * and headings uniform so feature forms only supply fields, not chrome.
 */
export function FormWrapper({
  title,
  description,
  children,
  footer,
}: FormWrapperProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {footer ? (
          <div className="text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
