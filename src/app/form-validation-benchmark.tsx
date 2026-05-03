import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  FormValidationRowRN,
  FormValidationRowUnistyles,
  FormValidationRowUniwind,
} from "../benchmark/formValidationRowViews";
import { EngineRadioGroup } from "../components/EngineRadioGroup";
import { RenderTimeLabel } from "../components/RenderTimeLabel";
import { useStylingEngine } from "../context/StylingEngineContext";
import type { FormValidationRow } from "../data/formValidationRows";
import { useFrameRateMonitor } from "../hooks/useFrameRateMonitor";
import { useRenderMeasurement } from "../hooks/useRenderMeasurement";
import { useFormValidationToggle } from "../hooks/useFormValidationToggle";

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
        50 form fields with 6 validation states
      </Text>
      <RenderTimeLabel lastMs={lastMs} />
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 dark:text-gray-300">
          FPS: {fps} | Drops: {dropsPerMinute}/min
        </Text>
        <Pressable
          onPress={onToggleStress}
          className={`rounded-lg px-3 py-1.5 ${
            stressEnabled
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              stressEnabled
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {stressEnabled ? "Stop Stress" : "Start Stress"} ({updateCount}/
            {maxUpdates})
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function FormValidationBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const [stressEnabled, setStressEnabled] = useState(false);

  const { fields, updateCount, maxUpdates } = useFormValidationToggle({
    fieldCount: 50,
    updateInterval: 150,
    enabled: stressEnabled,
  });

  const { lastMs, markStart } = useRenderMeasurement(engine, updateCount);
  const { fps, dropsPerMinute } = useFrameRateMonitor(stressEnabled);

  const renderItem = useCallback(
    ({ item }: { item: FormValidationRow }) => {
      switch (engine) {
        case "stylesheet":
          return <FormValidationRowRN item={item} />;
        case "unistyles":
          return <FormValidationRowUnistyles item={item} />;
        case "uniwind":
          return <FormValidationRowUniwind item={item} />;
      }
    },
    [engine],
  );

  const fieldsDisplay = useMemo(() => fields, [fields]);

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
        data={fieldsDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={14}
        windowSize={7}
      />
    </View>
  );
}
