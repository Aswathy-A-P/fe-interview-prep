import { useState, type FormEvent } from 'react';
import { usePersistentState } from '../../hooks/usePersistentState.ts';
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
import './wizard.css';

export const DATA_KEY = 'q3.data';
export const STEP_KEY = 'q3.step';

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

  const goTo = (target: StepId) => {
    setStep(target);
    setShowErrors(false);
  };

  const sendRegistration = async () => {
    const invalidStep = STEPS.find((candidate) => !hasNoErrors(validateStep(candidate, data)));
    if (invalidStep) {
      setStep(invalidStep);
      setShowErrors(true);
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
      setShowErrors(true);
      return;
    }
    goTo(nextStep(step));
  };

  if (status === 'success') {
    return (
      <section className="wizard">
        <h1>Registration Wizard</h1>
        <div role="status" className="wizard-success">
          <h2>You're registered!</h2>
          <p>Thanks, {registeredName}. We've received your registration.</p>
        </div>
        <button type="button" onClick={() => setStatus('idle')}>
          Start a new registration
        </button>
      </section>
    );
  }

  const submitting = status === 'submitting';

  return (
    <section className="wizard">
      <h1>Registration Wizard</h1>
      <ProgressIndicator current={step} />

      <form className="wizard-form" noValidate onSubmit={handleSubmit}>
        <h2>{STEP_LABELS[step]}</h2>

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

        {status === 'error' && (
          <p role="alert" className="error">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="wizard-actions">
          {step !== 'personal' && (
            <button type="button" disabled={submitting} onClick={() => goTo(previousStep(step))}>
              Back
            </button>
          )}
          <button type="submit" className="primary" disabled={submitting}>
            {step === 'review' ? (submitting ? 'Submitting…' : 'Submit') : 'Next'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default WizardPage;
