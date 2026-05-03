import { useEffect, useRef, useState } from "react";

import type { ListItemStateRow } from "../data/listItemStatesRows";
import { makeListItemStatesRows, toggleListItemStates } from "../data/listItemStatesRows";

interface UseListItemStatesToggleConfig {
  itemCount: number;
  updateInterval: number;
  updatePercentage: number;
  enabled: boolean;
  maxUpdates?: number;
}

export function useListItemStatesToggle(config: UseListItemStatesToggleConfig) {
  const {
    itemCount,
    updateInterval,
    updatePercentage,
    enabled,
    maxUpdates = 1000,
  } = config;

  const [items, setItems] = useState<ListItemStateRow[]>(() =>
    makeListItemStatesRows(itemCount),
  );
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setItems(makeListItemStatesRows(itemCount));
    setUpdatesCount(0);
    seedRef.current = 0;
  }, [itemCount]);

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
      setItems((prev) =>
        toggleListItemStates(prev, updatePercentage, seedRef.current),
      );
      setUpdatesCount((c) => c + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updatePercentage, updateCount, maxUpdates]);

  return { items, updateCount, maxUpdates };
}
