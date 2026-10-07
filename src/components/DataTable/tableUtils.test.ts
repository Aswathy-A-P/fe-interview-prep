import { nextSort, pageCount, paginate, searchRows, sortRows, type Column } from './tableUtils.ts';

interface Person {
  id: number;
  name: string;
  age: number;
}

const people: Person[] = [
  { id: 1, name: 'Bea', age: 30 },
  { id: 2, name: 'adam', age: 9 },
  { id: 3, name: 'Cleo', age: 30 },
  { id: 4, name: 'Dan', age: 100 },
];

const columns: Column<Person>[] = [
  { id: 'name', header: 'Name', accessor: (person) => person.name },
  { id: 'age', header: 'Age', accessor: (person) => person.age },
];

const ids = (rows: Person[]) => rows.map((row) => row.id);

describe('nextSort', () => {
  it('cycles ascending, descending, then none', () => {
    const asc = nextSort(null, 'age');
    expect(asc).toEqual({ columnId: 'age', direction: 'asc' });
    const desc = nextSort(asc, 'age');
    expect(desc).toEqual({ columnId: 'age', direction: 'desc' });
    expect(nextSort(desc, 'age')).toBeNull();
  });

  it('starts ascending when switching to another column', () => {
    expect(nextSort({ columnId: 'age', direction: 'desc' }, 'name')).toEqual({
      columnId: 'name',
      direction: 'asc',
    });
  });
});

describe('sortRows', () => {
  it('sorts numbers numerically and keeps ties in their original order', () => {
    expect(ids(sortRows(people, columns, { columnId: 'age', direction: 'asc' }))).toEqual([
      2, 1, 3, 4,
    ]);
    expect(ids(sortRows(people, columns, { columnId: 'age', direction: 'desc' }))).toEqual([
      4, 1, 3, 2,
    ]);
  });

  it('sorts text case-insensitively', () => {
    expect(ids(sortRows(people, columns, { columnId: 'name', direction: 'asc' }))).toEqual([
      2, 1, 3, 4,
    ]);
  });

  it('returns the rows untouched without a sort or for an unknown column', () => {
    expect(sortRows(people, columns, null)).toBe(people);
    expect(sortRows(people, columns, { columnId: 'nope', direction: 'asc' })).toBe(people);
  });
});

describe('searchRows', () => {
  it('matches any column, ignoring case and surrounding spaces', () => {
    expect(ids(searchRows(people, columns, '  ADA '))).toEqual([2]);
    expect(ids(searchRows(people, columns, '30'))).toEqual([1, 3]);
    expect(searchRows(people, columns, '')).toBe(people);
  });
});

describe('pagination', () => {
  it('slices the requested page', () => {
    expect(ids(paginate(people, 1, 3))).toEqual([1, 2, 3]);
    expect(ids(paginate(people, 2, 3))).toEqual([4]);
  });

  it('counts at least one page', () => {
    expect(pageCount(0, 10)).toBe(1);
    expect(pageCount(51, 25)).toBe(3);
  });
});
