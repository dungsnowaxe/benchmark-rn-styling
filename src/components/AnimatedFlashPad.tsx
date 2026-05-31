import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, type StyleProp, View, type ViewStyle } from 'react-native';

import { FLASH_FADE_IN_MS, FLASH_FADE_OUT_MS } from '../constants/flashAnimation';
import type { Direction } from '../hooks/useFieldDirectionFlashes';

type Props = {
  direction: Direction | null;
  flashGen: number;
  upColor: string;
  downColor: string;
  padStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

const absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function AnimatedFlashPad({
  direction,
  flashGen,
  upColor,
  downColor,
  padStyle,
  children,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }

    if (direction === null) {
      opacity.stopAnimation(() => {
        opacity.setValue(0);
      });
      return;
    }

    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: FLASH_FADE_IN_MS,
        useNativeDriver: true,
        isInteraction: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: FLASH_FADE_OUT_MS,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]);
    animRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) animRef.current = null;
    });

    return () => {
      anim.stop();
      animRef.current = null;
    };
  }, [direction, flashGen]);

  const bg = direction === 'up' ? upColor : direction === 'down' ? downColor : 'transparent';

  return (
    <View style={[padStyle, { position: 'relative', overflow: 'hidden' }]}>
      <Animated.View pointerEvents="none" style={{ ...absoluteFill, opacity }}>
        <View pointerEvents="none" style={{ ...absoluteFill, backgroundColor: bg }} />
      </Animated.View>
      {children}
    </View>
  );
}
