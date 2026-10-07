import { useState, type FormEvent } from 'react';
import { usePersistentState } from '../../hooks/usePersistentState.ts';
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
import './todo.css';

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
    <section className="todo">
      <h1>Todo App</h1>
      <form onSubmit={submit} className="todo-add">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          aria-label="New todo"
        />
        <button type="submit" className="primary">
          Add
        </button>
      </form>

      <div className="todo-filters" role="group" aria-label="Filter todos">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            className={filter === option ? 'primary' : undefined}
            onClick={() => setFilter(option)}
          >
            {FILTER_LABELS[option]}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="muted">
          {todos.length === 0 ? 'Nothing to do yet.' : 'No todos match this filter.'}
        </p>
      ) : (
        <ul className="todo-list">
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

      <footer className="todo-footer">
        <span>
          {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
        </span>
        <button type="button" onClick={() => setTodos(clearCompleted)} disabled={!hasCompleted}>
          Clear completed
        </button>
      </footer>
    </section>
  );
}

export default TodoPage;
