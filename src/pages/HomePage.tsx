import { Link } from 'react-router-dom';
import { questions } from '../questions.ts';

function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Frontend Interview Prep</h1>
      <p className="text-muted">Five React + TypeScript features, each on its own page.</p>
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        <ol className="list-decimal space-y-1 pl-6">
          {questions.map((question) => (
            <li key={question.path}>
              <Link to={question.path} className="text-accent hover:underline">
                {question.title}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default HomePage;
