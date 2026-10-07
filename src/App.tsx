import { NavLink, Route, Routes } from 'react-router-dom';
import AccountPage from './features/auth/AccountPage.tsx';
import AdminPage from './features/auth/AdminPage.tsx';
import AuthLayout from './features/auth/AuthLayout.tsx';
import { RequireAuth, RequireRole } from './features/auth/guards.tsx';
import LoginPage from './features/auth/LoginPage.tsx';
import SearchPage from './features/search/SearchPage.tsx';
import QuotesTablePage from './features/table/QuotesTablePage.tsx';
import TodoPage from './features/todo/TodoPage.tsx';
import WizardPage from './features/wizard/WizardPage.tsx';
import HomePage from './pages/HomePage.tsx';
import { cn } from './lib/cn.ts';
import { questions } from './questions.ts';

function App() {
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center gap-4 border-b border-border bg-white px-6 py-3">
        <NavLink to="/" className="font-bold text-ink">
          FE Interview Prep
        </NavLink>
        <nav aria-label="Questions" className="flex flex-wrap gap-3">
          {questions.map((question) => (
            <NavLink
              key={question.path}
              to={question.path}
              className={({ isActive }) =>
                cn('text-muted hover:text-ink', isActive && 'font-semibold text-accent')
              }
            >
              {question.title}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/register" element={<WizardPage />} />
          <Route path="/table" element={<QuotesTablePage />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/account" element={<AccountPage />} />
              <Route element={<RequireRole role="admin" />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
