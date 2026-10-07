import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
    <section className="auth-card">
      <h1>Log in</h1>
      <form onSubmit={submit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="auth-demo">
        <p className="muted">Demo accounts</p>
        <ul>
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <strong>{account.label}:</strong> <code>{account.email}</code> /{' '}
              <code>{account.password}</code>{' '}
              <button
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                Use
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default LoginPage;
