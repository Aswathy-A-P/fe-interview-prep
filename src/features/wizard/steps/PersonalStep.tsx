import TextField from '../TextField.tsx';
import type { FieldErrors, PersonalInfo } from '../types.ts';

interface PersonalStepProps {
  value: PersonalInfo;
  errors: FieldErrors<PersonalInfo>;
  onChange: (value: PersonalInfo) => void;
}

function PersonalStep({ value, errors, onChange }: PersonalStepProps) {
  return (
    <>
      <TextField
        id="name"
        label="Full name"
        value={value.name}
        error={errors.name}
        autoComplete="name"
        onChange={(name) => onChange({ ...value, name })}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        value={value.email}
        error={errors.email}
        autoComplete="email"
        onChange={(email) => onChange({ ...value, email })}
      />
      <TextField
        id="phone"
        label="Phone"
        type="tel"
        value={value.phone}
        error={errors.phone}
        autoComplete="tel"
        onChange={(phone) => onChange({ ...value, phone })}
      />
    </>
  );
}

export default PersonalStep;
