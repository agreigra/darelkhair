import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Name of the backend's httpOnly refresh cookie (see API auth.cookies.ts).
const REFRESH_COOKIE = 'dek_refresh';

// Paths (locale-stripped) that require a session. This is a coarse UX gate by
// cookie presence — the API enforces real auth + RBAC on every request.
const PROTECTED_PREFIXES = ['/dashboard', '/bookings', '/account', '/admin'];

function stripLocale(pathname: string): {
  locale: string;
  path: string;
  hasLocale: boolean;
} {
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocale = (routing.locales as readonly string[]).includes(maybeLocale);
  return {
    locale: hasLocale ? maybeLocale : routing.defaultLocale,
    path: '/' + (hasLocale ? segments.slice(1) : segments).join('/'),
    hasLocale,
  };
}

export default function middleware(req: NextRequest): NextResponse {
  const { locale, path } = stripLocale(req.nextUrl.pathname);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (isProtected && !req.cookies.has(REFRESH_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = `?returnTo=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  // Match all paths except API, Next internals, and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
