import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StyleSheet as UnistylesSheet, useUnistyles } from "react-native-unistyles";

import type { ListItemStateRow } from "../data/listItemStatesRows";

const hairline = StyleSheet.hairlineWidth;

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  rowSelected: {
    backgroundColor: "#dbeafe",
  },
  rowHighlighted: {
    backgroundColor: "#fef3c7",
  },
  rowDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxCheck: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  titleUnread: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
  },
  badgeNew: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
  },
  badgeUnread: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
  },
  loadingSpinner: {
    marginLeft: 8,
  },
});

function ListItemStateRowRNInner({ item }: { item: ListItemStateRow }) {
  const rowStyle = [
    rnStyles.row,
    item.isSelected && rnStyles.rowSelected,
    item.isHighlighted && !item.isSelected && rnStyles.rowHighlighted,
    item.isDisabled && rnStyles.rowDisabled,
  ];

  const checkboxStyle = [
    rnStyles.checkbox,
    item.isSelected && rnStyles.checkboxSelected,
  ];

  const titleStyle = [
    rnStyles.title,
    item.hasUnread && rnStyles.titleUnread,
  ];

  return (
    <View style={rowStyle}>
      <View style={checkboxStyle}>
        {item.isSelected && (
          <Text style={rnStyles.checkboxCheck}>✓</Text>
        )}
      </View>
      <View style={rnStyles.content}>
        <Text style={titleStyle}>{item.title}</Text>
        <Text style={rnStyles.subtitle}>{item.subtitle}</Text>
      </View>
      <View style={rnStyles.badges}>
        {item.isNew && <Text style={rnStyles.badgeNew}>NEW</Text>}
        {item.hasUnread && <Text style={rnStyles.badgeUnread}>●</Text>}
        {item.isLoading && (
          <ActivityIndicator
            size="small"
            color="#2563eb"
            style={rnStyles.loadingSpinner}
          />
        )}
      </View>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  rowSelected: {
    backgroundColor: theme.colors.accentBg,
  },
  rowHighlighted: {
    backgroundColor: theme.colors.warningBg,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  checkboxCheck: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.text,
  },
  titleUnread: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
  },
  badgeNew: {
    backgroundColor: theme.colors.warningBg,
    color: theme.colors.warningText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
  },
  badgeUnread: {
    backgroundColor: theme.colors.errorBg,
    color: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
  },
  loadingSpinner: {
    marginLeft: 8,
  },
}));

function ListItemStateRowUnistylesInner({ item }: { item: ListItemStateRow }) {
  const { theme } = useUnistyles();

  const rowStyle = [
    uniStyles.row,
    item.isSelected && uniStyles.rowSelected,
    item.isHighlighted && !item.isSelected && uniStyles.rowHighlighted,
    item.isDisabled && uniStyles.rowDisabled,
  ];

  const checkboxStyle = [
    uniStyles.checkbox,
    item.isSelected && uniStyles.checkboxSelected,
  ];

  const titleStyle = [
    uniStyles.title,
    item.hasUnread && uniStyles.titleUnread,
  ];

  return (
    <View style={rowStyle}>
      <View style={checkboxStyle}>
        {item.isSelected && (
          <Text style={uniStyles.checkboxCheck}>✓</Text>
        )}
      </View>
      <View style={uniStyles.content}>
        <Text style={titleStyle}>{item.title}</Text>
        <Text style={uniStyles.subtitle}>{item.subtitle}</Text>
      </View>
      <View style={uniStyles.badges}>
        {item.isNew && <Text style={uniStyles.badgeNew}>NEW</Text>}
        {item.hasUnread && <Text style={uniStyles.badgeUnread}>●</Text>}
        {item.isLoading && (
          <ActivityIndicator
            size="small"
            color={theme.colors.accent}
            style={uniStyles.loadingSpinner}
          />
        )}
      </View>
    </View>
  );
}

// Uniwind variant
function ListItemStateRowUniwindInner({ item }: { item: ListItemStateRow }) {
  const rowBase = "flex-row items-center px-3 py-2.5 border-b border-gray-200 dark:border-gray-700";
  const rowMods = item.isDisabled
    ? "opacity-50"
    : item.isSelected
      ? "bg-blue-50 dark:bg-blue-950/30"
      : item.isHighlighted
        ? "bg-amber-50 dark:bg-amber-950/30"
        : "bg-white dark:bg-gray-950";

  const checkboxBase = "w-5 h-5 rounded border-2 mr-2.5 items-center justify-center";
  const checkboxMod = item.isSelected
    ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
    : "border-gray-300 dark:border-gray-600";

  const titleMod = item.hasUnread
    ? "font-bold text-gray-900 dark:text-gray-100"
    : "font-medium text-gray-900 dark:text-gray-100";

  return (
    <View className={`${rowBase} ${rowMods}`}>
      <View className={`${checkboxBase} ${checkboxMod}`}>
        {item.isSelected && (
          <Text className="text-[12px] font-bold text-white dark:text-white">✓</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className={`text-[15px] ${titleMod}`}>{item.title}</Text>
        <Text className="text-[13px] text-gray-600 dark:text-gray-400 mt-0.5">
          {item.subtitle}
        </Text>
      </View>
      <View className="flex-row gap-1 ml-2">
        {item.isNew && (
          <Text className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            NEW
          </Text>
        )}
        {item.hasUnread && (
          <Text className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            ●
          </Text>
        )}
        {item.isLoading && (
          <ActivityIndicator size="small" color="#2563eb" className="ml-2" />
        )}
      </View>
    </View>
  );
}

export const ListItemStateRowRN = memo(ListItemStateRowRNInner);
export const ListItemStateRowUnistyles = memo(ListItemStateRowUnistylesInner);
export const ListItemStateRowUniwind = memo(ListItemStateRowUniwindInner);
