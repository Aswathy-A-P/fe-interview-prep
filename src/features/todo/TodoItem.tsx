import { useState, type FormEvent, type KeyboardEvent } from 'react';
import Button from '../../components/ui/Button.tsx';
import { fieldClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
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
    <li className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
      />
      {isEditing ? (
        <form onSubmit={save} className="flex flex-1 items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={cancelOnEscape}
            aria-label={`Edit "${todo.title}"`}
            className={cn(fieldClass, 'flex-1')}
            autoFocus
          />
          <Button type="submit">Save</Button>
          <Button type="button" onClick={() => setDraft(null)}>
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <span
            className={cn('flex-1', todo.completed && 'text-muted line-through')}
            onDoubleClick={() => setDraft(todo.title)}
          >
            {todo.title}
          </span>
          <Button
            type="button"
            onClick={() => setDraft(todo.title)}
            aria-label={`Edit "${todo.title}"`}
          >
            Edit
          </Button>
          <Button
            type="button"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.title}"`}
          >
            Delete
          </Button>
        </>
      )}
    </li>
  );
}

export default TodoItem;
