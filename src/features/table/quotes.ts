export interface Quote {
  id: number;
  quote: string;
  author: string;
}

export interface QuoteRow extends Quote {
  words: number;
}

export const QUOTES_URL = 'https://dummyjson.com/quotes?limit=0';

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function toQuoteRow(quote: Quote): QuoteRow {
  return { ...quote, words: countWords(quote.quote) };
}

export async function fetchQuotes(signal: AbortSignal): Promise<QuoteRow[]> {
  const response = await fetch(QUOTES_URL, { signal });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  const data = (await response.json()) as { quotes: Quote[] };
  return data.quotes.map(toQuoteRow);
}

export function distinctAuthors(rows: QuoteRow[]): string[] {
  return [...new Set(rows.map((row) => row.author))].sort((a, b) => a.localeCompare(b));
}

export function filterByAuthor(rows: QuoteRow[], author: string): QuoteRow[] {
  return author ? rows.filter((row) => row.author === author) : rows;
}
