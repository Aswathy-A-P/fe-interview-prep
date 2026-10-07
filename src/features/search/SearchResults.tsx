import Button from '../../components/ui/Button.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import Highlight from './Highlight.tsx';
import type { SearchState } from './useProductSearch.ts';

interface SearchResultsProps {
  state: SearchState;
  query: string;
  onRetry: () => void;
}

const priceFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function SearchResults({ state, query, onRetry }: SearchResultsProps) {
  switch (state.status) {
    case 'idle':
      return <p className="text-muted">Start typing to search products.</p>;
    case 'loading':
      return (
        <p role="status" className="text-muted">
          Loading…
        </p>
      );
    case 'error':
      return (
        <div role="alert" className="flex items-center gap-3">
          <p className="text-danger">Could not load results: {state.message}</p>
          <Button variant="primary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      );
    case 'success':
      if (state.products.length === 0) {
        return <p className="text-muted">No results for '{query}'</p>;
      }
      return (
        <ul className={cn(cardClass, 'm-0 list-none p-0')} aria-label="Search results">
          {state.products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 border-b border-border px-3 py-2 last:border-b-0"
            >
              <div>
                <div className="font-semibold">
                  <Highlight text={product.title} query={query} />
                </div>
                <div className="text-muted">
                  {product.brand && (
                    <>
                      <Highlight text={product.brand} query={query} /> ·{' '}
                    </>
                  )}
                  {product.category}
                </div>
              </div>
              <span className="whitespace-nowrap">{priceFormat.format(product.price)}</span>
            </li>
          ))}
        </ul>
      );
  }
}

export default SearchResults;
