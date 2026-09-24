import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { LiveRowAnimEase, LiveRowAnimReanimated } from '../benchmark/animation-flash-row-views';
import { AnimationEngineRadioGroup } from '../components/animation-engine-radio-group';
import { RenderTimeLabel } from '../components/render-time-label';
import { useAnimationEngine } from '../context/animation-engine-context';
import type { LiveRow } from '../data/live-rows';
import { useBenchmarkReporter } from '../hooks/use-benchmark-reporter';
import { useFrameRateMonitor } from '../hooks/use-frame-rate-monitor';
import { useMockLiveRows } from '../hooks/use-mock-live-rows';
import { useRenderMeasurement } from '../hooks/use-render-measurement';

/** Feed interval, matching the realtime / realtime-flash screens. */
const INTERVAL_MS = 280;

/** How many ticks a stress run covers before it auto-stops. */
const MAX_UPDATES = 300;

const ROW_COUNTS = [20, 60, 150] as const;

/**
 * `windowSize` is counted in viewport heights, and VirtualizedList multiplies it
 * by the measured viewport length. `Number.MAX_SAFE_INTEGER` there overflows to
 * `Infinity` and produces an unbounded render range, so use a large finite
 * value: 100 viewports comfortably covers the 150-row maximum (~13 rows
 * visible) without ever virtualizing anything away.
 */
const STRESS_WINDOW_SIZE = 100;

const MetricsDisplay = memo(function MetricsDisplay({
  lastMs,
  fps,
  dropsPerMinute,
  updateCount,
  stressEnabled,
  onToggleStress,
}: {
  lastMs: number | null;
  fps: number;
  dropsPerMinute: number;
  updateCount: number;
  stressEnabled: boolean;
  onToggleStress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <View className="flex-1">
        <RenderTimeLabel lastMs={lastMs} />
        <Text
          className={`text-xs ${
            dropsPerMinute > 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          FPS: {fps} | Drops: {dropsPerMinute}/min
        </Text>
        {__DEV__ ? (
          <Text className="text-xs text-amber-600 dark:text-amber-400">
            Debug build — JS is unoptimised and Reanimated worklets run uncompiled, so these numbers
            understate release performance. Compare arms against each other, not against 60.
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={onToggleStress}
        className={`rounded-lg px-3 py-1.5 ${
          stressEnabled ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            stressEnabled ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {stressEnabled ? 'Stop Stress' : 'Start Stress'} ({updateCount}/{MAX_UPDATES})
        </Text>
      </Pressable>
    </View>
  );
});

const RowCountPicker = memo(function RowCountPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <View className="flex-row flex-wrap items-center gap-2 pb-2">
      <Text className="text-xs text-gray-500 dark:text-gray-400">Rows:</Text>
      {ROW_COUNTS.map((count) => {
        const selected = value === count;
        return (
          <Pressable
            key={count}
            onPress={() => onChange(count)}
            className={`rounded-lg border px-2.5 py-1 ${
              selected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
            }`}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <Text
              className={`text-xs font-medium ${
                selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

export default function AnimationEngineBenchmarkScreen() {
  const { animationEngine, setAnimationEngine } = useAnimationEngine();
  const [rowCount, setRowCount] = useState<number>(60);
  const [stressEnabled, setStressEnabled] = useState(false);
  const [stressTicks, setStressTicks] = useState(0);

  const tickMeasureRef = useRef<(() => void) | undefined>(undefined);
  const { tick, rows } = useMockLiveRows(rowCount, INTERVAL_MS, () => tickMeasureRef.current?.());
  const { lastMs, markStart } = useRenderMeasurement(animationEngine, tick);
  tickMeasureRef.current = markStart;

  // FPS is the headline metric for an animation comparison, so sample it always
  // rather than only during stress.
  const { fps, dropsPerMinute } = useFrameRateMonitor(true);

  // Stress mode drops list virtualization so every row is mounted and animating
  // at once — the axis react-native-ease's own benchmark varies (10/100/500
  // views). Bounded so a run can be repeated identically across both arms.
  useEffect(() => {
    if (!stressEnabled) return;
    setStressTicks((t) => t + 1);
  }, [tick, stressEnabled]);

  useEffect(() => {
    if (stressEnabled && stressTicks >= MAX_UPDATES) setStressEnabled(false);
  }, [stressEnabled, stressTicks]);

  useBenchmarkReporter({
    benchmark: 'animation-engine',
    // Both arms render their static chrome through RN StyleSheet; the axis
    // under test is the animation backend.
    engine: 'stylesheet',
    animationEngine,
    lastMs,
    fps,
    dropsPerMinute,
    updateCount: stressTicks,
    maxUpdates: MAX_UPDATES,
    stressEnabled,
    enabled: stressEnabled || stressTicks >= MAX_UPDATES,
  });

  const renderItem = useCallback(
    ({ item }: { item: LiveRow }) =>
      animationEngine === 'ease' ? (
        <LiveRowAnimEase item={item} />
      ) : (
        <LiveRowAnimReanimated item={item} />
      ),
    [animationEngine],
  );

  const listProps = useMemo(
    () =>
      stressEnabled
        ? {
            initialNumToRender: rows.length,
            windowSize: STRESS_WINDOW_SIZE,
            removeClippedSubviews: false,
          }
        : { initialNumToRender: 14, windowSize: 7, removeClippedSubviews: undefined },
    [stressEnabled, rows.length],
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
        <Text className="mb-1 text-xs text-gray-500 dark:text-gray-400">
          Same feed, same rows, same StyleSheet chrome — only the animation backend changes. Mock
          data (deterministic); price + change% flash green/red on every move.
        </Text>
        <Text className="mb-1 text-xs text-gray-500 dark:text-gray-400">
          ease: native `backgroundColor` via EaseView, text colour via Reanimated (ease has no
          EaseText and no `color` prop) · reanimated: `interpolateColor` on bg and text off one
          shared value
        </Text>
        <AnimationEngineRadioGroup
          value={animationEngine}
          onChange={(next) => {
            markStart();
            setAnimationEngine(next);
          }}
        />
        <RowCountPicker value={rowCount} onChange={setRowCount} />
        <MetricsDisplay
          lastMs={lastMs}
          fps={fps}
          dropsPerMinute={dropsPerMinute}
          updateCount={stressTicks}
          stressEnabled={stressEnabled}
          onToggleStress={() => {
            markStart();
            setStressTicks(0);
            setStressEnabled((v) => !v);
          }}
        />
      </View>
      <FlatList
        // Remount on axis change so both arms start from an identical tree.
        key={`${animationEngine}-${rowCount}-${stressEnabled}`}
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={animationEngine}
        {...listProps}
      />
    </View>
  );
}
