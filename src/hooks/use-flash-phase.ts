import { useEffect, useState } from 'react';

import { FLASH_FADE_IN_MS } from '../constants/flash-animation';
import type { Direction } from './use-field-direction-flashes';

export type FlashPhase = 'idle' | 'in' | 'out';

type FadeState = {
  /** The flashGen this record refers to; a stale gen means "still fading in". */
  gen: number;
  fadedOut: boolean;
};

const NO_FADE: FadeState = { gen: -1, fadedOut: false };

/**
 * Normalises a directional flash into an explicit 3-state pulse:
 *
 *   idle --(direction changes)--> in (FLASH_FADE_IN_MS) --> out (FLASH_FADE_OUT_MS) --> idle
 *
 * Both animation-engine arms are driven by this same hook, which is what makes
 * the comparison fair: identical React work, identical state transitions and
 * identical timings, with only the code that turns `phase` into pixels
 * differing between them.
 *
 * Deliberately cheap. `'in'` is *derived* (a new `flashGen` that has no fade
 * record yet is still fading in), so a flash costs exactly one extra `setState`
 * — the `in → out` timer — instead of one per phase. At 60 rows × 2 fields on a
 * 280ms feed that is the difference between ~180 and ~540 re-renders per tick,
 * which would otherwise dominate the frame budget and bury the very difference
 * between animation backends this screen exists to measure.
 *
 * `'idle'` needs no write at all: `useFieldDirectionFlashes` clears `direction`
 * on its own timer, and both `out` and `idle` target the row background.
 */
export function useFlashPhase(direction: Direction | null, flashGen: number): FlashPhase {
  const [fade, setFade] = useState<FadeState>(NO_FADE);

  useEffect(() => {
    if (direction === null) return;

    const timer = setTimeout(() => {
      setFade({ gen: flashGen, fadedOut: true });
    }, FLASH_FADE_IN_MS);

    return () => clearTimeout(timer);
  }, [direction, flashGen]);

  if (direction === null) return 'idle';
  return fade.gen === flashGen && fade.fadedOut ? 'out' : 'in';
}
