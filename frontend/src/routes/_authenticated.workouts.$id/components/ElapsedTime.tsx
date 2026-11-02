import { useEffect, useState } from "react";

type ElapsedTimeProps = {
  /** ISO timestamp the clock counts from. */
  since: string;
  /** ISO timestamp the clock stops at; while null the clock keeps ticking. */
  until?: string | null;
};

/** `mm:ss`, or `h:mm:ss` once an hour has passed. */
const formatElapsed = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};

/**
 * Live elapsed time between `since` and now (or `until` once set). Ticks
 * once a second only while the workout is still in progress.
 */
export const ElapsedTime = ({ since, until }: ElapsedTimeProps) => {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    // A finished workout shows a fixed duration; no clock needed.
    if (until) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [until]);

  const end = until ? new Date(until).getTime() : now;
  const start = new Date(since).getTime();

  return <span className="tabular-nums">{formatElapsed(end - start)}</span>;
};
