import { useCallback, useEffect, useState } from 'react';
import { searchProducts, type Product } from './api.ts';
import { searchCache } from './searchCache.ts';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] };

type SettledState = Extract<SearchState, { status: 'error' | 'success' }>;

interface SettledRequest {
  query: string;
  attempt: number;
  state: SettledState;
}

export function useProductSearch(query: string): { state: SearchState; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<SettledRequest | null>(null);
  const cached = query === '' ? undefined : searchCache.get(query);

  useEffect(() => {
    if (query === '' || searchCache.get(query)) {
      return;
    }
    const controller = new AbortController();
    const finish = (state: SettledState) => {
      if (!controller.signal.aborted) {
        setSettled({ query, attempt, state });
      }
    };

    searchProducts(query, controller.signal)
      .then((products) => {
        searchCache.set(query, products);
        finish({ status: 'success', products });
      })
      .catch((error: unknown) =>
        finish({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong',
        }),
      );

    return () => controller.abort();
  }, [query, attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  if (query === '') {
    return { state: { status: 'idle' }, retry };
  }
  if (cached) {
    return { state: { status: 'success', products: cached }, retry };
  }
  if (settled === null || settled.query !== query || settled.attempt !== attempt) {
    return { state: { status: 'loading' }, retry };
  }
  return { state: settled.state, retry };
}
