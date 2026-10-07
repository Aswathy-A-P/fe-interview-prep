import { changeView, DEFAULT_VIEW, parseView, serializeView, type TableView } from './tableView.ts';

const SORTABLE = ['id', 'words'];

describe('table view in the URL', () => {
  it('round-trips a full view through the query string', () => {
    const view: TableView = {
      q: 'life',
      author: 'Rumi',
      sort: { columnId: 'words', direction: 'desc' },
      page: 3,
      size: 25,
    };
    const query = serializeView(view).toString();
    expect(query).toBe('q=life&author=Rumi&sort=words&dir=desc&page=3&size=25');
    expect(parseView(new URLSearchParams(query), SORTABLE)).toEqual(view);
  });

  it('leaves defaults out of the URL', () => {
    expect(serializeView(DEFAULT_VIEW).toString()).toBe('');
  });

  it('falls back to defaults for invalid values', () => {
    const params = new URLSearchParams('sort=quote&dir=asc&page=-2&size=13');
    expect(parseView(params, SORTABLE)).toEqual(DEFAULT_VIEW);
    expect(parseView(new URLSearchParams('sort=id&dir=up&page=abc'), SORTABLE)).toEqual(
      DEFAULT_VIEW,
    );
  });

  it('goes back to page 1 when search, filter, sort or page size change', () => {
    const onPage4 = { ...DEFAULT_VIEW, page: 4 };
    expect(changeView(onPage4, { author: 'Rumi' })).toEqual({
      ...DEFAULT_VIEW,
      author: 'Rumi',
    });
    expect(changeView(onPage4, { q: 'x' }).page).toBe(1);
    expect(changeView(onPage4, { size: 50 }).page).toBe(1);
  });
});
