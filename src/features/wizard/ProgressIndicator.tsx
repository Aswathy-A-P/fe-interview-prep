import { cn } from '../../lib/cn.ts';
import { STEPS, STEP_LABELS, type StepId } from './types.ts';

interface ProgressIndicatorProps {
  current: StepId;
}

function ProgressIndicator({ current }: ProgressIndicatorProps) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <div>
      <p className="mb-2 text-muted">
        Step {currentIndex + 1} of {STEPS.length}
      </p>
      <ol className="mb-6 flex list-none flex-wrap gap-4 p-0" aria-label="Registration progress">
        {STEPS.map((step, index) => {
          const status =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-1.5 text-muted',
                status === 'current' && 'font-semibold text-accent',
              )}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <span
                className={cn(
                  'inline-grid size-6.5 place-items-center rounded-full border border-border bg-white text-sm',
                  status !== 'upcoming' && 'border-accent bg-accent text-white',
                )}
                aria-hidden="true"
              >
                {status === 'done' ? '✓' : index + 1}
              </span>
              {STEP_LABELS[step]}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ProgressIndicator;
