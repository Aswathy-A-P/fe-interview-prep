import { fieldClass } from '../../components/ui/fieldStyles.ts';

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
    <div className="mb-4 flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        className={fieldClass}
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
