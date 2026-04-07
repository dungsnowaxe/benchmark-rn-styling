import { useCallback, useMemo, useRef } from "react";
import { FlatList, Text, View } from "react-native";

import {
  LiveRowFlashRN,
  LiveRowFlashUniwind,
  LiveRowFlashUnistyles,
} from "../benchmark/realtimeFlashRowViews";
import { EngineRadioGroup } from "../components/EngineRadioGroup";
import { RenderTimeLabel } from "../components/RenderTimeLabel";
import { useStylingEngine } from "../context/StylingEngineContext";
import type { LiveRow } from "../data/liveRows";
import { useBinanceBtcTicker } from "../hooks/useBinanceBtcTicker";
import { useMockLiveRows } from "../hooks/useMockLiveRows";
import { useRenderMeasurement } from "../hooks/useRenderMeasurement";

export default function RealtimeFlashBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const tickMeasureRef = useRef<(() => void) | undefined>(undefined);
  const { tick, rows } = useMockLiveRows(40, 280, () =>
    tickMeasureRef.current?.(),
  );
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
        case "stylesheet":
          return <LiveRowFlashRN item={item} />;
        case "unistyles":
          return <LiveRowFlashUnistyles item={item} />;
        case "uniwind":
          return <LiveRowFlashUniwind item={item} />;
      }
    },
    [engine],
  );

  const feedHint =
    status === "live"
      ? "Binance BTC (row 1 price) · directional flash on value text"
      : status === "connecting"
        ? "Connecting to Binance…"
        : status === "error"
          ? "Binance unavailable — mock data"
          : "Mock data · green/red flash on price / % when value moves";

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
        <Text className="mb-1 text-xs text-gray-500 dark:text-gray-400">
          {feedHint}
        </Text>
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
