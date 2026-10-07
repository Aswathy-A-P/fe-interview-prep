import Button from '../../../components/ui/Button.tsx';
import { PLAN_LABELS, STEP_LABELS, type Registration, type StepId } from '../types.ts';

interface ReviewStepProps {
  data: Registration;
  onEdit: (step: StepId) => void;
}

interface ReviewSectionProps {
  step: StepId;
  rows: [string, string][];
  onEdit: (step: StepId) => void;
}

function ReviewSection({ step, rows, onEdit }: ReviewSectionProps) {
  return (
    <section className="mb-3 border-b border-border pb-3" aria-labelledby={`review-${step}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 id={`review-${step}`} className="my-2 text-lg font-semibold">
          {STEP_LABELS[step]}
        </h3>
        <Button
          type="button"
          size="sm"
          aria-label={`Edit ${STEP_LABELS[step]}`}
          onClick={() => onEdit(step)}
        >
          Edit
        </Button>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4">
            <dt className="min-w-28 text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ReviewStep({ data, onEdit }: ReviewStepProps) {
  const { personal, address, preferences } = data;
  const plan = preferences.plan ? PLAN_LABELS[preferences.plan] : '';
  return (
    <>
      <ReviewSection
        step="personal"
        onEdit={onEdit}
        rows={[
          ['Full name', personal.name],
          ['Email', personal.email],
          ['Phone', personal.phone],
        ]}
      />
      <ReviewSection
        step="address"
        onEdit={onEdit}
        rows={[
          ['Country', address.country],
          ['City', address.city],
          ['Postal code', address.postalCode],
        ]}
      />
      <ReviewSection
        step="preferences"
        onEdit={onEdit}
        rows={[
          ['Plan', plan],
          ['Skills', preferences.skills.join(', ')],
        ]}
      />
    </>
  );
}

export default ReviewStep;
