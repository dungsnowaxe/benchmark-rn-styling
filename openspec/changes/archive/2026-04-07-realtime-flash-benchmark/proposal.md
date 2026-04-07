## Why

The existing realtime benchmark compares styling engines on high-churn lists, but it does not stress **directional, per-field visual feedback**—a common trading-style pattern where only the updated number briefly highlights green (up) or red (down). Adding a sibling screen that clones the realtime setup but flashes **only the changing value’s text background** makes the comparison fairer for apps that animate cell fragments, and documents contrast expectations for light and dark modes.

## What Changes

- Add a **new route** (cloned from the realtime list benchmark) that uses the same data hooks, engine radio, and render-time readout.
- Implement **directional flash**: when a numeric field’s value increases vs its previous value, the **background behind that field’s text only** flashes green; when it decreases, flashes red. No flash on first paint or when the value is unchanged.
- Implement the flash for **price** and **change percentage** independently (symbol is static).
- Provide **accessible contrast**: flash backgrounds and text colors SHALL remain readable against the app background in **light and dark** appearance.
- Add **navigation** from the app shell to this new screen.
- **Session styling selection** SHALL apply consistently when visiting this screen alongside the other benchmarks (same behavior as existing screens).

## Capabilities

### New Capabilities

- `realtime-flash-benchmark`: Third benchmark screen mirroring realtime list behavior plus per-field directional background flash on changing numeric text (StyleSheet, Unistyles v3, Uniwind implementations).

### Modified Capabilities

- `styling-benchmark-shell`: Shell navigation and cross-screen styling selection SHALL include the new realtime flash benchmark (third destination; selection persists across static, realtime, and realtime-flash screens).

## Impact

- **Code**: New route under `src/app/`, new row variants or modules for flash behavior per engine, optional small hook for previous-value comparison and timed flash state; home screen link.
- **Dependencies**: None expected beyond existing React Native / Expo / Unistyles / Uniwind stack; optional use of `Animated` if chosen in design.
- **Benchmark interpretation**: Render timings on this screen include flash-driven updates; comparisons to the plain realtime screen should note the extra visual work.
