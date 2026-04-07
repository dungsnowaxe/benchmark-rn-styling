## 1. Specs and routing shell

- [x] 1.1 Add Expo Router screen file for the realtime flash benchmark (clone structure from `realtime-benchmark.tsx`: data hooks, `FlatList`, engine radio, render measurement, feed hint).
- [x] 1.2 Register navigation from the home screen to the new route with copy that distinguishes this benchmark from the plain realtime screen.

## 2. Flash state and row UI (three engines)

- [x] 2.1 Implement previous-value tracking keyed by row `id` for `price` and `changePct`, with no directional flash on first paint or when values are equal.
- [x] 2.2 Implement timed directional flash state per field (green when new > old, red when new < old) scoped to the text (or tight wrapper) for **price** and **change %** only.
- [x] 2.3 Add StyleSheet-based row implementation for the flash screen (`stylesheet` engine).
- [x] 2.4 Add Unistyles v3 row implementation using theme-friendly flash background colors for light/dark.
- [x] 2.5 Add Uniwind row implementation with `className` for flash backgrounds and dark-mode variants.

## 3. Quality and parity

- [x] 3.1 Manually verify contrast in light and dark appearance for both flash directions on all three engines.
- [x] 3.2 Confirm styling engine selection persists when navigating home → static → realtime → realtime-flash (and matches existing context behavior).
