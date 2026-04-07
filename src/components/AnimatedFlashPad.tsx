import { type ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

import {
  FLASH_FADE_IN_MS,
  FLASH_FADE_OUT_MS,
} from "../constants/flashAnimation";
import type { Direction } from "../hooks/useFieldDirectionFlashes";

type Props = {
  direction: Direction | null;
  flashGen: number;
  upColor: string;
  downColor: string;
  padStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Brief directional highlight: opacity 0 → 1 → 0 on the background fill only.
 * Children render at full opacity on top of the animated layer.
 */
export function AnimatedFlashPad({
  direction,
  flashGen,
  upColor,
  downColor,
  padStyle,
  children,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const running = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    running.current?.stop();
    running.current = null;

    if (direction === null) {
      opacity.setValue(0);
      return;
    }

    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: FLASH_FADE_IN_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: FLASH_FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]);
    running.current = anim;
    anim.start(({ finished }) => {
      if (finished) running.current = null;
    });

    return () => {
      anim.stop();
      running.current = null;
    };
  }, [direction, flashGen]);

  const bg =
    direction === "up"
      ? upColor
      : direction === "down"
        ? downColor
        : "transparent";

  if (padStyle == null) {
    return <>{children}</>;
  }

  return (
    <View style={[padStyle, styles.shell]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: bg, opacity },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
  },
});
