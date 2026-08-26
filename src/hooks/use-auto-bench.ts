import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

import type { StylingEngine } from '../context/styling-engine-context';
import { useStylingEngine } from '../context/styling-engine-context';

const ENGINES: StylingEngine[] = ['stylesheet', 'unistyles', 'uniwind'];

function isStylingEngine(value: string): value is StylingEngine {
  return value === 'stylesheet' || value === 'unistyles' || value === 'uniwind';
}

/**
 * Deep-link driven auto benchmark:
 *   acme://user-states-benchmark?auto=1&maxUpdates=100
 *
 * Cycles stylesheet → unistyles → uniwind, running stress for each.
 */
export function useAutoBench(opts?: { defaultMaxUpdates?: number }) {
  const params = useLocalSearchParams<{ auto?: string; maxUpdates?: string; engine?: string }>();
  const { engine, setEngine } = useStylingEngine();
  const auto = params.auto === '1' || params.auto === 'true';
  const maxUpdates = Number(params.maxUpdates) || opts?.defaultMaxUpdates || 100;
  const [stressEnabled, setStressEnabled] = useState(false);
  const queueRef = useRef<StylingEngine[]>([]);
  const completedForEngineRef = useRef<StylingEngine | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!auto || startedRef.current) return;
    startedRef.current = true;

    const startEngine =
      typeof params.engine === 'string' && isStylingEngine(params.engine)
        ? params.engine
        : 'stylesheet';
    queueRef.current = ENGINES.filter((e) => e !== startEngine);
    completedForEngineRef.current = null;
    setEngine(startEngine);
    setStressEnabled(true);
  }, [auto, params.engine, setEngine]);

  const onStressComplete = useCallback(() => {
    if (!auto) return;
    if (completedForEngineRef.current === engine) return;
    completedForEngineRef.current = engine;

    const remaining = queueRef.current;
    if (remaining.length === 0) {
      setStressEnabled(false);
      // oxlint-disable-next-line no-console -- logcat scrape for CI benchmarks
      console.log('BENCHMARK_REPORT {"phase":"suite-complete"}');
      return;
    }

    const [next, ...rest] = remaining;
    queueRef.current = rest;
    setStressEnabled(false);
    setEngine(next);
    // Restart stress after engine switch commits.
    setTimeout(() => {
      completedForEngineRef.current = null;
      setStressEnabled(true);
    }, 250);
  }, [auto, engine, setEngine]);

  return {
    auto,
    maxUpdates,
    stressEnabled,
    setStressEnabled,
    engine,
    setEngine,
    onStressComplete,
  };
}
