## Why

Choosing a styling approach for React Native affects bundle size, DX, runtime cost, and how fast lists re-render under load. This repo is a minimal Expo app with Uniwind already; we need a controlled benchmark so we can compare **React Native `StyleSheet`**, **`react-native-unistyles` v3**, and **Uniwind** on the same UI patterns (static lists vs. high-churn realtime rows) before committing to one stack.

## What Changes

- Add **`react-native-unistyles` v3** and wire it for the benchmark (alongside existing RN `StyleSheet` and **Uniwind**).
- Implement **two benchmark screens**: (1) a **static** list of rows with varied styles and labels; (2) a **realtime** list that updates frequently (mocked ticker and/or a public WebSocket for stocks or crypto).
- Add a **radio control** on both screens to switch the active styling engine so timings and perceived performance are comparable without leaving the screen.
- Show a **render time** readout (milliseconds) on **both** benchmark screens so each styling option’s cost is visible for the same interaction patterns.
- Use **Expo Router** for navigation between the two benchmark pages (tabs or stack).
- Document how to run the app and interpret the benchmark (what to watch for: jank, JS thread, list updates).

## Capabilities

### New Capabilities

- `styling-benchmark-shell`: App shell and navigation to both benchmark screens; shared **styling engine selection** (React Native StyleSheet vs Unistyles v3 vs Uniwind) exposed as a radio group on each screen; optional lightweight context/store so the selection persists while navigating.
- `static-list-benchmark`: A screen listing many rows of **static** content (labels/values) with **heterogeneous styles** (typography, spacing, colors) implemented three ways according to the selected engine; includes a **render time** display for the last relevant render (e.g. engine switch or initial mount).
- `realtime-list-benchmark`: A screen listing **frequently updating** rows (mock generator and/or public WebSocket) with the same three styling options, so update churn can be compared across engines; includes a **render time** display updated when the list content re-renders from ticks (and when the styling engine changes).

### Modified Capabilities

- _(None — no existing `openspec/specs/` requirements yet.)_

## Impact

- **Dependencies**: Add `react-native-unistyles` (v3) and ensure compatibility with Expo SDK 54 / RN 0.81; Uniwind and Tailwind already present.
- **Code**: New routes under `src/app/`, shared components for row layouts and the styling switcher, possible Babel/metro tweaks per Unistyles/Uniwind docs.
- **Runtime**: Optional network use if a public WebSocket is used; otherwise mock data keeps the demo offline-friendly.
