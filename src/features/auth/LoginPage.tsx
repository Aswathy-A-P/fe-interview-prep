import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import { cardClass, fieldClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import { errorMessage } from './apiClient.ts';
import { useAuth } from './authContext.ts';
import { redirectPath } from './redirect.ts';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@example.com', password: 'admin123' },
  { label: 'User', email: 'user@example.com', password: 'user123' },
];

function LoginPage() {
  const { status, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={redirectPath(location.state)} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (loginError) {
      setError(errorMessage(loginError));
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-90">
      <h1 className="mb-3 text-2xl font-semibold">Log in</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          Email
          <input
            className={fieldClass}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          Password
          <input
            className={fieldClass}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="text-danger" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <div className={cn(cardClass, 'mt-6 px-4 py-3')}>
        <p className="mb-2 text-muted">Demo accounts</p>
        <ul className="list-disc space-y-1.5 pl-4">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <strong>{account.label}:</strong> <code>{account.email}</code> /{' '}
              <code>{account.password}</code>{' '}
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                Use
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default LoginPage;
