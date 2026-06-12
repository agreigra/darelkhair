import type { CookieOptions } from 'express';

/** Name of the httpOnly cookie carrying the refresh token. */
export const REFRESH_COOKIE = 'dek_refresh';

/**
 * Cookie options for the refresh token. httpOnly so JS can't read it (XSS-safe);
 * the access token lives in memory on the client instead.
 */
export function refreshCookieOptions(
  isProduction: boolean,
  sameSite: 'lax' | 'none' | 'strict' = 'lax',
  expiresAt?: Date,
): CookieOptions {
  return {
    httpOnly: true,
    // Browsers only accept SameSite=None over HTTPS, so it implies Secure.
    secure: isProduction || sameSite === 'none',
    sameSite,
    path: '/',
    ...(expiresAt ? { expires: expiresAt } : {}),
  };
}
