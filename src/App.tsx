import { NavLink, Route, Routes } from 'react-router-dom';
import AccountPage from './features/auth/AccountPage.tsx';
import AdminPage from './features/auth/AdminPage.tsx';
import AuthLayout from './features/auth/AuthLayout.tsx';
import { RequireAuth, RequireRole } from './features/auth/guards.tsx';
import LoginPage from './features/auth/LoginPage.tsx';
import SearchPage from './features/search/SearchPage.tsx';
import TodoPage from './features/todo/TodoPage.tsx';
import WizardPage from './features/wizard/WizardPage.tsx';
import HomePage from './pages/HomePage.tsx';
import { questions } from './questions.ts';

function App() {
  return (
    <div className="layout">
      <header className="header">
        <NavLink to="/" className="brand">
          FE Interview Prep
        </NavLink>
        <nav aria-label="Questions">
          {questions.map((question) => (
            <NavLink key={question.path} to={question.path}>
              {question.title}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/register" element={<WizardPage />} />
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
