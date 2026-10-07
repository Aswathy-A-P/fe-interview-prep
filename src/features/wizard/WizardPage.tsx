import { useEffect, useRef, useState, type FormEvent } from 'react';
import Button from '../../components/ui/Button.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import Page from '../../components/ui/Page.tsx';
import { cn } from '../../lib/cn.ts';
import { usePersistentState } from '../../hooks/usePersistentState.ts';
import { questions } from '../../questions.ts';
import { submitRegistration, type SubmitRegistration } from './api.ts';
import ProgressIndicator from './ProgressIndicator.tsx';
import {
  emptyRegistration,
  isRegistration,
  isStepId,
  nextStep,
  previousStep,
} from './registration.ts';
import AddressStep from './steps/AddressStep.tsx';
import PersonalStep from './steps/PersonalStep.tsx';
import PreferencesStep from './steps/PreferencesStep.tsx';
import ReviewStep from './steps/ReviewStep.tsx';
import { STEPS, STEP_LABELS, type Registration, type StepId } from './types.ts';
import {
  hasNoErrors,
  validateAddress,
  validatePersonal,
  validatePreferences,
  validateStep,
} from './validation.ts';

export const DATA_KEY = 'q3.data';
export const STEP_KEY = 'q3.step';

const DESCRIPTION = questions.find((question) => question.number === 3)?.summary;

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface WizardPageProps {
  submit?: SubmitRegistration;
}

function WizardPage({ submit = submitRegistration }: WizardPageProps) {
  const [data, setData] = usePersistentState<Registration>(DATA_KEY, emptyRegistration, {
    isValid: isRegistration,
    storage: sessionStorage,
  });
  const [step, setStep] = usePersistentState<StepId>(STEP_KEY, 'personal', {
    isValid: isStepId,
    storage: sessionStorage,
  });
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [registeredName, setRegisteredName] = useState('');
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);

  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (attempt === 0) return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    const target = invalid?.matches('input, select') ? invalid : invalid?.querySelector('input');
    target?.focus();
  }, [attempt]);

  const showStepErrors = () => {
    setShowErrors(true);
    setAttempt((count) => count + 1);
  };

  const goTo = (target: StepId) => {
    setStep(target);
    setShowErrors(false);
  };

  const sendRegistration = async () => {
    const invalidStep = STEPS.find((candidate) => !hasNoErrors(validateStep(candidate, data)));
    if (invalidStep) {
      setStep(invalidStep);
      showStepErrors();
      return;
    }
    setStatus('submitting');
    try {
      await submit(data);
      setRegisteredName(data.personal.name.trim());
      setData(emptyRegistration);
      setStep('personal');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 'review') {
      void sendRegistration();
      return;
    }
    if (!hasNoErrors(validateStep(step, data))) {
      showStepErrors();
      return;
    }
    goTo(nextStep(step));
  };

  if (status === 'success') {
    return (
      <Page title="Registration Wizard" description={DESCRIPTION} width="md">
        <div
          role="status"
          className={cn(cardClass, 'flex flex-col items-center gap-3 p-6 text-center sm:p-8')}
        >
          <span className="grid size-14 place-items-center rounded-full bg-accent/10 text-accent">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-ink">You're registered!</h2>
          <p className="text-muted">Thanks, {registeredName}. We've received your registration.</p>
        </div>
        <div className="flex justify-center">
          <Button type="button" onClick={() => setStatus('idle')}>
            Start a new registration
          </Button>
        </div>
      </Page>
    );
  }

  const submitting = status === 'submitting';

  return (
    <Page title="Registration Wizard" description={DESCRIPTION} width="md">
      <ProgressIndicator current={step} />

      <form
        ref={formRef}
        className={cn(cardClass, 'space-y-6 p-6 sm:p-8')}
        noValidate
        onSubmit={handleSubmit}
      >
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-ink outline-none">
          {STEP_LABELS[step]}
        </h2>

        <div className="space-y-5">
          {step === 'personal' && (
            <PersonalStep
              value={data.personal}
              errors={showErrors ? validatePersonal(data.personal) : {}}
              onChange={(personal) => setData((current) => ({ ...current, personal }))}
            />
          )}
          {step === 'address' && (
            <AddressStep
              value={data.address}
              errors={showErrors ? validateAddress(data.address) : {}}
              onChange={(address) => setData((current) => ({ ...current, address }))}
            />
          )}
          {step === 'preferences' && (
            <PreferencesStep
              value={data.preferences}
              errors={showErrors ? validatePreferences(data.preferences) : {}}
              onChange={(preferences) => setData((current) => ({ ...current, preferences }))}
            />
          )}
          {step === 'review' && <ReviewStep data={data} onEdit={goTo} />}
        </div>

        {status === 'error' && (
          <p
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
          >
            Something went wrong. Please try again.
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-6">
          {step !== 'personal' ? (
            <Button type="button" disabled={submitting} onClick={() => goTo(previousStep(step))}>
              Back
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          <Button type="submit" variant="primary" disabled={submitting}>
            {step === 'review' ? (submitting ? 'Submitting…' : 'Submit') : 'Next'}
          </Button>
        </div>
      </form>
    </Page>
  );
}

export default WizardPage;
