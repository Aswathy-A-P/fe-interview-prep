export interface Product {
  id: number;
  title: string;
  brand?: string;
  category: string;
  price: number;
}

const SEARCH_URL = 'https://dummyjson.com/products/search';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.title === 'string' &&
    (value.brand === undefined || typeof value.brand === 'string') &&
    typeof value.category === 'string' &&
    typeof value.price === 'number'
  );
}

function isSearchResponse(value: unknown): value is { products: Product[] } {
  return isRecord(value) && Array.isArray(value.products) && value.products.every(isProduct);
}

export function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    select: 'title,brand,category,price',
    limit: '20',
  });
  return `${SEARCH_URL}?${params.toString()}`;
}

export async function searchProducts(query: string, signal: AbortSignal): Promise<Product[]> {
  const response = await fetch(buildSearchUrl(query), { signal });
  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!isSearchResponse(data)) {
    throw new Error('The search service returned an unexpected response');
  }
  return data.products;
}
