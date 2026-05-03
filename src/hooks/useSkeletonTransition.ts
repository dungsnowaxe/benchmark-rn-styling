import { useEffect, useRef, useState } from "react";

import type { SkeletonRow } from "../data/skeletonRows";
import { cycleSkeletonTransitions, makeSkeletonRows } from "../data/skeletonRows";

interface UseSkeletonTransitionConfig {
  rowCount: number;
  updateInterval: number;
  updatePercentage: number;
  enabled: boolean;
  maxUpdates?: number;
}

export function useSkeletonTransition(config: UseSkeletonTransitionConfig) {
  const {
    rowCount,
    updateInterval,
    updatePercentage,
    enabled,
    maxUpdates = 1000,
  } = config;

  const [rows, setRows] = useState<SkeletonRow[]>(() => makeSkeletonRows(rowCount));
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRows(makeSkeletonRows(rowCount));
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

    if (updateCount >= maxUpdates) {
      return;
    }

    intervalRef.current = setInterval(() => {
      seedRef.current++;
      setRows((prev) =>
        cycleSkeletonTransitions(prev, updatePercentage, seedRef.current),
      );
      setUpdatesCount((c) => c + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updatePercentage, updateCount, maxUpdates]);

  return { rows, updateCount, maxUpdates };
}
