import { useEffect, useRef, useState } from 'react';

import type { LiveRow } from '../data/live-rows';
import { jitterRows, makeLiveRows } from '../data/live-rows';

export function useMockLiveRows(rowCount: number, intervalMs: number, onBeforeUpdate?: () => void) {
  const [tick, setTick] = useState(0);
  const [rows, setRows] = useState<LiveRow[]>(() => makeLiveRows(rowCount));
  const beforeRef = useRef(onBeforeUpdate);
  beforeRef.current = onBeforeUpdate;

  useEffect(() => {
    setRows(makeLiveRows(rowCount));
  }, [rowCount]);

  useEffect(() => {
    const id = setInterval(() => {
      beforeRef.current?.();
      setTick((t) => t + 1);
      setRows((prev) => jitterRows(prev));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { tick, rows };
}
