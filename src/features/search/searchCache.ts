import type { Product } from './api.ts';

const cache = new Map<string, Product[]>();

export function normaliseQuery(query: string): string {
  return query.trim().toLowerCase();
}

export const searchCache = {
  get: (query: string): Product[] | undefined => cache.get(normaliseQuery(query)),
  set: (query: string, products: Product[]): void => {
    cache.set(normaliseQuery(query), products);
  },
  clear: (): void => cache.clear(),
};
