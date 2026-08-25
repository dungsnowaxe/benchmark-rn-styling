import { useEffect, useRef } from 'react';

import type { StylingEngine } from '../context/StylingEngineContext';

type BenchmarkReport = {
  benchmark: string;
  engine: StylingEngine;
  lastMs: number | null;
  fps: number;
  dropsPerMinute: number;
  updateCount: number;
  maxUpdates: number;
  phase: 'initial' | 'stress-progress' | 'stress-complete';
};

/**
 * Emits structured JSON lines to logcat / Metro for automated capture.
 * Filter with: adb logcat -s ReactNativeJS | rg BENCHMARK_REPORT
 */
export function useBenchmarkReporter(
  report: Omit<BenchmarkReport, 'phase'> & { stressEnabled: boolean },
) {
  const lastPhaseRef = useRef<string>('');

  useEffect(() => {
    const { stressEnabled, updateCount, maxUpdates, ...rest } = report;
    let phase: BenchmarkReport['phase'] = 'initial';
    if (stressEnabled && updateCount > 0 && updateCount < maxUpdates) {
      phase = 'stress-progress';
    } else if (updateCount >= maxUpdates && maxUpdates > 0) {
      phase = 'stress-complete';
    }

    // Log initial once, every 50 stress ticks, and on completion.
    const shouldLog =
      phase === 'initial' ||
      phase === 'stress-complete' ||
      (phase === 'stress-progress' && updateCount % 50 === 0);

    const key = `${phase}:${rest.engine}:${updateCount}:${rest.lastMs}`;
    if (!shouldLog || key === lastPhaseRef.current) return;
    lastPhaseRef.current = key;

    const payload: BenchmarkReport = {
      ...rest,
      updateCount,
      maxUpdates,
      phase,
    };
    // oxlint-disable-next-line no-console -- logcat scrape for CI benchmarks
    console.log(`BENCHMARK_REPORT ${JSON.stringify(payload)}`);
  }, [report]);
}
