import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import {
  ListItemStateRowRN,
  ListItemStateRowUnistyles,
  ListItemStateRowUniwind,
} from '../benchmark/listItemStatesRowViews';
import { EngineRadioGroup } from '../components/EngineRadioGroup';
import { RenderTimeLabel } from '../components/RenderTimeLabel';
import { useStylingEngine } from '../context/StylingEngineContext';
import type { ListItemStateRow } from '../data/listItemStatesRows';
import { useFrameRateMonitor } from '../hooks/useFrameRateMonitor';
import { useRenderMeasurement } from '../hooks/useRenderMeasurement';
import { useListItemStatesToggle } from '../hooks/useListItemStatesToggle';

const MetricsDisplay = memo(function MetricsDisplay({
  lastMs,
  fps,
  dropsPerMinute,
  updateCount,
  maxUpdates,
  stressEnabled,
  onToggleStress,
}: {
  lastMs: number | null;
  fps: number;
  dropsPerMinute: number;
  updateCount: number;
  maxUpdates: number;
  stressEnabled: boolean;
  onToggleStress: () => void;
}) {
  return (
    <View className="gap-2 border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        200 list items with 6 state flags
      </Text>
      <RenderTimeLabel lastMs={lastMs} />
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 dark:text-gray-300">
          FPS: {fps} | Drops: {dropsPerMinute}/min
        </Text>
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
            {stressEnabled ? 'Stop Stress' : 'Start Stress'} ({updateCount}/{maxUpdates})
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function ListItemStatesBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const [stressEnabled, setStressEnabled] = useState(false);

  const { items, updateCount, maxUpdates } = useListItemStatesToggle({
    itemCount: 200,
    updateInterval: 100,
    updatePercentage: 0.1,
    enabled: stressEnabled,
  });

  const { lastMs, markStart } = useRenderMeasurement(engine, updateCount);
  const { fps, dropsPerMinute } = useFrameRateMonitor(stressEnabled);

  const renderItem = useCallback(
    ({ item }: { item: ListItemStateRow }) => {
      switch (engine) {
        case 'stylesheet':
          return <ListItemStateRowRN item={item} />;
        case 'unistyles':
          return <ListItemStateRowUnistyles item={item} />;
        case 'uniwind':
          return <ListItemStateRowUniwind item={item} />;
      }
    },
    [engine],
  );

  const itemsDisplay = useMemo(() => items, [items]);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <MetricsDisplay
        lastMs={lastMs}
        fps={fps}
        dropsPerMinute={dropsPerMinute}
        updateCount={updateCount}
        maxUpdates={maxUpdates}
        stressEnabled={stressEnabled}
        onToggleStress={() => {
          markStart();
          setStressEnabled((v) => !v);
        }}
      />
      <EngineRadioGroup
        value={engine}
        onChange={(next) => {
          markStart();
          setEngine(next);
        }}
      />
      <FlatList
        data={itemsDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={14}
        windowSize={7}
      />
    </View>
  );
}
