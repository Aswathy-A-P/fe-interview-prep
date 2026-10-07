import { useState, type KeyboardEvent } from 'react';
import { addSkill, removeSkill } from '../registration.ts';
import { PLANS, PLAN_LABELS, type FieldErrors, type Preferences } from '../types.ts';

interface PreferencesStepProps {
  value: Preferences;
  errors: FieldErrors<Preferences>;
  onChange: (value: Preferences) => void;
}

function PreferencesStep({ value, errors, onChange }: PreferencesStepProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    onChange({ ...value, skills: addSkill(value.skills, draft) });
    setDraft('');
  };

  const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    add();
  };

  return (
    <>
      <fieldset className="wizard-field" aria-describedby={errors.plan ? 'plan-error' : undefined}>
        <legend>Plan</legend>
        <div className="wizard-plans">
          {PLANS.map((plan) => (
            <label key={plan}>
              <input
                type="radio"
                name="plan"
                value={plan}
                checked={value.plan === plan}
                onChange={() => onChange({ ...value, plan })}
              />
              {PLAN_LABELS[plan]}
            </label>
          ))}
        </div>
        {errors.plan && (
          <p id="plan-error" className="error">
            {errors.plan}
          </p>
        )}
      </fieldset>

      <div className="wizard-field">
        <label htmlFor="skill">Skills</label>
        <div className="wizard-skill-add">
          <input
            id="skill"
            value={draft}
            placeholder="e.g. React"
            aria-invalid={errors.skills ? true : undefined}
            aria-describedby={errors.skills ? 'skills-error' : undefined}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={addOnEnter}
          />
          <button type="button" onClick={add}>
            Add skill
          </button>
        </div>
        {errors.skills && (
          <p id="skills-error" className="error">
            {errors.skills}
          </p>
        )}
        {value.skills.length > 0 && (
          <ul className="wizard-chips" aria-label="Added skills">
            {value.skills.map((skill) => (
              <li key={skill} className="wizard-chip">
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => onChange({ ...value, skills: removeSkill(value.skills, skill) })}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default PreferencesStep;
