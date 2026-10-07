import { useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts';
import SearchResults from './SearchResults.tsx';
import { useProductSearch } from './useProductSearch.ts';
import './search.css';

export const SEARCH_DELAY_MS = 300;

function SearchPage() {
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), SEARCH_DELAY_MS);
  const { state, retry } = useProductSearch(query);

  return (
    <section className="search">
      <h1>Live Search</h1>
      <label htmlFor="search-input">Search products</label>
      <input
        id="search-input"
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Try “phone” or “laptop”"
        autoComplete="off"
      />
      <SearchResults state={state} query={query} onRetry={retry} />
    </section>
  );
}

export default SearchPage;
