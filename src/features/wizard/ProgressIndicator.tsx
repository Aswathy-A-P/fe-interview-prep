import { cn } from '../../lib/cn.ts';
import { STEPS, STEP_LABELS, type StepId } from './types.ts';

interface ProgressIndicatorProps {
  current: StepId;
}

function ProgressIndicator({ current }: ProgressIndicatorProps) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <div className="space-y-3 text-center">
      <ol
        className="flex list-none items-center justify-center p-0"
        aria-label="Registration progress"
      >
        {STEPS.map((step, index) => {
          const status =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <li
              key={step}
              className={cn(
                'flex items-center text-sm text-muted',
                status === 'current' && 'font-semibold text-accent',
              )}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              {index > 0 && (
                <span
                  className={cn(
                    'mx-2 h-px w-6 bg-border sm:mx-3 sm:w-10',
                    status !== 'upcoming' && 'bg-accent',
                  )}
                  aria-hidden="true"
                />
              )}
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-grid size-7 shrink-0 place-items-center rounded-full border border-border bg-white text-sm font-medium',
                    status !== 'upcoming' && 'border-accent bg-accent text-white',
                  )}
                  aria-hidden="true"
                >
                  {status === 'done' ? '✓' : index + 1}
                </span>
                <span className="max-sm:sr-only">{STEP_LABELS[step]}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-muted">
        Step {currentIndex + 1} of {STEPS.length}
      </p>
    </div>
  );
}

export default ProgressIndicator;
