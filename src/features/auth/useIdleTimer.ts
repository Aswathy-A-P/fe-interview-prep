import { useEffect, useRef } from 'react';

export const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
export const ACTIVITY_THROTTLE_MS = 1000;

interface IdleTimerOptions {
  idleMs: number;
  onIdle: () => void;
  enabled: boolean;
}

export function useIdleTimer({ idleMs, onIdle, enabled }: IdleTimerOptions): void {
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;
    let timeoutId = setTimeout(() => onIdleRef.current(), idleMs);
    let lastReset = Date.now();

    const handleActivity = () => {
      if (Date.now() - lastReset < ACTIVITY_THROTTLE_MS) return;
      lastReset = Date.now();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => onIdleRef.current(), idleMs);
    };

    for (const name of ACTIVITY_EVENTS) {
      window.addEventListener(name, handleActivity, { passive: true });
    }
    return () => {
      clearTimeout(timeoutId);
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, handleActivity);
    };
  }, [enabled, idleMs]);
}
