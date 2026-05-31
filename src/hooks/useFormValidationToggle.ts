import { useEffect, useRef, useState } from 'react';

import type { FormValidationRow } from '../data/formValidationRows';
import { cycleFormValidationStates, makeFormValidationRows } from '../data/formValidationRows';

interface UseFormValidationToggleConfig {
  fieldCount: number;
  updateInterval: number;
  enabled: boolean;
  maxUpdates?: number;
}

export function useFormValidationToggle(config: UseFormValidationToggleConfig) {
  const { fieldCount, updateInterval, enabled, maxUpdates = 1000 } = config;

  const [fields, setFields] = useState<FormValidationRow[]>(() =>
    makeFormValidationRows(fieldCount),
  );
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setFields(makeFormValidationRows(fieldCount));
    setUpdatesCount(0);
    seedRef.current = 0;
  }, [fieldCount]);

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
      setFields((prev) => cycleFormValidationStates(prev, seedRef.current));
      setUpdatesCount((c) => c + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updateCount, maxUpdates]);

  return { fields, updateCount, maxUpdates };
}
