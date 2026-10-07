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
    <div className="min-h-screen bg-linear-to-b from-white to-surface">
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4">
          <NavLink to="/" className="text-lg font-bold tracking-tight text-ink">
            FE Interview Prep
          </NavLink>
          <nav aria-label="Questions" className="flex flex-wrap justify-center gap-1">
            {questions.map((question) => (
              <NavLink
                key={question.path}
                to={question.path}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink',
                    isActive && 'bg-accent/10 text-accent hover:bg-accent/10 hover:text-accent',
                  )
                }
              >
                {question.title}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
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
