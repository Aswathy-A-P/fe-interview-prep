import {
  changeView,
  DEFAULT_VIEW,
  parseView,
  serializeView,
  toggleColumn,
  type TableView,
} from './tableView.ts';

const SORTABLE = ['id', 'words'];
const COLUMN_IDS = ['id', 'quote', 'author', 'words'];

describe('table view in the URL', () => {
  it('round-trips a full view through the query string', () => {
    const view: TableView = {
      q: 'life',
      author: 'Rumi',
      sort: { columnId: 'words', direction: 'desc' },
      page: 3,
      size: 25,
      hidden: ['author'],
      mode: 'client',
    };
    const query = serializeView(view).toString();
    expect(query).toBe('q=life&author=Rumi&sort=words&dir=desc&page=3&size=25&hide=author');
    expect(parseView(new URLSearchParams(query), SORTABLE, COLUMN_IDS)).toEqual(view);
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

  it('keeps only known hidden columns and never hides all of them', () => {
    const parse = (query: string) =>
      parseView(new URLSearchParams(query), SORTABLE, COLUMN_IDS).hidden;
    expect(parse('hide=words&hide=nope&hide=id')).toEqual(['id', 'words']);
    expect(parse('hide=id&hide=quote&hide=author&hide=words')).toEqual([]);
  });

  it('toggles a column without leaving the page and keeps one visible', () => {
    const onPage2 = { ...DEFAULT_VIEW, page: 2, hidden: ['id', 'quote', 'words'] };
    expect(toggleColumn(onPage2, COLUMN_IDS, 'author', false)).toBe(onPage2);
    expect(toggleColumn(onPage2, COLUMN_IDS, 'quote', true)).toEqual({
      ...onPage2,
      hidden: ['id', 'words'],
    });
  });

  it('drops search, filter and sort in server mode', () => {
    const params = new URLSearchParams('mode=server&q=x&author=Rumi&sort=id&dir=asc&page=2');
    expect(parseView(params, SORTABLE)).toEqual({ ...DEFAULT_VIEW, mode: 'server', page: 2 });
    expect(serializeView({ ...DEFAULT_VIEW, mode: 'server', q: 'x' }).toString()).toBe(
      'mode=server',
    );
  });
});
