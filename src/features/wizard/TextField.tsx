import { fieldClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  onChange: (value: string) => void;
}

function TextField({
  id,
  label,
  value,
  error,
  type = 'text',
  autoComplete,
  onChange,
}: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        className={cn(fieldClass, 'w-full')}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
