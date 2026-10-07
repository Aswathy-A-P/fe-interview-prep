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
      <div className="wizard-field">
        <label htmlFor="country">Country</label>
        <select
          id="country"
          value={value.country}
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
          <p id="country-error" className="error">
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
