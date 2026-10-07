import { STEPS, STEP_LABELS, type StepId } from './types.ts';

interface ProgressIndicatorProps {
  current: StepId;
}

function ProgressIndicator({ current }: ProgressIndicatorProps) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <div>
      <p className="muted">
        Step {currentIndex + 1} of {STEPS.length}
      </p>
      <ol className="wizard-progress" aria-label="Registration progress">
        {STEPS.map((step, index) => {
          const status =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <li
              key={step}
              className={`wizard-progress-step ${status}`}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <span className="wizard-progress-number" aria-hidden="true">
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
