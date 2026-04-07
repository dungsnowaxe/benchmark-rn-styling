import { StyleSheet, Text, View } from "react-native";
import { StyleSheet as UnistylesSheet } from "react-native-unistyles";

import type { StaticRow } from "../data/staticRows";

const hairline = StyleSheet.hairlineWidth;

const rnStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  rowA: { backgroundColor: "#ffffff" },
  rowB: { backgroundColor: "#eff6ff" },
  rowC: {
    backgroundColor: "#f9fafb",
    paddingLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  labelBase: { flex: 1, marginRight: 8 },
  labelA: { fontSize: 14, fontWeight: "600", color: "#111827" },
  labelB: { fontSize: 15, fontWeight: "500", color: "#1e3a8a" },
  labelC: { fontSize: 13, fontWeight: "700", letterSpacing: 0.3, color: "#374151" },
  valueBase: { fontVariant: ["tabular-nums"] },
  valueA: { fontSize: 14, color: "#6b7280" },
  valueB: { fontSize: 16, fontWeight: "600", color: "#2563eb" },
  valueC: { fontSize: 13, color: "#16a34a" },
});

export function StaticRowRN({ item }: { item: StaticRow }) {
  const rowStyle = [
    rnStyles.row,
    item.variant === "a" && rnStyles.rowA,
    item.variant === "b" && rnStyles.rowB,
    item.variant === "c" && rnStyles.rowC,
  ];
  const labelStyle = [
    rnStyles.labelBase,
    item.variant === "a" && rnStyles.labelA,
    item.variant === "b" && rnStyles.labelB,
    item.variant === "c" && rnStyles.labelC,
  ];
  const valueStyle = [
    rnStyles.valueBase,
    item.variant === "a" && rnStyles.valueA,
    item.variant === "b" && rnStyles.valueB,
    item.variant === "c" && rnStyles.valueC,
  ];
  return (
    <View style={rowStyle}>
      <Text style={labelStyle}>{item.label}</Text>
      <Text style={valueStyle}>{item.value}</Text>
    </View>
  );
}

const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  rowA: { backgroundColor: theme.colors.background },
  rowB: { backgroundColor: theme.colors.rowBand },
  rowC: {
    backgroundColor: theme.colors.surface,
    paddingLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  labelBase: { flex: 1, marginRight: 8 },
  labelA: { fontSize: 14, fontWeight: "600", color: theme.colors.text },
  labelB: { fontSize: 15, fontWeight: "500", color: theme.colors.accent },
  labelC: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: theme.colors.textMuted,
  },
  valueBase: { fontVariant: ["tabular-nums"] },
  valueA: { fontSize: 14, color: theme.colors.textMuted },
  valueB: { fontSize: 16, fontWeight: "600", color: theme.colors.accent },
  valueC: { fontSize: 13, color: theme.colors.positive },
}));

export function StaticRowUnistyles({ item }: { item: StaticRow }) {
  const rowStyle = [
    uniStyles.row,
    item.variant === "a" && uniStyles.rowA,
    item.variant === "b" && uniStyles.rowB,
    item.variant === "c" && uniStyles.rowC,
  ];
  const labelStyle = [
    uniStyles.labelBase,
    item.variant === "a" && uniStyles.labelA,
    item.variant === "b" && uniStyles.labelB,
    item.variant === "c" && uniStyles.labelC,
  ];
  const valueStyle = [
    uniStyles.valueBase,
    item.variant === "a" && uniStyles.valueA,
    item.variant === "b" && uniStyles.valueB,
    item.variant === "c" && uniStyles.valueC,
  ];
  return (
    <View style={rowStyle}>
      <Text style={labelStyle}>{item.label}</Text>
      <Text style={valueStyle}>{item.value}</Text>
    </View>
  );
}

export function StaticRowUniwind({ item }: { item: StaticRow }) {
  const row =
    item.variant === "b"
      ? "bg-blue-50 dark:bg-blue-950/50 border-b border-gray-200 dark:border-gray-700"
      : item.variant === "c"
        ? "border-b border-gray-200 bg-gray-50 pl-5 border-l-4 border-l-blue-600 dark:border-gray-700 dark:bg-gray-900/80"
        : "border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950";

  const label =
    item.variant === "a"
      ? "flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100"
      : item.variant === "b"
        ? "flex-1 text-[15px] font-medium text-blue-900 dark:text-blue-200"
        : "flex-1 text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300";

  const value =
    item.variant === "a"
      ? "tabular-nums text-sm text-gray-600 dark:text-gray-400"
      : item.variant === "b"
        ? "tabular-nums text-base font-semibold text-blue-600 dark:text-blue-400"
        : "tabular-nums text-sm font-medium text-green-600 dark:text-green-400";

  return (
    <View className={`flex-row items-center justify-between px-3 py-2.5 ${row}`}>
      <Text className={`mr-2 ${label}`}>{item.label}</Text>
      <Text className={value}>{item.value}</Text>
    </View>
  );
}
