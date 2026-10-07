import { useState, type FormEvent, type KeyboardEvent } from 'react';
import type { Todo } from './todos.ts';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onRename, onDelete }: TodoItemProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (draft !== null) onRename(todo.id, draft);
    setDraft(null);
  };

  const cancelOnEscape = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') setDraft(null);
  };

  return (
    <li className={`todo-item${todo.completed ? ' done' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
      />
      {isEditing ? (
        <form onSubmit={save} className="todo-edit">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={cancelOnEscape}
            aria-label={`Edit "${todo.title}"`}
            autoFocus
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setDraft(null)}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <span className="todo-title" onDoubleClick={() => setDraft(todo.title)}>
            {todo.title}
          </span>
          <button
            type="button"
            onClick={() => setDraft(todo.title)}
            aria-label={`Edit "${todo.title}"`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.title}"`}
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
}

export default TodoItem;
