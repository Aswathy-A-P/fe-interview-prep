import { useState, type FormEvent } from 'react';
import Button from '../../components/ui/Button.tsx';
import { cardClass, fieldClass } from '../../components/ui/fieldStyles.ts';
import { usePersistentState } from '../../hooks/usePersistentState.ts';
import { cn } from '../../lib/cn.ts';
import TodoItem from './TodoItem.tsx';
import {
  FILTERS,
  addTodo,
  clearCompleted,
  countActive,
  deleteTodo,
  isFilter,
  isTodoList,
  renameTodo,
  toggleTodo,
  visibleTodos,
  type Filter,
  type Todo,
} from './todos.ts';

export const TODOS_KEY = 'q1.todos';
export const FILTER_KEY = 'q1.filter';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
};

function TodoPage() {
  const [todos, setTodos] = usePersistentState<Todo[]>(TODOS_KEY, [], { isValid: isTodoList });
  const [filter, setFilter] = usePersistentState<Filter>(FILTER_KEY, 'all', { isValid: isFilter });
  const [title, setTitle] = useState('');

  const shown = visibleTodos(todos, filter);
  const itemsLeft = countActive(todos);
  const hasCompleted = todos.length > itemsLeft;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTodos((current) => addTodo(current, title, crypto.randomUUID()));
    setTitle('');
  };

  return (
    <section className="max-w-[560px]">
      <h1 className="mb-4 text-3xl font-bold">Todo App</h1>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          aria-label="New todo"
          className={cn(fieldClass, 'flex-1')}
        />
        <Button type="submit" variant="primary">
          Add
        </Button>
      </form>

      <div className="my-4 flex items-center gap-2" role="group" aria-label="Filter todos">
        {FILTERS.map((option) => (
          <Button
            key={option}
            type="button"
            aria-pressed={filter === option}
            variant={filter === option ? 'primary' : 'default'}
            onClick={() => setFilter(option)}
          >
            {FILTER_LABELS[option]}
          </Button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-muted">
          {todos.length === 0 ? 'Nothing to do yet.' : 'No todos match this filter.'}
        </p>
      ) : (
        <ul className={cn(cardClass, 'm-0 list-none p-0')}>
          {shown.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={(id) => setTodos((current) => toggleTodo(current, id))}
              onRename={(id, next) => setTodos((current) => renameTodo(current, id, next))}
              onDelete={(id) => setTodos((current) => deleteTodo(current, id))}
            />
          ))}
        </ul>
      )}

      <footer className="mt-4 flex items-center justify-between gap-2">
        <span>
          {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
        </span>
        <Button type="button" onClick={() => setTodos(clearCompleted)} disabled={!hasCompleted}>
          Clear completed
        </Button>
      </footer>
    </section>
  );
}

export default TodoPage;
