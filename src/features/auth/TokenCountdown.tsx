import { useEffect, useState } from 'react';
import { getAccessTokenExpiresAt } from './tokenStore.ts';

function TokenCountdown() {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresAt = getAccessTokenExpiresAt();
  const secondsLeft = expiresAt === null ? 0 : Math.floor((expiresAt - now) / 1000);

  return (
    <p className="muted" aria-live="off">
      {secondsLeft > 0
        ? `Access token expires in ${secondsLeft}s`
        : 'Access token expired: the next request refreshes it silently'}
    </p>
  );
}

export default TokenCountdown;
