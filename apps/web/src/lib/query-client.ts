import { QueryClient } from '@tanstack/react-query';

/** Factory so server and client get fresh instances (avoids cross-request leakage). */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
