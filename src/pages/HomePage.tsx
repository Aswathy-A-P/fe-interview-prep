import { Link } from 'react-router-dom';
import { questions } from '../questions.ts';

function HomePage() {
  return (
    <section>
      <h1>Frontend Interview Prep</h1>
      <p>Five React + TypeScript features, each on its own page.</p>
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        <ol>
          {questions.map((question) => (
            <li key={question.path}>
              <Link to={question.path}>{question.title}</Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default HomePage;
