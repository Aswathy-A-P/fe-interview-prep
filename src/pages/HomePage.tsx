import { Link } from 'react-router-dom';
import Page from '../components/ui/Page.tsx';
import { cardClass } from '../components/ui/fieldStyles.ts';
import { cn } from '../lib/cn.ts';
import { questions } from '../questions.ts';

function HomePage() {
  return (
    <Page
      title="Frontend Interview Prep"
      description="Five React + TypeScript features, each on its own page."
      width="xl"
    >
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <li key={question.path}>
            <Link
              to={question.path}
              className={cn(
                cardClass,
                'group flex h-full flex-col gap-3 p-6 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md',
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                {question.number}
              </span>
              <span className="text-lg font-semibold text-ink group-hover:text-accent">
                {question.title}
              </span>
              <span className="text-sm text-muted">{question.summary}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Page>
  );
}

export default HomePage;
