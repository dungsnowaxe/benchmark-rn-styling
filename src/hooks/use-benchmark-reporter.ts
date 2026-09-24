import { useEffect, useRef } from 'react';

import type { StylingEngine } from '../context/styling-engine-context';

type BenchmarkReport = {
  benchmark: string;
  engine: StylingEngine;
  /**
   * Optional second axis for benchmarks that hold the styling engine constant
   * and vary something else instead (e.g. `animation-engine`, which compares
   * react-native-ease against react-native-reanimated on a StyleSheet body).
   */
  animationEngine?: string;
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
 *
 * Pass `enabled: false` to stay silent — useful on continuous-feed screens
 * where the `initial` phase never ends and would otherwise log every tick.
 */
export function useBenchmarkReporter(
  report: Omit<BenchmarkReport, 'phase'> & { stressEnabled: boolean; enabled?: boolean },
) {
  const lastPhaseRef = useRef<string>('');

  useEffect(() => {
    const { stressEnabled, enabled, updateCount, maxUpdates, ...rest } = report;
    if (enabled === false) return;

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

    // `stress-complete` is terminal: exclude the volatile `lastMs` from its
    // dedupe key so it emits exactly once. On screens whose data feed keeps
    // running after the stress counter stops (e.g. animation-engine), `lastMs`
    // changes every tick and would otherwise re-emit the completion line
    // forever, polluting the JSONL that CI scrapes.
    const key =
      phase === 'stress-complete'
        ? `${phase}:${rest.engine}:${rest.animationEngine ?? ''}:${updateCount}`
        : `${phase}:${rest.engine}:${rest.animationEngine ?? ''}:${updateCount}:${rest.lastMs}`;
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
