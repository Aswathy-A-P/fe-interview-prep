import { splitByMatch } from './splitByMatch.ts';

describe('splitByMatch', () => {
  it('marks every case-insensitive occurrence of the query', () => {
    expect(splitByMatch('iPhone and phone case', 'PHONE')).toEqual([
      { text: 'i', match: false },
      { text: 'Phone', match: true },
      { text: ' and ', match: false },
      { text: 'phone', match: true },
      { text: ' case', match: false },
    ]);
  });

  it('returns the whole text unmarked when the query is blank or missing', () => {
    expect(splitByMatch('Laptop', '  ')).toEqual([{ text: 'Laptop', match: false }]);
    expect(splitByMatch('Laptop', 'phone')).toEqual([{ text: 'Laptop', match: false }]);
  });

  it('treats regex characters in the query literally', () => {
    expect(splitByMatch('C++ (2nd ed.)', '(2nd')).toEqual([
      { text: 'C++ ', match: false },
      { text: '(2nd', match: true },
      { text: ' ed.)', match: false },
    ]);
  });
});
