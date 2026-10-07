interface FieldTarget {
  id: string;
  label: string;
}

const FIELD_TARGETS: Record<string, FieldTarget> = {
  name: { id: 'name', label: 'Full name' },
  email: { id: 'email', label: 'Email' },
  phone: { id: 'phone', label: 'Phone' },
  country: { id: 'country', label: 'Country' },
  city: { id: 'city', label: 'City' },
  postalCode: { id: 'postalCode', label: 'Postal code' },
  plan: { id: 'plan-free', label: 'Plan' },
  skills: { id: 'skill', label: 'Skills' },
};

interface ErrorSummaryProps {
  errors: Record<string, string>;
}

function ErrorSummary({ errors }: ErrorSummaryProps) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  const count = entries.length;

  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      <p className="font-semibold">
        {count} {count === 1 ? 'error' : 'errors'}: please fix {count === 1 ? 'it' : 'them'} to
        continue.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {entries.map(([field, message]) => {
          const target = FIELD_TARGETS[field];
          return (
            <li key={field}>
              <button
                type="button"
                className="cursor-pointer text-left underline underline-offset-2 hover:no-underline"
                onClick={() => document.getElementById(target?.id ?? field)?.focus()}
              >
                {`${target?.label ?? field}: ${message}`}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ErrorSummary;
