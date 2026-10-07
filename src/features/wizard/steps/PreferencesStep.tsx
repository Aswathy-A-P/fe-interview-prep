import { useState, type KeyboardEvent } from 'react';
import Button from '../../../components/ui/Button.tsx';
import { fieldClass } from '../../../components/ui/fieldStyles.ts';
import { cn } from '../../../lib/cn.ts';
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
      <fieldset
        className="mb-4 flex flex-col gap-1 border-0 p-0"
        aria-describedby={errors.plan ? 'plan-error' : undefined}
      >
        <legend className="mb-1 p-0">Plan</legend>
        <div className="flex items-center gap-3">
          {PLANS.map((plan) => (
            <label key={plan} className="flex items-center gap-1">
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
          <p id="plan-error" className="text-sm text-danger">
            {errors.plan}
          </p>
        )}
      </fieldset>

      <div className="mb-4 flex flex-col gap-1">
        <label htmlFor="skill">Skills</label>
        <div className="flex items-center gap-3">
          <input
            id="skill"
            value={draft}
            placeholder="e.g. React"
            className={cn(fieldClass, 'flex-1')}
            aria-invalid={errors.skills ? true : undefined}
            aria-describedby={errors.skills ? 'skills-error' : undefined}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={addOnEnter}
          />
          <Button type="button" onClick={add}>
            Add skill
          </Button>
        </div>
        {errors.skills && (
          <p id="skills-error" className="text-sm text-danger">
            {errors.skills}
          </p>
        )}
        {value.skills.length > 0 && (
          <ul className="mt-1 flex list-none flex-wrap gap-2 p-0" aria-label="Added skills">
            {value.skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-1 rounded-full border border-border py-0.5 pr-1 pl-2.5"
              >
                {skill}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-1.5 py-0"
                  aria-label={`Remove ${skill}`}
                  onClick={() => onChange({ ...value, skills: removeSkill(value.skills, skill) })}
                >
                  ×
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default PreferencesStep;
