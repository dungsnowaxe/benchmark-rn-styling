import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { StylingEngine } from '../context/StylingEngineContext';

/**
 * Approximate time from `markStart()` (call before setState) to after commit.
 * Initial mount is measured once automatically. Values are approximate — use the
 * same device/session when comparing engines.
 */
export function useRenderMeasurement(engine: StylingEngine, tick?: number) {
  const [lastMs, setLastMs] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);
  const mountStartRef = useRef<number | null>(null);

  if (mountStartRef.current === null) {
    mountStartRef.current = performance.now();
  }

  useLayoutEffect(() => {
    if (mountStartRef.current !== null) {
      const t0 = mountStartRef.current;
      mountStartRef.current = null;
      setLastMs(performance.now() - t0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  const markStart = useCallback(() => {
    startRef.current = performance.now();
  }, []);

  useLayoutEffect(() => {
    if (startRef.current === null) return;
    const t0 = startRef.current;
    startRef.current = null;
    setLastMs(performance.now() - t0);
  }, [engine, tick]);

  return { lastMs, markStart };
}
