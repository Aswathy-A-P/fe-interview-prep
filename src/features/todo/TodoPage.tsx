import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import Page from '../../components/ui/Page.tsx';
import { cardClass, fieldClass } from '../../components/ui/fieldStyles.ts';
import { usePersistentState } from '../../hooks/usePersistentState.ts';
import { cn } from '../../lib/cn.ts';
import { questions } from '../../questions.ts';
import TodoItem from './TodoItem.tsx';
import {
  FILTERS,
  addTodo,
  clearCompleted,
  countActive,
  deleteTodo,
  isFilter,
  isTodoList,
  moveTodo,
  renameTodo,
  toggleTodo,
  visibleTodos,
  type Filter,
  type Todo,
} from './todos.ts';

export const TODOS_KEY = 'q1.todos';

const TODO_SUMMARY = questions.find((question) => question.path === '/todo')?.summary;

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
};

function TodoPage() {
  const [todos, setTodos] = usePersistentState<Todo[]>(TODOS_KEY, [], { isValid: isTodoList });
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('filter');
  const filter: Filter = isFilter(param) ? param : 'all';
  const [title, setTitle] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const setFilter = (next: Filter) => {
    setSearchParams((params) => {
      const updated = new URLSearchParams(params);
      if (next === 'all') updated.delete('filter');
      else updated.set('filter', next);
      return updated;
    });
  };

  const move = (fromId: string, toId: string) => {
    setTodos((current) => moveTodo(current, fromId, toId));
  };

  const endDrag = () => {
    setDraggedId(null);
    setOverId(null);
  };

  const shown = visibleTodos(todos, filter);
  const itemsLeft = countActive(todos);
  const hasCompleted = todos.length > itemsLeft;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTodos((current) => addTodo(current, title, crypto.randomUUID()));
    setTitle('');
  };

  return (
    <Page title="Todo App" description={TODO_SUMMARY} width="md">
      <div className={cn(cardClass, 'space-y-5 p-6')}>
        <form onSubmit={submit} className="flex items-center gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            aria-label="New todo"
            className={cn(fieldClass, 'min-w-0 flex-1')}
          />
          <Button type="submit" variant="primary">
            Add
          </Button>
        </form>

        <div className="flex justify-center">
          <div
            className="inline-flex gap-1 rounded-lg bg-surface p-1"
            role="group"
            aria-label="Filter todos"
          >
            {FILTERS.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                aria-pressed={filter === option}
                variant={filter === option ? 'primary' : 'ghost'}
                className={cn('px-4', filter !== option && 'shadow-none')}
                onClick={() => setFilter(option)}
              >
                {FILTER_LABELS[option]}
              </Button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted">
            {todos.length === 0 ? 'Nothing to do yet.' : 'No todos match this filter.'}
          </p>
        ) : (
          <ul className="m-0 list-none divide-y divide-border overflow-hidden rounded-lg border border-border p-0">
            {shown.map((todo, index) => {
              const previous = shown[index - 1];
              const next = shown[index + 1];
              return (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={(id) => setTodos((current) => toggleTodo(current, id))}
                  onRename={(id, next) => setTodos((current) => renameTodo(current, id, next))}
                  onDelete={(id) => setTodos((current) => deleteTodo(current, id))}
                  onMoveUp={previous ? () => move(todo.id, previous.id) : undefined}
                  onMoveDown={next ? () => move(todo.id, next.id) : undefined}
                  isDropTarget={draggedId !== null && draggedId !== todo.id && overId === todo.id}
                  onDragStart={() => setDraggedId(todo.id)}
                  onDragEnter={() => setOverId(todo.id)}
                  onDrop={() => {
                    if (draggedId) move(draggedId, todo.id);
                    endDrag();
                  }}
                  onDragEnd={endDrag}
                />
              );
            })}
          </ul>
        )}

        <footer className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-sm text-muted">
            {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
          </span>
          <Button
            type="button"
            size="sm"
            onClick={() => setTodos(clearCompleted)}
            disabled={!hasCompleted}
          >
            Clear completed
          </Button>
        </footer>
      </div>
    </Page>
  );
}

export default TodoPage;
