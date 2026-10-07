import {
  addTodo,
  clearCompleted,
  countActive,
  isTodoList,
  renameTodo,
  toggleTodo,
  visibleTodos,
  type Todo,
} from './todos.ts';

const sample: Todo[] = [
  { id: '1', title: 'Write tests', completed: false },
  { id: '2', title: 'Ship it', completed: true },
];

describe('todo helpers', () => {
  it('ignores empty and whitespace-only titles', () => {
    expect(addTodo(sample, '   ', '3')).toBe(sample);
    expect(renameTodo(sample, '1', '')).toBe(sample);
  });

  it('trims titles when adding and renaming', () => {
    expect(addTodo([], '  Buy milk  ', 'a')).toEqual([
      { id: 'a', title: 'Buy milk', completed: false },
    ]);
    expect(renameTodo(sample, '1', '  Renamed ')[0]?.title).toBe('Renamed');
  });

  it('filters, counts and clears without mutating the input', () => {
    expect(visibleTodos(sample, 'active').map((t) => t.id)).toEqual(['1']);
    expect(visibleTodos(sample, 'completed').map((t) => t.id)).toEqual(['2']);
    expect(countActive(toggleTodo(sample, '1'))).toBe(0);
    expect(clearCompleted(sample).map((t) => t.id)).toEqual(['1']);
    expect(sample[1]?.completed).toBe(true);
  });

  it('validates stored data', () => {
    expect(isTodoList(sample)).toBe(true);
    expect(isTodoList([{ id: 1 }])).toBe(false);
    expect(isTodoList('nope')).toBe(false);
  });
});
