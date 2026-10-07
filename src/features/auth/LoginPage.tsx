import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import Page from '../../components/ui/Page.tsx';
import { cardClass, fieldClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import { errorMessage } from './apiClient.ts';
import { useAuth } from './authContext.ts';
import { redirectPath } from './redirect.ts';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@example.com', password: 'admin123' },
  { label: 'User', email: 'user@example.com', password: 'user123' },
];

const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-ink';

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
    <Page title="Log in" description="Sign in to view your account and orders." width="sm">
      <form onSubmit={submit} className={cn(cardClass, 'space-y-5 p-6 sm:p-8')}>
        <label className={labelClass}>
          Email
          <input
            className={cn(fieldClass, 'w-full font-normal')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className={labelClass}>
          Password
          <input
            className={cn(fieldClass, 'w-full font-normal')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <div className={cn(cardClass, 'space-y-3 p-5')}>
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Demo accounts</p>
        <ul className="divide-y divide-border">
          {DEMO_ACCOUNTS.map((account) => (
            <li
              key={account.email}
              className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm"
            >
              <span>
                <strong>{account.label}:</strong> <code>{account.email}</code> /{' '}
                <code>{account.password}</code>
              </span>
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
    </Page>
  );
}

export default LoginPage;
