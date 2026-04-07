import { Text } from "react-native";

type Props = {
  lastMs: number | null;
};

export function RenderTimeLabel({ lastMs }: Props) {
  return (
    <Text className="text-xs text-gray-500 dark:text-gray-400">
      Last render (approx.):{" "}
      {lastMs === null ? "—" : `${lastMs.toFixed(1)} ms`} — compare engines on
      the same device; not native profiling.
    </Text>
  );
}
