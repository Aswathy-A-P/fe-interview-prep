import { useEffect, useId, useState } from 'react';
import Button from '../../components/ui/Button.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import { useIdleTimer } from './useIdleTimer.ts';

interface IdleWarningProps {
  idleMs: number;
  warningMs: number;
  onLogout: () => void;
}

function IdleWarning({ idleMs, warningMs, onLogout }: IdleWarningProps) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const titleId = useId();
  const descriptionId = useId();

  useIdleTimer({
    idleMs,
    enabled: deadline === null,
    onIdle: () => {
      setNow(Date.now());
      setDeadline(Date.now() + warningMs);
    },
  });

  useEffect(() => {
    if (deadline === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const secondsLeft = deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));

  useEffect(() => {
    if (secondsLeft === 0) onLogout();
  }, [secondsLeft, onLogout]);

  if (secondsLeft === null) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(cardClass, 'w-full max-w-sm space-y-4 p-6 shadow-lg')}
      >
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          Are you still there?
        </h2>
        <p id={descriptionId} className="text-muted tabular-nums">
          You'll be logged out in {secondsLeft}s due to inactivity.
        </p>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onLogout}>
            Log out
          </Button>
          <Button type="button" variant="primary" autoFocus onClick={() => setDeadline(null)}>
            Stay signed in
          </Button>
        </div>
      </div>
    </div>
  );
}

export default IdleWarning;
