/** Fade in + fade out for directional field flash (must match AnimatedFlashPad). */
export const FLASH_FADE_IN_MS = 75;
export const FLASH_FADE_OUT_MS = 280;
export const FLASH_ANIMATION_MS = FLASH_FADE_IN_MS + FLASH_FADE_OUT_MS;

/**
 * Cubic-bezier control points for the flash pulse, shared by every animation
 * engine arm so the comparison varies the backend and nothing else.
 *
 * `[0, 0, 0.58, 1]` is exactly react-native-ease's built-in `'easeOut'` preset
 * (see EASING_PRESETS in its EaseView.tsx). Reanimated reproduces the same
 * curve with `Easing.bezier(...FLASH_EASING_BEZIER)`.
 */
export const FLASH_EASING_BEZIER = [0, 0, 0.58, 1] as const;

/**
 * react-native-ease animates `backgroundColor` with `ValueAnimator.ofArgb()` on
 * Android, which is timing-only — a spring transition silently falls back to
 * timing 300ms there. Both arms therefore use `timing` so the pulse shape is
 * identical on iOS and Android.
 */
export const FLASH_TRANSITION_TYPE = 'timing' as const;
