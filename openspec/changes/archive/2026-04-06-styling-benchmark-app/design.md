## Context

The project is an Expo SDK 54 app using **Expo Router**, **React 19**, **React Native 0.81**, and **Uniwind** (Tailwind-style `className`) already wired in `package.json` and sample UI. There is no existing product spec library under `openspec/specs/` yet. The goal is to add a third styling path (**`react-native-unistyles` v3**) and build two comparable benchmark screens so we can measure and feel performance differences between **core `StyleSheet`**, **Unistyles**, and **Uniwind** on static vs high-update lists.

## Goals / Non-Goals

**Goals:**

- Provide **two routes**: one **static** list benchmark and one **realtime-updating** list benchmark.
- On **both** screens, expose an identical **radio group** to switch between **RN `StyleSheet`**, **Unistyles v3**, and **Uniwind** without leaving the screen.
- On **both** screens, show a **render time** in **milliseconds** (see measurement decision below) so comparisons are numeric as well as visual.
- Keep row content and layout **visually aligned** across engines (same information density, same rough structure) so comparisons are meaningful.
- Support **realtime data** via a **mock ticker** (always available) and optionally a **public WebSocket** (e.g. crypto quotes) when network is allowed, with clear fallback if the socket fails.
- Keep dependencies and config changes **documented** (Babel/Metro notes if required by Unistyles/Uniwind).

**Non-Goals:**

- Statistical rigor or automated FPS benchmarks in CI (manual observation and devtools are enough for v1).
- Pixel-perfect parity across engines where APIs differ (close enough for fair perf comparison).
- Theming beyond what each engine needs for light/dark if already present (optional polish only).

## Decisions

1. **Navigation**  
   Use **Expo Router** with a **tab bar** or **stack** with two primary screens: `/static-benchmark` and `/realtime-benchmark` (exact paths can follow existing `src/app/` layout). A small index or redirect from `index` helps discovery.

2. **Styling engine selection**  
   Use **React context** (or a tiny module-level store) holding `StylingEngine = 'stylesheet' | 'unistyles' | 'uniwind'`, updated by the radio group. **Persist selection in memory** for the session so switching tabs keeps the last choice. Optional: `AsyncStorage` persistence — only if low effort.

3. **Implementing three engines**  
   Prefer **three small “row” implementations** (or a factory) per screen: one file/section each for `StyleSheet`, Unistyles, and Uniwind, selected by context. This avoids fake abstractions that hide real costs. Shared **pure data** (labels, numbers) lives outside style code.

4. **Lists**  
   Use **`FlatList`** (or `FlashList` only if already a dependency — **not** adding FlashList unless requested). Tune `keyExtractor`, stable keys, and avoid inline render churn where it would distort the benchmark.

5. **Static screen**  
   **~50–200 rows** of static strings/numbers with **varied styles** (font weight, color bands, padding) per row type to stress style diversity.

6. **Realtime screen**  
   **Default**: **mock** prices updating on an interval (e.g. 100–500 ms configurable) with deterministic-ish random walk. **Optional**: connect to a **public** WebSocket (document one known URL; handle connect errors and show “mock mode” badge). Use **memoized row components** appropriate to each engine.

7. **Unistyles v3 integration**  
   Follow official setup: install `react-native-unistyles`, configure **Babel** plugin per docs for Expo, and ensure **one** root theme registration if required by v3. If a conflict appears with Uniwind’s Babel pipeline, **document the resolution order** (order of plugins) as a risk mitigated in implementation.

8. **Uniwind**  
   Continue using **`className`** on RN primitives where that is the supported pattern; do not mix engines in the same leaf component.

9. **Render time readout**  
   Show a small, always-visible label (e.g. “Last render: X ms”) on **both** benchmark screens. **Measure** elapsed time for the work that corresponds to “one meaningful paint” after a triggering event:
   - **Static screen**: Record duration from **styling engine change** (or initial mount) until after the list subtree has committed—e.g. start `performance.now()` when the engine value changes, end in `useLayoutEffect` after children run, or after **two** `requestAnimationFrame` callbacks (whichever matches device behavior best in implementation), optionally confirmed with the list container `onLayout` for the pass triggered by that change.
   - **Realtime screen**: On each **data tick** (and on **engine change**), record the same style of duration for the update that applies new prices to the list. Display the **last** measured value (optional: rolling average or min/max in dev—non-goals unless trivial).
   - **Caveat**: This is an **app-level approximation**, not a substitute for native profiling; document that in UI copy or README.

## Risks / Trade-offs

- **[Risk] Babel plugin ordering** between Uniwind and Unistyles could break one path → **Mitigation**: follow both projects’ Expo notes; isolate changes; verify all three engines on iOS/Android/Web if in scope.
- **[Risk] WebSocket flakiness** distracts from styling perf → **Mitigation**: mock mode always on; WS is optional enhancement.
- **[Risk] Render time numbers fluctuate** between devices and builds → **Mitigation**: label as “last render (approx.)”; compare engines on the same device/session.
- **[Risk] Apple/Android perf differs** → **Mitigation**: treat results as directional; test on target devices.
- **Trade-off**: Triplicated row UI is more code than a single abstraction — **acceptable** for an honest benchmark.

## Migration Plan

- **Deploy**: Standard app update; no backend. Users pull branch and `npm install`.
- **Rollback**: Revert dependency and Babel changes; remove new routes. No data migration.

## Open Questions

- Whether **web** is a first-class target for this benchmark (Uniwind/Unistyles behavior can differ) — default to **native-first**, web best-effort.
- Exact **row count** and **update interval** can be tuned after first run on a real device.
