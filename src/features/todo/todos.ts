export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export const FILTERS = ['all', 'active', 'completed'] as const;
export type Filter = (typeof FILTERS)[number];

export function isFilter(value: unknown): value is Filter {
  return typeof value === 'string' && (FILTERS as readonly string[]).includes(value);
}

export function isTodoList(value: unknown): value is Todo[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Todo).id === 'string' &&
        typeof (item as Todo).title === 'string' &&
        typeof (item as Todo).completed === 'boolean',
    )
  );
}

export function addTodo(todos: Todo[], title: string, id: string): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos;
  return [...todos, { id, title: trimmed, completed: false }];
}

export function renameTodo(todos: Todo[], id: string, title: string): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos;
  return todos.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo));
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

export function clearCompleted(todos: Todo[]): Todo[] {
  return todos.filter((todo) => !todo.completed);
}

export function visibleTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === 'active') return todos.filter((todo) => !todo.completed);
  if (filter === 'completed') return todos.filter((todo) => todo.completed);
  return todos;
}

export function countActive(todos: Todo[]): number {
  return todos.filter((todo) => !todo.completed).length;
}

export function moveTodo(todos: Todo[], fromId: string, toId: string): Todo[] {
  const from = todos.findIndex((todo) => todo.id === fromId);
  const to = todos.findIndex((todo) => todo.id === toId);
  if (from === -1 || to === -1 || from === to) return todos;
  const next = [...todos];
  const [moved] = next.splice(from, 1);
  if (moved) next.splice(to, 0, moved);
  return next;
}
