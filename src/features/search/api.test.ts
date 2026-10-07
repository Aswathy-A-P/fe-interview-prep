import { buildSearchUrl, searchProducts } from './api.ts';

describe('searchProducts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('encodes the query in the search url', () => {
    expect(buildSearchUrl('usb c')).toBe(
      'https://dummyjson.com/products/search?q=usb+c&select=title%2Cbrand%2Ccategory%2Cprice&limit=20',
    );
  });

  it('returns the products from a valid response', async () => {
    const products = [{ id: 1, title: 'Phone', brand: 'Acme', category: 'phones', price: 10 }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ products })));

    await expect(searchProducts('phone', new AbortController().signal)).resolves.toEqual(products);
  });

  it('rejects on an http error or an unexpected shape', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock.mockResolvedValueOnce(new Response('oops', { status: 500 }));
    await expect(searchProducts('a', new AbortController().signal)).rejects.toThrow('status 500');

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ products: [{ id: 'x' }] })));
    await expect(searchProducts('a', new AbortController().signal)).rejects.toThrow(
      'unexpected response',
    );
  });
});
