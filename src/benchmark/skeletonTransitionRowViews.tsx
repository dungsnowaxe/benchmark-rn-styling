import { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { StyleSheet as UnistylesSheet } from "react-native-unistyles";

import type { SkeletonRow } from "../data/skeletonRows";

const hairline = StyleSheet.hairlineWidth;

function SkeletonPulse({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(1));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return <Animated.View style={{ opacity: opacity.current }}>{children}</Animated.View>;
}

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  skeletonRow: {
    height: 60,
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  skeletonBar: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
  skeletonBarShort: {
    width: "60%",
    marginTop: 8,
  },
  contentRow: {
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
});

function SkeletonTransitionRowRNInner({ item }: { item: SkeletonRow }) {
  if (item.state === "skeleton") {
    return (
      <SkeletonPulse>
        <View style={[rnStyles.row, rnStyles.skeletonRow]}>
          <View style={rnStyles.skeletonBar} />
          <View style={[rnStyles.skeletonBar, rnStyles.skeletonBarShort]} />
        </View>
      </SkeletonPulse>
    );
  }

  return (
    <View style={[rnStyles.row, rnStyles.contentRow, { height: item.height }]}>
      <Text style={rnStyles.title}>{item.title}</Text>
      <Text style={rnStyles.subtitle}>{item.subtitle}</Text>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  skeletonRow: {
    height: 60,
    justifyContent: "center",
    backgroundColor: theme.colors.muted,
  },
  skeletonBar: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
  },
  skeletonBarShort: {
    width: "60%",
    marginTop: 8,
  },
  contentRow: {
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
}));

function SkeletonTransitionRowUnistylesInner({ item }: { item: SkeletonRow }) {
  if (item.state === "skeleton") {
    return (
      <SkeletonPulse>
        <View style={[uniStyles.row, uniStyles.skeletonRow]}>
          <View style={uniStyles.skeletonBar} />
          <View style={[uniStyles.skeletonBar, uniStyles.skeletonBarShort]} />
        </View>
      </SkeletonPulse>
    );
  }

  return (
    <View style={[uniStyles.row, uniStyles.contentRow, { height: item.height }]}>
      <Text style={uniStyles.title}>{item.title}</Text>
      <Text style={uniStyles.subtitle}>{item.subtitle}</Text>
    </View>
  );
}

// Uniwind variant
function SkeletonTransitionRowUniwindInner({ item }: { item: SkeletonRow }) {
  if (item.state === "skeleton") {
    return (
      <SkeletonPulse>
        <View className="h-[60px] justify-center bg-gray-100 dark:bg-gray-800 py-2.5 px-3 border-b border-gray-200 dark:border-gray-700">
          <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
          <View className="h-3 w-3/5 bg-gray-300 dark:bg-gray-600 rounded mt-2" />
        </View>
      </SkeletonPulse>
    );
  }

  return (
    <View
      className="justify-center py-2.5 px-3 border-b border-gray-200 dark:border-gray-700"
      style={{ height: item.height }}
    >
      <Text className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
        {item.title}
      </Text>
      <Text className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">
        {item.subtitle}
      </Text>
    </View>
  );
}

export const SkeletonTransitionRowRN = memo(SkeletonTransitionRowRNInner);
export const SkeletonTransitionRowUnistyles = memo(SkeletonTransitionRowUnistylesInner);
export const SkeletonTransitionRowUniwind = memo(SkeletonTransitionRowUniwindInner);
