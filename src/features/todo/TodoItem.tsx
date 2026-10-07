import { useState, type DragEvent, type FormEvent, type KeyboardEvent } from 'react';
import Button from '../../components/ui/Button.tsx';
import { fieldClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import type { Todo } from './todos.ts';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

function TodoItem({
  todo,
  onToggle,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  isDropTarget,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
}: TodoItemProps) {
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

  const startDrag = (event: DragEvent<HTMLLIElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', todo.id);
    onDragStart();
  };

  const allowDrop = (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    onDragEnter();
  };

  const drop = (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    onDrop();
  };

  return (
    <li
      draggable={!isEditing}
      onDragStart={startDrag}
      onDragOver={allowDrop}
      onDrop={drop}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-3 bg-white px-4 py-3 transition-colors',
        !isEditing && 'cursor-grab',
        isDropTarget && 'bg-accent/10 outline-2 -outline-offset-2 outline-accent outline-dashed',
      )}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
        className="size-4 shrink-0 cursor-pointer accent-accent"
      />
      {isEditing ? (
        <form onSubmit={save} className="flex min-w-0 flex-1 items-center gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={cancelOnEscape}
            aria-label={`Edit "${todo.title}"`}
            className={cn(fieldClass, 'min-w-0 flex-1 py-1.5')}
            autoFocus
          />
          <Button type="submit" size="sm" variant="primary">
            Save
          </Button>
          <Button type="button" size="sm" onClick={() => setDraft(null)}>
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <span
            className={cn(
              'min-w-0 flex-1 break-words',
              todo.completed && 'text-muted line-through',
            )}
            onDoubleClick={() => setDraft(todo.title)}
          >
            {todo.title}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            aria-label={`Move "${todo.title}" up`}
          >
            ↑
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            aria-label={`Move "${todo.title}" down`}
          >
            ↓
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setDraft(todo.title)}
            aria-label={`Edit "${todo.title}"`}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
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
