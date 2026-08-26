import { useEffect, useRef, useState } from 'react';

import type { UserStateRow } from '../data/user-states-rows';
import { makeUserStatesRows, toggleUserStates } from '../data/user-states-rows';

interface UseUserStatesToggleConfig {
  rowCount: number;
  updateInterval: number;
  updatePercentage: number;
  enabled: boolean;
  maxUpdates?: number;
}

export function useUserStatesToggle(config: UseUserStatesToggleConfig) {
  const { rowCount, updateInterval, updatePercentage, enabled, maxUpdates = 1000 } = config;

  const [rows, setRows] = useState<UserStateRow[]>(() => makeUserStatesRows(rowCount));
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRows(makeUserStatesRows(rowCount));
    setUpdatesCount(0);
    seedRef.current = 0;
  }, [rowCount]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Fresh stress run whenever stress is (re)enabled.
    setUpdatesCount(0);
    seedRef.current = 0;

    intervalRef.current = setInterval(() => {
      seedRef.current++;
      setRows((prev) => toggleUserStates(prev, updatePercentage, seedRef.current));
      setUpdatesCount((c) => {
        const next = c + 1;
        if (next >= maxUpdates && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return next;
      });
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updatePercentage, maxUpdates]);

  return { rows, updateCount, maxUpdates };
}
