import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * The animation backend under test. Orthogonal to `StylingEngine`: every arm on
 * the animation benchmark renders its static chrome through the same RN
 * StyleSheet path, so only the animation backend varies.
 *
 * - `ease`       — react-native-ease `EaseView`: declarative props animated by
 *                  Core Animation (iOS) / ObjectAnimator + ValueAnimator
 *                  (Android). No JS animation loop, no worklets.
 * - `reanimated` — react-native-reanimated shared values + `withTiming`,
 *                  animated on the UI thread through worklets.
 */
export type AnimationEngine = 'ease' | 'reanimated';

export const ANIMATION_ENGINE_LABELS: Record<AnimationEngine, string> = {
  ease: 'react-native-ease',
  reanimated: 'Reanimated',
};

type AnimationEngineContextValue = {
  animationEngine: AnimationEngine;
  setAnimationEngine: (engine: AnimationEngine) => void;
};

const AnimationEngineContext = createContext<AnimationEngineContextValue | null>(null);

export function AnimationEngineProvider({ children }: { children: ReactNode }) {
  const [animationEngine, setAnimationEngineState] = useState<AnimationEngine>('ease');

  const setAnimationEngine = useCallback((next: AnimationEngine) => {
    setAnimationEngineState(next);
  }, []);

  const value = useMemo(
    () => ({ animationEngine, setAnimationEngine }),
    [animationEngine, setAnimationEngine],
  );

  return (
    <AnimationEngineContext.Provider value={value}>{children}</AnimationEngineContext.Provider>
  );
}

export function useAnimationEngine() {
  const ctx = useContext(AnimationEngineContext);
  if (!ctx) {
    throw new Error('useAnimationEngine must be used within AnimationEngineProvider');
  }
  return ctx;
}
