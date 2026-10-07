import { countWords, distinctAuthors, filterByAuthor, toQuoteRow } from './quotes.ts';

const rows = [
  toQuoteRow({ id: 1, quote: 'Be here now.', author: 'Ram Dass' }),
  toQuoteRow({ id: 2, quote: '  Less   is more ', author: 'Mies' }),
  toQuoteRow({ id: 3, quote: 'Stay hungry.', author: 'Ram Dass' }),
];

describe('quote helpers', () => {
  it('counts words regardless of extra whitespace', () => {
    expect(countWords('  Less   is more ')).toBe(3);
    expect(countWords('')).toBe(0);
    expect(rows[0]?.words).toBe(3);
  });

  it('lists each author once, alphabetically', () => {
    expect(distinctAuthors(rows)).toEqual(['Mies', 'Ram Dass']);
  });

  it('filters by exact author and keeps everything when no author is chosen', () => {
    expect(filterByAuthor(rows, 'Ram Dass').map((row) => row.id)).toEqual([1, 3]);
    expect(filterByAuthor(rows, '')).toBe(rows);
  });
});
