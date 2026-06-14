'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Global route-transition spinner (Bug 9). The App Router exposes no router
 * events, so navigation *start* is detected by intercepting internal link
 * clicks + back/forward; *completion* is when the pathname changes.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const running = useRef(false);
  const firstRender = useRef(true);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (running.current) return;
    running.current = true;
    setVisible(true);
    // Auto-clear if a navigation is cancelled or never resolves.
    if (safety.current) clearTimeout(safety.current);
    safety.current = setTimeout(() => done(), 10_000);
  }

  function done() {
    if (!running.current) return;
    running.current = false;
    if (safety.current) clearTimeout(safety.current);
    setVisible(false);
  }

  // Completion: the resolved pathname changed → the new page is rendering.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Start detection: capture internal link clicks + browser back/forward.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as Element | null)?.closest('a');
      if (!anchor) return;
      const target = anchor.getAttribute('target');
      if ((target && target !== '_self') || anchor.hasAttribute('download')) {
        return;
      }
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return; // external
      // Same path (incl. hash-only links) → no route transition.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      start();
    }

    function onPopState() {
      start();
    }

    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener('popstate', onPopState);
      if (safety.current) clearTimeout(safety.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed left-1/2 top-4 z-[100] flex size-10 -translate-x-1/2 items-center justify-center rounded-full border bg-background/90 shadow-md backdrop-blur"
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="size-5 animate-spin text-primary" />
    </div>
  );
}
