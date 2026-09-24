# React Native styling benchmark

This app renders the same lists with three styling engines so you can compare them on one device.

<p align="center">
  <a href="#latest-report">Latest report</a> · <a href="#benchmarks">Benchmarks</a> · <a href="#quick-start">Quick start</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.85.3-blue?logo=react" alt="React Native 0.85.3" />
  <img src="https://img.shields.io/badge/Expo%20SDK-56-black?logo=expo" alt="Expo SDK 56" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript" alt="TypeScript 6.0" />
  <img src="https://img.shields.io/badge/iOS%20and%20Android-Supported-green" alt="iOS and Android" />
</p>

## Why this exists

A styling API and a long updating list answer different questions. This app runs one UI through React Native `StyleSheet`, [react-native-unistyles](https://www.unistyl.es/) v3, and [Uniwind](https://uniwind.dev/). You switch engines with the radio group on each screen. The screen shows render time for that session. Four screens also show frames per second and frame drops while stress mode is on.

| Engine | Approach |
| --- | --- |
| React Native `StyleSheet` | Built-in styles. No extra dependency. |
| [react-native-unistyles](https://www.unistyl.es/) v3 | Build-time stylesheets with theme and breakpoint support. The runtime is C++. |
| [Uniwind](https://uniwind.dev/) | Tailwind-style `className` on native views. Metro processes `src/global.css`. |

## Latest report

Collected on 2026-09-24. This environment ran the headless JavaScript microbench. It collected no on-device frame rate.

### JS style microbench

`scripts/microbench-styles.ts` times the user-states shape. Each update rebuilds flags for 100 rows and resolves styles for those rows. One process runs 100 warm-up calls, then 1000 timed updates. The clock covers JavaScript only. Native layout, Yoga, and paint stay outside the number. The Unistyles path builds a plain object. The Uniwind path joins `className` strings. Both paths are the functions in that script.

Five separate Bun 1.2.5 processes produced the means below. The host was Linux 6.12.94+ on 4 vCPU (Intel Xeon). `totalMs` is the time for 1000 updates. Microseconds per update equal that total, because the script divides milliseconds by 1000 and then multiplies by 1000.

| Script path | Mean total | Range across 5 runs | Per update (mean) |
| --- | --- | --- | --- |
| StyleSheet array compose | 11.66 ms | 10.42 ms to 12.73 ms | 11.66 µs |
| Unistyles-like object merge | 15.36 ms | 12.09 ms to 24.16 ms | 15.36 µs |
| Uniwind `className` string join | 29.44 ms | 24.86 ms to 42.81 ms | 29.44 µs |

Run 1 is the high end for the object merge (24.16 ms) and the string join (42.81 ms). StyleSheet peaks on run 2 (12.73 ms). These five processes started within a second of each other on a freshly booted VM, so the mean includes that first-process cost. The medians are 11.63 ms, 13.44 ms, and 26.60 ms.

```bash
bun scripts/microbench-styles.ts
```

### On-device frame rate

This run collected none. The machine has no `adb` binary, no emulator binary, and `ANDROID_HOME` is unset.

`scripts/collect-android-benchmarks.sh` needs a connected device and a release APK. It opens five screens and writes `BENCHMARK_REPORT` JSON lines to a file. The screens are `static-benchmark`, `user-states-benchmark`, `form-validation-benchmark`, `list-item-states-benchmark`, and `skeleton-transition-benchmark`. Each stress screen cycles StyleSheet, then Unistyles, then Uniwind. `realtime-benchmark` and `realtime-flash-benchmark` are not in the script.

The static screen reporter writes `fps` 60 and `dropsPerMinute` 0 as constants. Those two fields are not a measurement.

## Collect on-device frame rate

Install a release build on a device or emulator. Then run the collector.

```bash
MAX_UPDATES=100 ./scripts/collect-android-benchmarks.sh \
  android/app/build/outputs/apk/release/app-release.apk \
  ./benchmark-reports.jsonl
```

One screen uses this deep link shape.

```text
acme://user-states-benchmark?auto=1&maxUpdates=100
```

The same query works for `form-validation-benchmark`, `list-item-states-benchmark`, and `skeleton-transition-benchmark`. Paste frames per second and frame drops from the `stress-complete` lines into the comparison table under [Run a fair comparison](#run-a-fair-comparison). Do not treat `lastMs` on an auto run as a stress render. Auto mode does not call `markStart`.

## Benchmarks

Each screen renders StyleSheet, Unistyles, and Uniwind. The radio group switches the engine.

| Screen | What it renders | Updates |
| --- | --- | --- |
| Static list | 96 rows of static styles | None. Switching engines re-renders the list. |
| Realtime data | 40 rows of prices | Mock feed every 280 ms. Row 1 can show a Binance BTC price. |
| Realtime flash | The same 40-row feed, plus a green or red flash when a price moves | Mock feed every 280 ms. |
| User states | 100 profiles with premium, verified, muted, notification, and new flags | 20% of rows every 200 ms. Stops after 100 updates. |
| Form validation | 50 fields with error, warning, success, disabled, focused, and filled | Every field every 150 ms. Stops after 100 updates. |
| List item states | 200 items with selected, disabled, unread, highlighted, loading, and new | 10% of rows every 100 ms. Stops after 100 updates. |
| Skeleton transition | 100 rows. Skeleton height is 60 px. Content height is 40 px through 99 px. | 25% of rows every 300 ms. Stops after 100 updates. |

## Quick start

```bash
git clone https://github.com/dungsnowaxe/benchmark-rn-styling.git
cd benchmark-rn-styling
bun install
bunx expo start
```

`bun run start` runs `expo start --dev-client`. You need a development build on the device.

For iOS, run `npx expo run:ios`. For Android, run `npx expo run:android`.

`index.ts` loads `react-native-gesture-handler`, then `./src/lib/unistyles`, then `expo-router/entry`. Keep that order. Unistyles configures before the router so iOS does not emit native events before `RCTEventEmitter` is registered.

To build an Android release APK, generate the native project, then assemble it.

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
```

`patches/@react-native%2Fgradle-plugin@0.85.3.patch` sets the foojay resolver plugin to `1.0.0`.

## Stress mode

Four screens have a **Start Stress** toggle. Those screens are user states, form validation, list item states, and skeleton transition. The toggle uses a seeded random sequence, so each engine sees the same updates. `useAutoBench` sets `maxUpdates` to 100 unless the deep link passes another value. The button shows the count out of that limit. The toggle hooks default to 1000 only when a caller omits `maxUpdates`. These screens always pass it.

The static screen has no toggle. Realtime and realtime flash keep the 280 ms timer running while the screen is open.

## Metrics

| Metric | Measurement |
| --- | --- |
| Render time | `useRenderMeasurement` stores `performance.now()` from `markStart`, or from first mount, until the next `useLayoutEffect`. Compare engines in one session. |
| Frames per second | While stress is on, `useFrameRateMonitor` counts `requestAnimationFrame` callbacks and reports the count for the latest 1 second window. |
| Frame drops per minute | A gap longer than 66.6 ms counts as one drop. The hook scales the drops in that 1 second window to a per-minute rate. |
| Update count | Stress progress, shown as the current count out of `maxUpdates` (100 unless the link overrides it). |

Realtime and realtime flash show render time. They do not run `useFrameRateMonitor`.

## Run a fair comparison

1. Install a release build. Debug builds add noise.
2. Compare engines on one device.
3. Let the auto cycle finish, or kill the app before you switch engines by hand.
4. Let stress reach `maxUpdates` (100 by default).

The HUD shows the latest render time, frames per second, and frame drops per minute. It does not show an average stress render. `markStart` runs when you press **Start Stress**. Auto mode turns stress on without that call, so `lastMs` in an auto `BENCHMARK_REPORT` stays the mount time.

Copy this table and fill the cells from the HUD at the end of stress, or from the `stress-complete` log line for frames per second and frame drops. The 2026-09-24 run left every cell empty.

| Benchmark | Metric | StyleSheet | Unistyles | Uniwind |
| --- | --- | --- | --- | --- |
| User states | Last render (ms) |  |  |  |
| User states | Frames per second |  |  |  |
| User states | Frame drops per minute |  |  |  |
| Form validation | Last render (ms) |  |  |  |
| Form validation | Frames per second |  |  |  |
| Form validation | Frame drops per minute |  |  |  |
| List item states | Last render (ms) |  |  |  |
| List item states | Frames per second |  |  |  |
| List item states | Frame drops per minute |  |  |  |
| Skeleton transition | Last render (ms) |  |  |  |
| Skeleton transition | Frames per second |  |  |  |
| Skeleton transition | Frame drops per minute |  |  |  |

## Live data

The realtime screens call `useBinanceBtcTicker` at `wss://stream.binance.com:9443/ws/btcusdt@ticker`. If the socket fails, the rows stay on the mock feed. Binance is a third party. Follow their terms.

## Tech stack

Versions below are the entries in `bun.lock`.

| Package | Version |
| --- | --- |
| [Expo SDK](https://docs.expo.dev/) | 56.0.20 |
| [expo-router](https://docs.expo.dev/router/introduction/) | 56.2.19 |
| [React](https://react.dev/) | 19.2.3 |
| [React Native](https://reactnative.dev/) | 0.85.3 |
| [react-native-unistyles](https://www.unistyl.es/) | 3.2.5 |
| [Uniwind](https://uniwind.dev/) | 1.10.0 |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) | 4.3.1 |
| [react-native-worklets](https://docs.swmansion.com/react-native-worklets/) | 0.8.3 |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 |

The package manager is Bun 1.2.5 (`package.json` field `packageManager`, and `eas.json` field `build.base.bun`). EAS builds use Node 24.14.1.

`babel.config.js` enables `react-native-unistyles/plugin` with `root` set to `src`. `metro.config.js` wraps the Expo config with `withUniwindConfig` and sets `cssEntryFile` to `./src/global.css`.

## Earlier report (2026-08-25)

The previous README recorded native build checks from the Expo SDK 56 upgrade. This update did not repeat them. It recorded a passing Android and iOS `expo export`, a passing `expo prebuild` on both platforms, a passing Android `assembleRelease`, and no iOS native build on that Linux VM. It also recorded one pre-existing lint warning.

That page said `expo-doctor` warns about a Hermes V1 memory regression when `react-native-reanimated` and `react-native-worklets` are installed, with an upstream fix in Expo SDK 57 (`expo` 57.0.9 or newer). This app stays on SDK 56. This update did not re-run `expo-doctor`.

## Contributing

Pull requests are welcome. A new benchmark screen, a filled comparison table from a device, or a fix for a wrong measurement are all useful.

## License

MIT
