import { useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';

import { StaticRowRN, StaticRowUniwind, StaticRowUnistyles } from '../benchmark/static-row-views';
import { EngineRadioGroup } from '../components/engine-radio-group';
import { RenderTimeLabel } from '../components/render-time-label';
import { useStylingEngine } from '../context/styling-engine-context';
import { buildStaticRows, type StaticRow } from '../data/static-rows';
import { useRenderMeasurement } from '../hooks/use-render-measurement';

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
