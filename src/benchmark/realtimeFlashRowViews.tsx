import { memo } from "react";
import {
  type ColorSchemeName,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { StyleSheet as UnistylesSheet, useUnistyles } from "react-native-unistyles";

import { AnimatedFlashPad } from "../components/AnimatedFlashPad";
import type { LiveRow } from "../data/liveRows";
import type { Direction } from "../hooks/useFieldDirectionFlashes";
import { useFieldDirectionFlashes } from "../hooks/useFieldDirectionFlashes";

const hairline = StyleSheet.hairlineWidth;

const rnLight = {
  flashUpBg: "#bbf7d0",
  flashDownBg: "#fecaca",
  flashText: "#111827",
};

const rnDark = {
  flashUpBg: "#166534",
  flashDownBg: "#991b1b",
  flashText: "#f9fafb",
};

function flashTextStyle(dir: Direction | null, scheme: ColorSchemeName) {
  if (dir === null) return undefined;
  const pal = scheme === "dark" ? rnDark : rnLight;
  return { color: pal.flashText };
}

const rnStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  rowA: { backgroundColor: "#ffffff" },
  rowB: { backgroundColor: "#eff6ff" },
  rowC: {
    backgroundColor: "#f9fafb",
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  sym: { width: 96, fontSize: 13, fontWeight: "600", color: "#111827" },
  symB: { color: "#1e40af" },
  symC: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5, color: "#374151" },
  priceColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  flashPad: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  price: {
    textAlign: "right",
    fontVariant: ["tabular-nums"],
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  ch: { width: 72, textAlign: "right", fontVariant: ["tabular-nums"], fontSize: 13 },
  chPos: { color: "#16a34a" },
  chNeg: { color: "#dc2626" },
});

function LiveRowFlashRNInner({ item }: { item: LiveRow }) {
  const scheme = useColorScheme();
  const { priceDir, changeDir, priceFlashGen, changeFlashGen } =
    useFieldDirectionFlashes(item);
  const pal = scheme === "dark" ? rnDark : rnLight;
  const rowStyle = [
    rnStyles.row,
    item.variant === "a" && rnStyles.rowA,
    item.variant === "b" && rnStyles.rowB,
    item.variant === "c" && rnStyles.rowC,
  ];
  const symStyle = [
    rnStyles.sym,
    item.variant === "b" && rnStyles.symB,
    item.variant === "c" && rnStyles.symC,
  ];
  const chBase = [
    rnStyles.ch,
    item.changePct >= 0 ? rnStyles.chPos : rnStyles.chNeg,
  ];

  return (
    <View style={rowStyle}>
      <Text style={symStyle} numberOfLines={1}>
        {item.symbol}
      </Text>
      <View style={rnStyles.priceColumn}>
        <AnimatedFlashPad
          direction={priceDir}
          flashGen={priceFlashGen}
          upColor={pal.flashUpBg}
          downColor={pal.flashDownBg}
          padStyle={priceDir !== null ? rnStyles.flashPad : undefined}
        >
          <Text style={[rnStyles.price, flashTextStyle(priceDir, scheme)]}>
            {item.price.toFixed(2)}
          </Text>
        </AnimatedFlashPad>
      </View>
      <View style={{ width: 72, alignItems: "flex-end" }}>
        <AnimatedFlashPad
          direction={changeDir}
          flashGen={changeFlashGen}
          upColor={pal.flashUpBg}
          downColor={pal.flashDownBg}
          padStyle={changeDir !== null ? rnStyles.flashPad : undefined}
        >
          <Text style={[chBase, flashTextStyle(changeDir, scheme)]}>
            {item.changePct.toFixed(2)}%
          </Text>
        </AnimatedFlashPad>
      </View>
    </View>
  );
}

export const LiveRowFlashRN = memo(LiveRowFlashRNInner);

const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  rowA: { backgroundColor: theme.colors.background },
  rowB: { backgroundColor: theme.colors.rowBand },
  rowC: {
    backgroundColor: theme.colors.surface,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  sym: { width: 96, fontSize: 13, fontWeight: "600", color: theme.colors.text },
  symB: { color: theme.colors.accent },
  symC: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: theme.colors.textMuted,
  },
  priceColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  price: {
    textAlign: "right",
    fontVariant: ["tabular-nums"],
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  ch: {
    width: 72,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
    fontSize: 13,
  },
  chPos: { color: theme.colors.positive },
  chNeg: { color: theme.colors.negative },
  flashPad: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  textOnFlash: {
    color: theme.colors.flashText,
  },
}));

function LiveRowFlashUnistylesInner({ item }: { item: LiveRow }) {
  const { theme } = useUnistyles();
  const { priceDir, changeDir, priceFlashGen, changeFlashGen } =
    useFieldDirectionFlashes(item);
  const rowStyle = [
    uniStyles.row,
    item.variant === "a" && uniStyles.rowA,
    item.variant === "b" && uniStyles.rowB,
    item.variant === "c" && uniStyles.rowC,
  ];
  const symStyle = [
    uniStyles.sym,
    item.variant === "b" && uniStyles.symB,
    item.variant === "c" && uniStyles.symC,
  ];
  const chStyle = [
    uniStyles.ch,
    item.changePct >= 0 ? uniStyles.chPos : uniStyles.chNeg,
  ];

  return (
    <View style={rowStyle}>
      <Text style={symStyle} numberOfLines={1}>
        {item.symbol}
      </Text>
      <View style={uniStyles.priceColumn}>
        <AnimatedFlashPad
          direction={priceDir}
          flashGen={priceFlashGen}
          upColor={theme.colors.flashPositiveBg}
          downColor={theme.colors.flashNegativeBg}
          padStyle={priceDir !== null ? uniStyles.flashPad : undefined}
        >
          <Text style={[uniStyles.price, priceDir !== null && uniStyles.textOnFlash]}>
            {item.price.toFixed(2)}
          </Text>
        </AnimatedFlashPad>
      </View>
      <View style={{ width: 72, alignItems: "flex-end" }}>
        <AnimatedFlashPad
          direction={changeDir}
          flashGen={changeFlashGen}
          upColor={theme.colors.flashPositiveBg}
          downColor={theme.colors.flashNegativeBg}
          padStyle={changeDir !== null ? uniStyles.flashPad : undefined}
        >
          <Text style={[chStyle, changeDir !== null && uniStyles.textOnFlash]}>
            {item.changePct.toFixed(2)}%
          </Text>
        </AnimatedFlashPad>
      </View>
    </View>
  );
}

export const LiveRowFlashUnistyles = memo(LiveRowFlashUnistylesInner);

const uniwindFlashPad = {
  borderRadius: 4,
  paddingHorizontal: 4,
  paddingVertical: 2,
};

function LiveRowFlashUniwindInner({ item }: { item: LiveRow }) {
  const scheme = useColorScheme();
  const pal = scheme === "dark" ? rnDark : rnLight;
  const { priceDir, changeDir, priceFlashGen, changeFlashGen } =
    useFieldDirectionFlashes(item);
  const row =
    item.variant === "b"
      ? "bg-blue-50 dark:bg-blue-950/50 border-b border-gray-200 dark:border-gray-700"
      : item.variant === "c"
        ? "border-b border-gray-200 bg-gray-50 pl-4 border-l-4 border-l-blue-600 dark:border-gray-700 dark:bg-gray-900/80"
        : "border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950";

  const sym =
    item.variant === "a"
      ? "w-24 text-sm font-semibold text-gray-900 dark:text-gray-100"
      : item.variant === "b"
        ? "w-24 text-sm font-semibold text-blue-900 dark:text-blue-200"
        : "w-24 text-xs font-extrabold uppercase tracking-wide text-gray-700 dark:text-gray-300";

  const chColor =
    item.changePct >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  const priceText =
    "text-right tabular-nums text-[15px] font-semibold text-gray-900 dark:text-gray-100";

  const chText =
    changeDir !== null
      ? "w-[72px] text-right tabular-nums text-sm text-gray-900 dark:text-gray-100"
      : `w-[72px] text-right tabular-nums text-sm ${chColor}`;

  return (
    <View className={`flex-row items-center justify-between px-3 py-2 ${row}`}>
      <Text className={sym} numberOfLines={1}>
        {item.symbol}
      </Text>
      <View className="min-w-0 flex-1 items-end">
        <AnimatedFlashPad
          direction={priceDir}
          flashGen={priceFlashGen}
          upColor={pal.flashUpBg}
          downColor={pal.flashDownBg}
          padStyle={priceDir !== null ? uniwindFlashPad : undefined}
        >
          <Text className={priceText}>{item.price.toFixed(2)}</Text>
        </AnimatedFlashPad>
      </View>
      <View className="w-[72px] items-end">
        <AnimatedFlashPad
          direction={changeDir}
          flashGen={changeFlashGen}
          upColor={pal.flashUpBg}
          downColor={pal.flashDownBg}
          padStyle={changeDir !== null ? uniwindFlashPad : undefined}
        >
          <Text className={chText}>{item.changePct.toFixed(2)}%</Text>
        </AnimatedFlashPad>
      </View>
    </View>
  );
}

export const LiveRowFlashUniwind = memo(LiveRowFlashUniwindInner);
