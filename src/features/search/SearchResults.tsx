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
      return <p className="muted">Start typing to search products.</p>;
    case 'loading':
      return (
        <p role="status" className="muted">
          Loading…
        </p>
      );
    case 'error':
      return (
        <div role="alert" className="search-error">
          <p className="error">Could not load results: {state.message}</p>
          <button type="button" className="primary" onClick={onRetry}>
            Retry
          </button>
        </div>
      );
    case 'success':
      if (state.products.length === 0) {
        return <p className="muted">No results for '{query}'</p>;
      }
      return (
        <ul className="search-results" aria-label="Search results">
          {state.products.map((product) => (
            <li key={product.id} className="search-result">
              <div>
                <div className="search-title">
                  <Highlight text={product.title} query={query} />
                </div>
                <div className="muted">
                  {product.brand && (
                    <>
                      <Highlight text={product.brand} query={query} /> ·{' '}
                    </>
                  )}
                  {product.category}
                </div>
              </div>
              <span className="search-price">{priceFormat.format(product.price)}</span>
            </li>
          ))}
        </ul>
      );
  }
}

export default SearchResults;
