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
        role="radiogroup"
        className="flex flex-col gap-1.5 border-0 p-0"
        aria-required="true"
        aria-invalid={errors.plan ? true : undefined}
        aria-describedby={errors.plan ? 'plan-error' : undefined}
      >
        <legend className="mb-1.5 p-0 text-sm font-medium text-ink">Plan</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <label
              key={plan}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-white px-4 py-3 font-medium text-ink shadow-xs transition-colors hover:border-accent/50 has-checked:border-accent has-checked:bg-accent/5 has-checked:text-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                id={`plan-${plan}`}
                type="radio"
                name="plan"
                value={plan}
                className="size-4 accent-accent"
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="skill" className="text-sm font-medium text-ink">
          Skills
        </label>
        <div className="flex items-center gap-3">
          <input
            id="skill"
            value={draft}
            placeholder="e.g. React"
            className={cn(fieldClass, 'w-full min-w-0 flex-1')}
            aria-required="true"
            aria-invalid={errors.skills ? true : undefined}
            aria-describedby={errors.skills ? 'skills-error' : undefined}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={addOnEnter}
          />
          <Button type="button" className="shrink-0" onClick={add}>
            Add skill
          </Button>
        </div>
        {errors.skills && (
          <p id="skills-error" className="text-sm text-danger">
            {errors.skills}
          </p>
        )}
        {value.skills.length > 0 && (
          <ul className="mt-1.5 flex list-none flex-wrap gap-2 p-0" aria-label="Added skills">
            {value.skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-1 rounded-full bg-accent/10 py-1 pr-1.5 pl-3 text-sm font-medium text-accent"
              >
                {skill}
                <button
                  type="button"
                  className="inline-grid size-5 cursor-pointer place-items-center rounded-full text-accent transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
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
