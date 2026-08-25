<h1 align="center">React Native Styling Benchmark</h1>

<p align="center">
  <strong>Side-by-side performance comparison of React Native StyleSheet vs react-native-unistyles vs Uniwind (NativeWind alternative)</strong>
</p>

<p align="center">
  <a href="#latest-report-sdk-56">Latest Report</a> · <a href="#benchmarks">7 Benchmarks</a> · <a href="#stress-mode">Stress Testing</a> · <a href="#quick-start">Quick Start</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.85.3-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo%20SDK-56-black?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/iOS%20%26%20Android-Supported-green" alt="Platforms" />
</p>

---

## Why this exists

Choosing a styling library for React Native is hard. Blog posts compare APIs, but few show **actual render performance** under realistic conditions — long lists, rapid state updates, animated transitions, conditional styles.

This app runs the **same UI** through three styling engines on the **same device** and lets you compare:

| Engine                                                   | Approach                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **React Native `StyleSheet`**                            | Built-in, zero dependencies. The baseline.                                           |
| **[react-native-unistyles](https://www.unistyl.es/) v3** | Build-time StyleSheets with theme & breakpoint awareness, C++ backed.                |
| **[Uniwind](https://uniwind.dev/)**                      | Tailwind-style `className` on native, Metro-processed CSS. A NativeWind alternative. |

Switch engines with a radio group on each screen. Render times, FPS, and frame drops update live.

---

## Latest Report (SDK 56)

_Collected 2026-08-25 during the Expo SDK 56 upgrade. On-device FPS still needs a physical device or a working emulator; nested-virt Android emulators in CI did not finish booting._

### Build matrix

| Check                            | Android                              | iOS                                |
| -------------------------------- | ------------------------------------ | ---------------------------------- |
| Hermes JS export (`expo export`) | Pass (4.2 MB `.hbc`)                 | Pass (4.0 MB `.hbc`)               |
| Native project (`expo prebuild`) | Pass                                 | Pass                               |
| Release native build             | Pass (`assembleRelease` APK ~100 MB) | Not run here (Linux VM / no Xcode) |
| Lint (`bun run lint`)            | Pass (1 pre-existing warning)        | —                                  |

### Stack under test

| Package                            | Version       |
| ---------------------------------- | ------------- |
| Expo SDK                           | 56.0.20       |
| React Native                       | 0.85.3        |
| React                              | 19.2.3        |
| expo-router                        | 56.2.19       |
| react-native-unistyles             | 3.2.5         |
| Uniwind                            | 1.10.0        |
| react-native-reanimated / worklets | 4.3.1 / 0.8.3 |
| TypeScript                         | 6.0.3         |

Notes:

- Expo Go is **not** on the App Store / Play Store for SDK 56 — use a development or release build.
- `expo-doctor` warns about a known **Hermes V1 memory regression** when `react-native-reanimated` / `react-native-worklets` are present. Upstream fix is Expo SDK 57 (`expo@≥57.0.9`). This app stays on SDK 56 as requested.
- Android Gradle 9 + JDK-less hosts need the bundled patch bumping `foojay-resolver-convention` to `1.0.0` (see `patches/`).

### JS style microbench (headless)

Approximates JS work for the **user-states** shape (100 rows recomputed × 1000 stress updates). Does **not** include native layout, Yoga, or paint.

| Engine path                        | Total (avg of 5) | Per update |
| ---------------------------------- | ---------------- | ---------- |
| StyleSheet resolve (array compose) | 9.03 ms          | 9.03 µs    |
| Unistyles-like object merge        | 10.25 ms         | 10.25 µs   |
| Uniwind `className` string join    | 19.75 ms         | 19.75 µs   |

```bash
bun scripts/microbench-styles.ts
```

### On-device FPS (release)

Use a release APK/IPA and the auto-bench deep links (cycles StyleSheet → Unistyles → Uniwind):

```bash
# After installing a release build on a device/emulator:
MAX_UPDATES=100 ./scripts/collect-android-benchmarks.sh \
  android/app/build/outputs/apk/release/app-release.apk \
  ./benchmark-reports.jsonl
```

Deep link shape: `acme://user-states-benchmark?auto=1&maxUpdates=100` (also works for `form-validation`, `list-item-states`, `skeleton-transition`). Metrics are emitted as `BENCHMARK_REPORT …` lines on the JS console / logcat.

Fill the comparison table below from that JSONL (or from the on-screen HUD).

---

## Benchmarks

| #   | Benchmark              | What it tests                                                                                                      | Stress mode             |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| 1   | **Static list**        | 96 rows, varied static styles, scroll + re-renders on engine switch                                                | —                       |
| 2   | **Realtime data**      | Frequent row updates (prices), list churn, re-renders                                                              | ~280ms mock interval    |
| 3   | **Realtime + flash**   | Same as realtime + animated green/red background flash per field on price change                                   | ~280ms mock interval    |
| 4   | **User states**        | 100 profiles × 5 boolean flags (premium, verified, muted, notification, new) → conditional borders, colors, badges | 20% of rows every 200ms |
| 5   | **Form validation**    | 50 fields × 6 states (error, warning, success, disabled, focused, filled) → conditional input styles, helper text  | All fields every 150ms  |
| 6   | **List item states**   | 200 items × 6 flags (selected, disabled, unread, highlighted, loading, new) → checkboxes, badges, opacity overlays | 10% of rows every 100ms |
| 7   | **Skeleton → content** | 100 rows transitioning between fixed-height skeleton (60px) and variable-height content (40–100px)                 | 25% of rows every 300ms |

Each benchmark renders 3 engine variants (StyleSheet / Unistyles / Uniwind) so you can switch live and see the difference.

---

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/benchmark-styling.git
cd benchmark-styling

# Install
bun install

# Run
bunx expo start
```

**iOS:** `npx expo run:ios`  
**Android:** `npx expo run:android`

> SDK 56 requires a **development build** (Expo Go is not on the stores). Entry order: gesture-handler → Unistyles configure → Expo Router.
> Android release: `cd android && ./gradlew assembleRelease` after `npx expo prebuild -p android` (needs JDK 17).

---

## Stress Mode

Every benchmark screen has a **stress mode** toggle that hammers state changes:

- Deterministic **seeded random** — same sequence every run for fair cross-engine comparison
- Configurable update intervals (100ms–300ms depending on benchmark)
- **Auto-stops after 1000 updates** to prevent runaway loops
- Monitor FPS drops and render time in real-time

---

## Metrics Display

Each screen shows live metrics:

| Metric              | How it's measured                                                            |
| ------------------- | ---------------------------------------------------------------------------- |
| **Render time**     | JS-side timing from engine switch to commit (approximate, same session only) |
| **FPS**             | `requestAnimationFrame` frame counting per second                            |
| **Frame drops/min** | Gaps > 2 frames at 60fps (~33ms) counted over 1-second windows               |
| **Update count**    | Stress mode progress (x/1000)                                                |

### Tips for accurate results

1. **Use Release builds** — Debug builds add significant noise
2. **Same device** — Only compare engines on the same hardware
3. **Kill & relaunch** between engine tests — no warm-cache advantage
4. **Run full stress cycle** — 1000 updates gives stable averages

### Comparison template

Copy this table and fill in your own measurements:

| Benchmark           | Metric                 | StyleSheet | Unistyles | Uniwind |
| ------------------- | ---------------------- | ---------- | --------- | ------- |
| User States         | Initial render (ms)    |            |           |         |
| User States         | Avg stress render (ms) |            |           |         |
| User States         | Frame drops/min        |            |           |         |
| Form Validation     | Initial render (ms)    |            |           |         |
| Form Validation     | Avg stress render (ms) |            |           |         |
| Form Validation     | Frame drops/min        |            |           |         |
| List Item States    | Initial render (ms)    |            |           |         |
| List Item States    | Avg stress render (ms) |            |           |         |
| List Item States    | Frame drops/min        |            |           |         |
| Skeleton Transition | Initial render (ms)    |            |           |         |
| Skeleton Transition | Avg stress render (ms) |            |           |         |
| Skeleton Transition | Frame drops/min        |            |           |         |

---

## Live data (optional)

The **realtime** and **realtime flash** screens can connect to a public Binance WebSocket for live BTCUSDT ticker data instead of mock data:

- URL: `wss://stream.binance.com:9443/ws/btcusdt@ticker`
- Falls back to mock data if the connection fails
- Binance is a third-party API; respect their terms and rate limits

---

## Tech Stack

| Package                                                   | Version |
| --------------------------------------------------------- | ------- |
| [Expo SDK](https://docs.expo.dev/)                        | 56.0.20 |
| [expo-router](https://docs.expo.dev/router/introduction/) | 56.2.19 |
| [React](https://react.dev/)                               | 19.2.3  |
| [React Native](https://reactnative.dev/)                  | 0.85.3  |
| [react-native-unistyles](https://www.unistyl.es/)         | 3.2.5   |
| [Uniwind](https://uniwind.dev/)                           | 1.10.0  |
| [TypeScript](https://www.typescriptlang.org/)             | ~6.0.3  |

Package manager: **Bun** (`bun.lock`). Works with `npm`/`yarn` too.

### Config notes

- **`babel.config.js`** — `react-native-unistyles/plugin` with `root: 'src'` (Reanimated/Worklets plugins come from `babel-preset-expo` when those packages are installed)
- **`metro.config.js`** — Uniwind (`withUniwindConfig`, `src/global.css`)
- **`index.ts`** — `react-native-gesture-handler` → Unistyles configure → `expo-router/entry` (Unistyles before router avoids `RCTEventEmitter` timing issues on iOS)
- **`patches/`** — `@react-native/gradle-plugin` foojay resolver `1.0.0` for Gradle 9 Android builds

---

## Contributing

PRs welcome! Especially:

- **New benchmark scenarios** — animation-heavy, theme switching, dark/light mode transitions
- **Android-specific results** — share your device measurements
- **Bug fixes** — if something looks wrong on your device, open an issue

---

## License

MIT
