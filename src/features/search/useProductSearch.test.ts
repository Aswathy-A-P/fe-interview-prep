import { act, renderHook, waitFor } from '@testing-library/react';
import type { Product } from './api.ts';
import { useProductSearch } from './useProductSearch.ts';

function product(id: number, title: string): Product {
  return { id, title, brand: 'Acme', category: 'misc', price: 1 };
}

function respondWith(products: Product[]): Response {
  return new Response(JSON.stringify({ products }));
}

describe('useProductSearch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is idle for an empty query and does not fetch', () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const { result } = renderHook(() => useProductSearch(''));
    expect(result.current.state).toEqual({ status: 'idle' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the newest results when an older response arrives late', async () => {
    const pending: ((response: Response) => void)[] = [];
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => new Promise<Response>((resolve) => pending.push(resolve)));

    const { result, rerender } = renderHook(({ query }) => useProductSearch(query), {
      initialProps: { query: 'pho' },
    });
    rerender({ query: 'phone' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.state).toEqual({ status: 'loading' });

    const [resolveOld, resolveNew] = pending;
    await act(async () => resolveNew?.(respondWith([product(2, 'New phone')])));
    await act(async () => resolveOld?.(respondWith([product(1, 'Old pho result')])));

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: 'success',
        products: [product(2, 'New phone')],
      }),
    );
  });

  it('aborts the in-flight request when the query changes or the component unmounts', () => {
    const signals: AbortSignal[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      if (init?.signal) {
        signals.push(init.signal);
      }
      return new Promise<Response>(() => {});
    });

    const { rerender, unmount } = renderHook(({ query }) => useProductSearch(query), {
      initialProps: { query: 'a' },
    });
    rerender({ query: 'ab' });
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);

    unmount();
    expect(signals[1]?.aborted).toBe(true);
  });
});
