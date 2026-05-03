# benchmark-styling

This repo exists to **compare real-world performance** of three styling approaches that are among the strongest options today for React Native:

1. **React Native `StyleSheet`** — core, zero extra styling libs  
2. **`react-native-unistyles` v3** — build-time StyleSheets, theme/runtime aware, C++-backed path  
3. **Uniwind** — Tailwind-style `className` on native, Metro-processed CSS  

The goal is to see how they behave under **your** constraints, not abstract micro-benchmarks:

| Scenario | What it stresses | Status in this app |
|----------|------------------|-------------------|
| **Long list** | Many rows, varied static styles, scroll + re-renders when switching engines | **Implemented** — *Static list benchmark* |
| **List with realtime data** | Frequent updates (prices/fields), list churn, re-renders | **Implemented** — *Realtime list benchmark* |
| **Realtime + directional flash** | Same data path as realtime, plus a **green/red background flash** when price or change % moves up/down; the tint **fades in and out** via React Native `Animated` **on the background layer only** (numeric text stays fully opaque for readability) | **Implemented** — *Realtime flash benchmark* |
| **User states** | Multiple boolean flag combinations (premium, verified, muted, notification, new) affecting borders, colors, badges, icons | **Implemented** — *User states benchmark* |
| **Form validation** | Form field state combinations (error, warning, success, disabled, focused, filled) changing borders, background colors, helper text, icons | **Implemented** — *Form validation benchmark* |
| **List item states** | Row-level state permutations (selected, disabled, unread, highlighted, loading, new) with badges, overlays, opacity changes | **Implemented** — *List item states benchmark* |
| **Skeleton → content** | Layout dimension changes during transitions from fixed-height skeleton to variable-height content (40-100px) | **Implemented** — *Skeleton transition benchmark* |

On each benchmark screen, a **radio group** switches the active engine so you compare apples-to-apples on the same device. **Last render (approx.)** is a rough JS-side timing (same session/device only; not a substitute for Instruments or Release builds).

---

## Data: mock vs live socket

- **Default:** rows are driven by a **mock ticker** (interval-based random walk). No network required; works offline.
- **Optional live data:** the **realtime** and **realtime flash** screens can open a **public WebSocket** from **Binance**:
  - URL: `wss://stream.binance.com:9443/ws/btcusdt@ticker`
  - Stream: combined **24h ticker** for **BTCUSDT**; the **last price** (`c` in the payload) can override the first row when the connection is alive.
  - If the socket fails or is unavailable, the UI falls back to **mock data only** (see the status line on each realtime screen).

Binance is a third-party public API; use their terms and rate limits if you extend this.

---

## Tech stack (versions)

| Package | Version (manifest / lock) |
|--------|---------------------------|
| [Expo SDK](https://docs.expo.dev/) | `~54.0.22` (resolved e.g. `54.0.33` in `bun.lock`) |
| [expo-router](https://docs.expo.dev/router/introduction/) | `~6.0.23` |
| [expo-status-bar](https://docs.expo.dev/versions/latest/sdk/status-bar/) | `~3.0.8` |
| [React](https://react.dev/) | `19.1.0` |
| [React Native](https://reactnative.dev/) | `0.81.5` |
| [react-native-unistyles](https://www.unistyl.es/) | `^3.2.2` (resolved `3.2.2`) |
| [Uniwind](https://uniwind.dev/) | `~1.0.0` (resolved e.g. `1.0.5`) |
| [Tailwind CSS](https://tailwindcss.com/) | `~4.1.16` (Uniwind pulls compatible Tailwind bits) |
| [TypeScript](https://www.typescriptlang.org/) | `~5.9.2` (dev) |

Package manager: **Bun** (`bun.lock`). You can use `npm`/`yarn` if you prefer; align lockfiles accordingly.

---

## Run

```bash
bun install
bunx expo start
```

Entry point is **`index.ts`**: it loads `@expo/metro-runtime` first, then Unistyles `StyleSheet.configure`, then the Expo Router root. That order avoids some native bridge timing issues with `RCTEventEmitter` on iOS.

If you toggle **New Architecture** in Expo config, run `npx expo prebuild --clean` before rebuilding native projects.

---

## Config notes

- **`babel.config.js`** — `react-native-unistyles/plugin` with `root: 'src'`.
- **`metro.config.js`** — Uniwind (`withUniwindConfig`, `src/global.css`).

---

## Known issues

### iOS native build failing (not fixed)

**Building and running on iOS from this repo is currently broken or unreliable; this has not been resolved in-tree.** Do not assume `npx expo run:ios` or an Xcode archive will succeed until you investigate and fix native project / dependency / toolchain issues locally.

If you fix iOS, please update this section and consider contributing notes or a short “what we changed” for others.

---

## What to watch when benchmarking

- Scroll jank and frame drops when switching engines or on realtime ticks (including the flash screen, which adds per-field background animation work).
- **Mock interval** for realtime rows is ~280 ms (adjust in code if you need slower/faster churn).
- Compare engines on the **same device**, **same build type** (prefer **Release** for realistic numbers).

---

## Stress Mode

All benchmark screens include a **stress mode** toggle that simulates aggressive state changes:

- **User states**: Toggles flags on 20% of rows every 200ms
- **Form validation**: Cycles validation states on all fields every 150ms
- **List item states**: Changes states on 10% of rows every 100ms
- **Skeleton transition**: Cycles skeleton → content → skeleton on 25% of rows every 300ms

Stress mode uses **deterministic (seeded) random** for consistent testing across engines. Each stress mode auto-disables after 1000 updates to prevent runaway loops. Monitor frame drops and render times during stress mode to see how each engine handles rapid changes.

---

## Metrics Display

Each benchmark screen displays:

- **Last render time**: Approximate JS-side render time (same device/session only)
- **FPS**: Current frames per second (measured via `requestAnimationFrame`)
- **Frame drops**: Drops per minute (more than 2 frames at 60fps = ~33.3ms gap)
- **Update count**: Number of stress mode updates applied (x/1000)

For accurate comparisons, always:
1. Use the same device
2. Use Release builds (Debug has too much noise)
3. Kill and relaunch app between engine tests
4. Run each benchmark for the full stress cycle when comparing

### Quick comparison template

| Benchmark | Metric | StyleSheet | Unistyles | Uniwind |
|-----------|--------|------------|-----------|---------|
| User States | Initial render (ms) |  |  |  |
| User States | Avg stress render (ms) |  |  |  |
| User States | Frame drops/min |  |  |  |
| Form Validation | Initial render (ms) |  |  |  |
| Form Validation | Avg stress render (ms) |  |  |  |
| Form Validation | Frame drops/min |  |  |  |
| List Item States | Initial render (ms) |  |  |  |
| List Item States | Avg stress render (ms) |  |  |  |
| List Item States | Frame drops/min |  |  |  |
| Skeleton Transition | Initial render (ms) |  |  |  |
| Skeleton Transition | Avg stress render (ms) |  |  |  |
| Skeleton Transition | Frame drops/min |  |  |  |

Fill in your measurements from physical device testing (Release builds only).
