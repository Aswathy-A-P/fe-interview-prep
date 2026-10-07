import { fieldClass } from '../../../components/ui/fieldStyles.ts';
import TextField from '../TextField.tsx';
import { COUNTRIES, type Address, type FieldErrors } from '../types.ts';

interface AddressStepProps {
  value: Address;
  errors: FieldErrors<Address>;
  onChange: (value: Address) => void;
}

function AddressStep({ value, errors, onChange }: AddressStepProps) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-1">
        <label htmlFor="country">Country</label>
        <select
          id="country"
          value={value.country}
          className={fieldClass}
          aria-required="true"
          aria-invalid={errors.country ? true : undefined}
          aria-describedby={errors.country ? 'country-error' : undefined}
          onChange={(event) => onChange({ ...value, country: event.target.value })}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && (
          <p id="country-error" className="text-sm text-danger">
            {errors.country}
          </p>
        )}
      </div>
      <TextField
        id="city"
        label="City"
        value={value.city}
        error={errors.city}
        autoComplete="address-level2"
        onChange={(city) => onChange({ ...value, city })}
      />
      <TextField
        id="postalCode"
        label="Postal code"
        value={value.postalCode}
        error={errors.postalCode}
        autoComplete="postal-code"
        onChange={(postalCode) => onChange({ ...value, postalCode })}
      />
    </>
  );
}

export default AddressStep;
