## 1. Dependencies and Unistyles setup

- [x] 1.1 Add `react-native-unistyles` (v3) and run install; align peer requirements with Expo SDK 54 / RN 0.81
- [x] 1.2 Configure Babel (and Metro if required) per Unistyles v3 + Uniwind docs; verify app still starts on iOS/Android
- [x] 1.3 Register Unistyles theme(s) or minimal boilerplate so v3 APIs work app-wide

## 2. Styling engine context and shared UI

- [x] 2.1 Add `StylingEngine` type (`stylesheet` | `unistyles` | `uniwind`) and React context/provider holding selection with setter
- [x] 2.2 Build a reusable radio group component (or per-screen radios) that updates context and labels all three engines clearly
- [x] 2.3 Wrap benchmark routes with the provider so selection persists when navigating between static and realtime screens
- [x] 2.4 Add shared render-time measurement helper (e.g. `performance.now()` + `useLayoutEffect` / `requestAnimationFrame` / list `onLayout` per design) and a small text readout component for “last render: X ms”

## 3. Navigation shell

- [x] 3.1 Add Expo Router routes for static and realtime benchmark screens (tabs or stack) under `src/app/`
- [x] 3.2 Update home/index to link or redirect to both benchmarks per design

## 4. Static list benchmark

- [x] 4.1 Define shared static row data (labels, values, style variants) independent of styling code
- [x] 4.2 Implement row UI three ways: `StyleSheet`, Unistyles v3, and Uniwind; switch by context
- [x] 4.3 Render with `FlatList`, stable keys, and heterogeneous row styling per spec; include radio group on screen
- [x] 4.4 Wire render-time readout for initial mount and styling-engine changes; document that values are approximate

## 5. Realtime list benchmark

- [x] 5.1 Implement mock ticker (interval-based random walk) producing symbol, price, and change for N rows
- [x] 5.2 Optionally integrate a public WebSocket (crypto/stock); on failure or flag-off, use mock only and avoid crashing
- [x] 5.3 Implement row UI three ways as on static screen; memoize row components appropriately per engine
- [x] 5.4 Render with `FlatList` and include radio group on screen
- [x] 5.5 Wire render-time readout on each data tick and on styling-engine changes

## 6. Verification and notes

- [x] 6.1 Manually verify all three engines on static and realtime screens; confirm session-persisted engine across navigation
- [x] 6.2 Add brief README or in-app note on how to run benchmarks and what to observe (jank, updates, render-time caveats, devtools)
