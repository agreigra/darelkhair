import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Locale routing only. Route protection is handled client-side
 * (AuthGuard / AdminGuard) — in a split web/API deployment the httpOnly refresh
 * cookie lives on the API's domain and is NOT visible to this web-domain
 * middleware, so a cookie-presence gate here can't work. The API still enforces
 * real auth + RBAC on every request regardless.
 */
export default createMiddleware(routing);

export const config = {
  // Match all paths except API, Next internals, and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
