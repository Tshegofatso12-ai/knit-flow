import { useEffect, useState } from 'react';

export function useSessionTimer(sessionStartedAt: number | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (sessionStartedAt === null) {
      setNow(Date.now());
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10_000);

    return () => clearInterval(interval);
  }, [sessionStartedAt]);

  if (sessionStartedAt === null) {
    return { display: '--' };
  }

  const elapsedMs = now - sessionStartedAt;
  const totalMinutes = Math.floor(elapsedMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const display = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return { display };
}
