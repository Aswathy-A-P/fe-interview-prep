import type { Product } from './api.ts';

export const LISTBOX_ID = 'search-results';

export function optionId(product: Product): string {
  return `search-option-${product.id}`;
}
