import { useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';

import { StaticRowRN, StaticRowUniwind, StaticRowUnistyles } from '../benchmark/staticRowViews';
import { EngineRadioGroup } from '../components/EngineRadioGroup';
import { RenderTimeLabel } from '../components/RenderTimeLabel';
import { useStylingEngine } from '../context/StylingEngineContext';
import { buildStaticRows, type StaticRow } from '../data/staticRows';
import { useRenderMeasurement } from '../hooks/useRenderMeasurement';

export default function StaticBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const { lastMs, markStart } = useRenderMeasurement(engine);
  const data = useMemo(() => buildStaticRows(96), []);

  const renderItem = useCallback(
    ({ item }: { item: StaticRow }) => {
      switch (engine) {
        case 'stylesheet':
          return <StaticRowRN item={item} />;
        case 'unistyles':
          return <StaticRowUnistyles item={item} />;
        case 'uniwind':
          return <StaticRowUniwind item={item} />;
      }
    },
    [engine],
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
        <EngineRadioGroup
          value={engine}
          onChange={(next) => {
            markStart();
            setEngine(next);
          }}
        />
        <RenderTimeLabel lastMs={lastMs} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={16}
        windowSize={7}
      />
    </View>
  );
}
