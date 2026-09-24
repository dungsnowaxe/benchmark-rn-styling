import { memo, useEffect, useMemo, type ComponentType } from 'react';
import {
  type ColorSchemeName,
  StyleSheet,
  type StyleProp,
  Text,
  type TextStyle,
  useColorScheme,
  View,
} from 'react-native';
import { EaseView, type Transition } from 'react-native-ease';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  FLASH_EASING_BEZIER,
  FLASH_FADE_IN_MS,
  FLASH_FADE_OUT_MS,
  FLASH_TRANSITION_TYPE,
} from '../constants/flash-animation';
import type { LiveRow } from '../data/live-rows';
import { useFieldDirectionFlashes } from '../hooks/use-field-direction-flashes';
import { type FlashPhase, useFlashPhase } from '../hooks/use-flash-phase';

const hairline = StyleSheet.hairlineWidth;

type Palette = {
  rowBg: Record<LiveRow['variant'], string>;
  border: string;
  accent: string;
  text: string;
  textMuted: string;
  positive: string;
  negative: string;
  flashUpBg: string;
  flashDownBg: string;
  flashText: string;
};

const LIGHT: Palette = {
  rowBg: { a: '#ffffff', b: '#eff6ff', c: '#f9fafb' },
  border: '#e5e7eb',
  accent: '#1e40af',
  text: '#111827',
  textMuted: '#374151',
  positive: '#16a34a',
  negative: '#dc2626',
  flashUpBg: '#bbf7d0',
  flashDownBg: '#fecaca',
  flashText: '#111827',
};

const DARK: Palette = {
  rowBg: { a: '#0a0a0a', b: '#172554', c: '#111827' },
  border: '#374151',
  accent: '#93c5fd',
  text: '#f9fafb',
  textMuted: '#d1d5db',
  positive: '#4ade80',
  negative: '#f87171',
  flashUpBg: '#166534',
  flashDownBg: '#991b1b',
  flashText: '#f9fafb',
};

function paletteFor(scheme: ColorSchemeName): Palette {
  return scheme === 'dark' ? DARK : LIGHT;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
  },
  rowC: {
    paddingLeft: 16,
    borderLeftWidth: 3,
  },
  sym: { width: 96, fontSize: 13, fontWeight: '600' },
  symC: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  priceColumn: { flex: 1, minWidth: 0, alignItems: 'flex-end', justifyContent: 'center' },
  changeColumn: { width: 72, alignItems: 'flex-end' },
  /**
   * The flash box carries no padding of its own — padding lives on the text
   * inset below. Both arms therefore animate a background on exactly the same
   * box geometry, and the pad hugs its text in the flex-end columns.
   */
  padBox: { position: 'relative', overflow: 'hidden', borderRadius: 4 },
  padTextInset: { paddingHorizontal: 4, paddingVertical: 2 },
  price: { textAlign: 'right', fontVariant: ['tabular-nums'], fontSize: 15, fontWeight: '600' },
  change: { width: 72, textAlign: 'right', fontVariant: ['tabular-nums'], fontSize: 13 },
});

type FlashPadProps = {
  /** Shared pulse state — identical timeline for every engine arm. */
  phase: FlashPhase;
  /** Row background the pad sits on; the flash fades from and back to this. */
  baseBg: string;
  /** Directional flash colour (green up / red down). */
  flashBg: string;
  baseText: string;
  flashText: string;
  value: string;
  textStyle: StyleProp<TextStyle>;
};

/**
 * react-native-ease arm — a deliberate hybrid.
 *
 * Background: `backgroundColor` is a first-class key of react-native-ease's
 * `AnimateProps`, so the flash is purely declarative — set the target colour and
 * the native view animates to it (CAAnimation on the `backgroundColor` key path
 * on iOS, `ValueAnimator.ofArgb()` on Android). No JS animation loop, no worklet.
 *
 * Text colour: react-native-ease v0.8.0 ships exactly one component, `EaseView`.
 * There is no `EaseText` and `AnimateProps` has no `color` key, so it cannot
 * animate text colour at all. That half runs on Reanimated's `interpolateColor`
 * — the "use each library where it fits" hybrid. This arm therefore carries a
 * worklet that the pure-Ease ideal would not, which is itself part of what the
 * comparison measures: Ease cannot own this effect end to end.
 */
function EaseFlashPad({
  phase,
  baseBg,
  flashBg,
  baseText,
  flashText,
  value,
  textStyle,
}: FlashPadProps) {
  const flashing = phase !== 'idle';

  // 'in' fades to the flash colour, 'out'/'idle' fade back to the row bg.
  const duration = phase === 'in' ? FLASH_FADE_IN_MS : FLASH_FADE_OUT_MS;

  const transition = useMemo<Transition>(
    () => ({
      backgroundColor: {
        type: FLASH_TRANSITION_TYPE,
        duration,
        easing: [...FLASH_EASING_BEZIER] as [number, number, number, number],
      },
    }),
    [duration],
  );

  const progress = useSharedValue(0);

  useEffect(() => {
    if (phase === 'in') {
      progress.value = withTiming(1, {
        duration: FLASH_FADE_IN_MS,
        easing: Easing.bezier(...FLASH_EASING_BEZIER),
      });
    } else if (phase === 'out') {
      progress.value = withTiming(0, {
        duration: FLASH_FADE_OUT_MS,
        easing: Easing.bezier(...FLASH_EASING_BEZIER),
      });
    }
  }, [phase, progress]);

  const colorStyle = useAnimatedStyle(
    () => ({
      color: interpolateColor(progress.value, [0, 1], [baseText, flashText]),
    }),
    [baseText, flashText],
  );

  return (
    <EaseView
      style={styles.padBox}
      animate={{ backgroundColor: flashing ? flashBg : baseBg }}
      transition={transition}
    >
      <Animated.Text style={[textStyle, styles.padTextInset, colorStyle]} numberOfLines={1}>
        {value}
      </Animated.Text>
    </EaseView>
  );
}

/**
 * react-native-reanimated arm.
 *
 * One shared value drives the whole pulse on the UI thread: `Animated.View`
 * takes the background and `Animated.Text` takes the colour, both from
 * `interpolateColor` off that single progress value.
 *
 * This is the difference from the Ease arm, which cannot express the effect end
 * to end — it animates the background natively but still needs this same
 * worklet for the text colour, so it pays for a shared value *and* a native
 * view transition per field.
 */
function ReanimatedFlashPad({
  phase,
  baseBg,
  flashBg,
  baseText,
  flashText,
  value,
  textStyle,
}: FlashPadProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (phase === 'in') {
      progress.value = withTiming(1, {
        duration: FLASH_FADE_IN_MS,
        easing: Easing.bezier(...FLASH_EASING_BEZIER),
      });
    } else if (phase === 'out') {
      progress.value = withTiming(0, {
        duration: FLASH_FADE_OUT_MS,
        easing: Easing.bezier(...FLASH_EASING_BEZIER),
      });
    }
    // 'idle' deliberately does nothing — the 'out' timing already lands on 0,
    // and re-triggering it would stretch the pulse past the Ease arm's.
  }, [phase, progress]);

  const bgStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(progress.value, [0, 1], [baseBg, flashBg]),
    }),
    [baseBg, flashBg],
  );

  const colorStyle = useAnimatedStyle(
    () => ({
      color: interpolateColor(progress.value, [0, 1], [baseText, flashText]),
    }),
    [baseText, flashText],
  );

  return (
    <Animated.View style={[styles.padBox, bgStyle]}>
      <Animated.Text style={[textStyle, styles.padTextInset, colorStyle]} numberOfLines={1}>
        {value}
      </Animated.Text>
    </Animated.View>
  );
}

type LiveRowAnimProps = {
  item: LiveRow;
  Pad: ComponentType<FlashPadProps>;
};

/**
 * Row body shared by both arms. Everything except `Pad` is byte-identical —
 * same palette, same StyleSheet, same direction tracking, same pulse phases —
 * so any measured difference is attributable to the animation backend.
 */
const LiveRowAnimInner = memo(function LiveRowAnimInner({ item, Pad }: LiveRowAnimProps) {
  const scheme = useColorScheme();
  const pal = paletteFor(scheme);
  const { priceDir, changeDir, priceFlashGen, changeFlashGen } = useFieldDirectionFlashes(item);
  const pricePhase = useFlashPhase(priceDir, priceFlashGen);
  const changePhase = useFlashPhase(changeDir, changeFlashGen);

  const isUp = item.changePct >= 0;

  return (
    <View
      style={[
        styles.row,
        item.variant === 'c' && styles.rowC,
        {
          backgroundColor: pal.rowBg[item.variant],
          borderBottomColor: pal.border,
          ...(item.variant === 'c' ? { borderLeftColor: pal.accent } : null),
        },
      ]}
    >
      <Text
        style={[
          styles.sym,
          item.variant === 'c' && styles.symC,
          {
            color:
              item.variant === 'b' ? pal.accent : item.variant === 'c' ? pal.textMuted : pal.text,
          },
        ]}
        numberOfLines={1}
      >
        {item.symbol}
      </Text>

      <View style={styles.priceColumn}>
        <Pad
          phase={pricePhase}
          baseBg={pal.rowBg[item.variant]}
          flashBg={priceDir === 'down' ? pal.flashDownBg : pal.flashUpBg}
          baseText={pal.text}
          flashText={pal.flashText}
          value={item.price.toFixed(2)}
          textStyle={styles.price}
        />
      </View>

      <View style={styles.changeColumn}>
        <Pad
          phase={changePhase}
          baseBg={pal.rowBg[item.variant]}
          flashBg={changeDir === 'down' ? pal.flashDownBg : pal.flashUpBg}
          baseText={isUp ? pal.positive : pal.negative}
          flashText={pal.flashText}
          value={`${item.changePct.toFixed(2)}%`}
          textStyle={styles.change}
        />
      </View>
    </View>
  );
});

export function LiveRowAnimEase({ item }: { item: LiveRow }) {
  return <LiveRowAnimInner item={item} Pad={EaseFlashPad} />;
}

export function LiveRowAnimReanimated({ item }: { item: LiveRow }) {
  return <LiveRowAnimInner item={item} Pad={ReanimatedFlashPad} />;
}
