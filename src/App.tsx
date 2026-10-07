import { NavLink, Route, Routes } from 'react-router-dom';
import QuotesTablePage from './features/table/QuotesTablePage.tsx';
import TodoPage from './features/todo/TodoPage.tsx';
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
          <Route path="/table" element={<QuotesTablePage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
