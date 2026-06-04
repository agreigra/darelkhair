import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Allow the Image Optimizer to load from wherever the storage layer serves files.
 * Derived from `R2_PUBLIC_URL` so a custom domain (e.g. cdn.darelkhair.xyz) works
 * with zero code changes. Falls back to the generic r2.dev wildcard so default
 * R2 public buckets keep working out of the box.
 */
function storageRemotePattern(): RemotePattern {
  const url = process.env.R2_PUBLIC_URL;
  if (url) {
    try {
      const { protocol, hostname } = new URL(url);
      return { protocol: protocol.replace(':', '') as 'http' | 'https', hostname };
    } catch {
      // ignore a malformed value and fall through to the wildcard
    }
  }
  return { protocol: 'https', hostname: '*.r2.dev' };
}

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      storageRemotePattern(),
    ],
  },
};

export default withNextIntl(nextConfig);
