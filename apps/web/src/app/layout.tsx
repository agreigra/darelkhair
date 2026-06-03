import type { ReactNode } from 'react';
import './globals.css';

/**
 * Pass-through root layout. The real <html>/<body> with locale + dir lives in
 * app/[locale]/layout.tsx so direction can switch per locale (RTL for Arabic).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
