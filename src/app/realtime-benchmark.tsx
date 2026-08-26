import { useCallback, useMemo, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';

import { LiveRowRN, LiveRowUniwind, LiveRowUnistyles } from '../benchmark/realtime-row-views';
import { EngineRadioGroup } from '../components/engine-radio-group';
import { RenderTimeLabel } from '../components/render-time-label';
import { useStylingEngine } from '../context/styling-engine-context';
import type { LiveRow } from '../data/live-rows';
import { useBinanceBtcTicker } from '../hooks/use-binance-btc-ticker';
import { useMockLiveRows } from '../hooks/use-mock-live-rows';
import { useRenderMeasurement } from '../hooks/use-render-measurement';

export default function RealtimeBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const tickMeasureRef = useRef<(() => void) | undefined>(undefined);
  const { tick, rows } = useMockLiveRows(40, 280, () => tickMeasureRef.current?.());
  const { lastMs, markStart } = useRenderMeasurement(engine, tick);
  tickMeasureRef.current = markStart;

  const { status, btcPrice } = useBinanceBtcTicker(true);

  const rowsDisplay = useMemo(() => {
    if (btcPrice == null || rows.length === 0) return rows;
    const next = [...rows];
    next[0] = { ...next[0], price: btcPrice };
    return next;
  }, [rows, btcPrice]);

  const renderItem = useCallback(
    ({ item }: { item: LiveRow }) => {
      switch (engine) {
        case 'stylesheet':
          return <LiveRowRN item={item} />;
        case 'unistyles':
          return <LiveRowUnistyles item={item} />;
        case 'uniwind':
          return <LiveRowUniwind item={item} />;
      }
    },
    [engine],
  );

  const feedHint =
    status === 'live'
      ? 'Binance BTC (row 1 price)'
      : status === 'connecting'
        ? 'Connecting to Binance…'
        : status === 'error'
          ? 'Binance unavailable — mock data'
          : 'Mock data';

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
        <Text className="mb-1 text-xs text-gray-500 dark:text-gray-400">{feedHint}</Text>
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
        data={rowsDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={14}
        windowSize={7}
      />
    </View>
  );
}
