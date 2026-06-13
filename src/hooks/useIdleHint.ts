import { useEffect, useRef, useState } from 'react';

const DEFAULT_THRESHOLD_MS = 60_000;
const DEFAULT_STORAGE_KEY = 'p0b2d.idleHintShown';

interface UseIdleHintOptions {
  thresholdMs?: number;
  storageKey?: string;
}

interface UseIdleHintResult {
  shouldBreath: boolean;
  reset: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useIdleHint(options: UseIdleHintOptions = {}): UseIdleHintResult {
  const { thresholdMs = DEFAULT_THRESHOLD_MS, storageKey = DEFAULT_STORAGE_KEY } = options;

  const [shouldBreath, setShouldBreath] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Permanently disabled: skip timer + localStorage.
      return;
    }

    if (localStorage.getItem(storageKey) === '1') {
      // Returning user: no hint.
      return;
    }

    timerRef.current = setTimeout(() => {
      localStorage.setItem(storageKey, '1');
      setShouldBreath(true);
    }, thresholdMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [thresholdMs, storageKey]);

  const reset = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (shouldBreath) {
      // Hint is currently showing → just stop the animation. localStorage stays set.
      setShouldBreath(false);
    } else if (localStorage.getItem(storageKey) !== '1' && !prefersReducedMotion()) {
      // Timer was still pending → restart it. Skip if reduced-motion (defensive).
      timerRef.current = setTimeout(() => {
        localStorage.setItem(storageKey, '1');
        setShouldBreath(true);
      }, thresholdMs);
    }
  };

  return { shouldBreath, reset };
}
