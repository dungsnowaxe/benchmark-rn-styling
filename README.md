# React Native styling benchmark

This app renders the same lists with three styling engines so you can compare them on one device. One screen holds styling fixed and compares two animation libraries instead.

<p align="center">
  <a href="#latest-report">Latest report</a> · <a href="#benchmarks">Benchmarks</a> · <a href="#animation-engine-benchmark">Animation engine</a> · <a href="#quick-start">Quick start</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.86.3-blue?logo=react" alt="React Native 0.86.3" />
  <img src="https://img.shields.io/badge/Expo%20SDK-57-black?logo=expo" alt="Expo SDK 57" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript" alt="TypeScript 6.0" />
  <img src="https://img.shields.io/badge/iOS%20and%20Android-Supported-green" alt="iOS and Android" />
</p>

## Why this exists

A styling API and a long updating list answer different questions. This app runs one UI through React Native `StyleSheet`, [react-native-unistyles](https://www.unistyl.es/) v3, and [Uniwind](https://uniwind.dev/). You switch engines with the radio group on each screen. The screen shows render time for that session. Four screens also show frames per second and frame drops while stress mode is on.

The animation engine screen is a separate comparison. It keeps `StyleSheet` and switches the flash implementation between [react-native-ease](https://github.com/AppAndFlow/react-native-ease) and [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/).

| Engine | Approach |
| --- | --- |
| React Native `StyleSheet` | Built-in styles. No extra dependency. |
| [react-native-unistyles](https://www.unistyl.es/) v3 | Build-time stylesheets with theme and breakpoint support. The runtime is C++. |
| [Uniwind](https://uniwind.dev/) | Tailwind-style `className` on native views. Metro processes `src/global.css`. |

## Latest report

Two different measurements are recorded below. They are not the same run.

### JS style microbench

Collected on 2026-09-24 with Bun 1.2.5, before the Expo SDK 57 upgrade. `scripts/microbench-styles.ts` on current `main` differs from that run by one line, the removal of `/// <reference types="node" />`. The timed functions are the same.

The script times the user-states shape. Each update rebuilds flags for 100 rows and resolves styles for those rows. One process runs 100 warm-up calls, then 1000 timed updates. The clock covers JavaScript only. Native layout, Yoga, and paint stay outside the number. The Unistyles path builds a plain object. The Uniwind path joins `className` strings. Both paths are the functions in that script.

Five separate processes produced the means below. The host was Linux 6.12.94+ on 4 vCPU (Intel Xeon). `totalMs` is the time for 1000 updates. Microseconds per update equal that total, because the script divides milliseconds by 1000 and then multiplies by 1000.

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

The 2026-09-24 run collected no styling-engine frame rate. That machine had no `adb` binary, no emulator binary, and `ANDROID_HOME` was unset.

`scripts/collect-android-benchmarks.sh` needs a connected device and a release APK. It opens five screens and writes `BENCHMARK_REPORT` JSON lines to a file. The screens are `static-benchmark`, `user-states-benchmark`, `form-validation-benchmark`, `list-item-states-benchmark`, and `skeleton-transition-benchmark`. Each stress screen cycles StyleSheet, then Unistyles, then Uniwind. `realtime-benchmark`, `realtime-flash-benchmark`, and `animation-engine-benchmark` are not in the script.

The static screen reporter writes `fps` 60 and `dropsPerMinute` 0 as constants. Those two fields are not a measurement.

The animation engine numbers later in this file come from a separate iPhone 17 simulator Release run recorded on `main`. This README keeps those figures. It does not re-measure them.

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

The same query works for `form-validation-benchmark`, `list-item-states-benchmark`, and `skeleton-transition-benchmark`. Paste frames per second and frame drops from the `stress-complete` lines into the comparison table under [Run a fair comparison](#run-a-fair-comparison). Do not treat `lastMs` on an auto run as a stress render. Auto mode calls `setEngine` inside `useAutoBench` and does not call `markStart`. `markStart` runs from the stress toggle and from the radio group.

## Benchmarks

Screens 1 to 7 render StyleSheet, Unistyles, and Uniwind. The radio group switches the engine. Screen 8 holds `StyleSheet` and switches the animation backend.

| Screen | What it renders | Updates |
| --- | --- | --- |
| Static list | 96 rows of static styles | None. Switching engines re-renders the list. |
| Realtime data | 40 rows of prices | Mock feed every 280 ms. Row 1 can show a Binance BTC price. |
| Realtime flash | The same 40-row feed, plus a green or red flash when a price moves | Mock feed every 280 ms. |
| User states | 100 profiles with premium, verified, muted, notification, and new flags | 20% of rows every 200 ms. Stops after 100 updates. |
| Form validation | 50 fields with error, warning, success, disabled, focused, and filled | Every field every 150 ms. Stops after 100 updates. |
| List item states | 200 items with selected, disabled, unread, highlighted, loading, and new | 10% of rows every 100 ms. Stops after 100 updates. |
| Skeleton transition | 100 rows. Skeleton height is 60 px. Content height is 40 px through 99 px. | 25% of rows every 300 ms. Stops after 100 updates. |
| Animation engine | The realtime flash, with `react-native-ease` or Reanimated | Mock feed every 280 ms. Stress stops after 300 ticks. Row count is 20, 60, or 150. |

## Animation engine benchmark

This screen compares [react-native-ease](https://github.com/AppAndFlow/react-native-ease) with [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) on the same realtime flash UI. Every row's price and change percent flash green or red when the value moves.

| | react-native-ease | react-native-reanimated |
| --- | --- | --- |
| Model | Declarative target values on a native `EaseView` | Shared values and worklets |
| Runs on | Core Animation on iOS. `ObjectAnimator` and `ValueAnimator` on Android. | UI thread via worklets |
| JS cost during animation | No animation loop | Worklet dispatch per property change |
| Text colour | Not supported | `interpolateColor` on `Animated.Text` |

### What the flash needs

Both libraries can flash the background. `backgroundColor` is a key of Ease's `AnimateProps`, so the Ease arm sets the target colour and the native view animates to it. Reanimated interpolates the colour from a shared value.

Only Reanimated can flash text colour. react-native-ease 0.8.0 exports one component, `EaseView`. There is no `EaseText`, and `AnimateProps` has no `color` key.

The Ease arm is a hybrid. `EaseView` owns the background. Text colour still runs on Reanimated's `interpolateColor`. A pure-Ease opacity crossfade of two stacked `Text` layers was rejected. It adds a native view and a text layout per flashing field, and it is still not a colour transition.

Ease cannot own this effect end to end. A price flash that recolours text needs a second library. The Ease arm pays for a shared value and a native view transition per field.

On Android, Ease animates `backgroundColor` with `ValueAnimator.ofArgb()`, which is timing only. A `spring` transition on a colour falls back to timing at 300 ms. Both arms use `timing`, with the cubic bezier `[0, 0, 0.58, 1]` (Ease's `easeOut` preset), so the pulse shape matches on iOS and Android.

### Keeping the comparison honest

Both arms render one shared row body, `LiveRowAnimInner`. They share the palette, the `StyleSheet`, and `useFieldDirectionFlashes`.

Both arms use the same `useFlashPhase` pulse. The phases are `idle`, then `in`, then `out`, then `idle`, with 75 ms in and 280 ms out. React work and timings match. Only the component that turns `phase` into pixels differs.

Stress mode drops `FlatList` virtualization so every row is mounted and animating. That is the axis react-native-ease's own benchmark varies, at 10, 100, and 500 views.

### Requirements

`react-native-ease` is a native Fabric component (codegen spec `EaseViewSpec`). A JS reload is not enough. It needs a development or release build, React Native 0.76 or newer with the new architecture, iOS 15.1 or newer, and Android `minSdk` 24.

```bash
npx expo prebuild
npx expo run:ios
```

Use `npx expo run:android` for Android.

### Release build on the iOS simulator

Debug builds make these numbers meaningless. JavaScript is unoptimised, and Reanimated worklets run uncompiled.

```bash
npx expo run:ios --configuration Release --device "<simulator UDID>"
```

`expo run:ios` then opens the app with an `expo-development-client://` link. That screen says a development server is required, even when the Release build has `main.jsbundle` embedded. Launch the app directly instead.

```bash
xcrun simctl launch <UDID> com.dzungsnowaxe.benchmarkstyling
```

The amber "Debug build" line under the FPS readout is gated on `__DEV__`. If that line is absent, the optimised bundle is running. Stop Metro. It is not used.

Scrape the metrics on iOS.

```bash
xcrun simctl spawn <UDID> log stream --level debug --style compact \
  --predicate 'eventMessage CONTAINS "BENCHMARK_REPORT"' > reports.txt
```

Do not truncate `reports.txt` while `log stream` holds the file. The stream keeps its write offset, and a truncated file stays empty. Restart the stream into a new file.

On Android, run `npx expo run:android --variant release`, then `adb logcat -s ReactNativeJS`.

### First Release numbers (iPhone 17 simulator)

These figures were recorded on `main` for this screen. 150 rows, stress mode, virtualization off, 300 animated fields, 280 ms feed, steady-state `stress-progress` samples.

| Arm | Average FPS | Minimum FPS | Average render (ms) |
| --- | --- | --- | --- |
| ease (hybrid, `EaseView` background and Reanimated text) | 14.6 | 13 | 88.8 |
| reanimated (shared value and `interpolateColor`) | 2.8 | 2 | 167.2 |

Idle, at 60 rows and with virtualization on, both arms hold about 50 FPS. The gap shows up under load. At 300 fields animating together, the Ease arm holds 5.2 times the frame rate and the render time is 1.9 times lower.

Read the table with these limits.

The run is a simulator, not a phone. Core Animation and the render thread differ on hardware. Treat the gap as relative, and repeat the run on a device before you treat it as a device result.

The Ease arm is a hybrid. It still runs a Reanimated worklet for text colour. A pure Ease measurement of this effect is not available, because Ease cannot colour text.

React reconciliation dominates at this load. Both arms re-render 150 rows every 280 ms. That JavaScript cost is shared, and it is most of what caps the frame rate. The animation backend is the difference between the arms.

Drops per minute are not comparable across arms. The counter is an absolute count of frames slower than about 66 ms. A 15 FPS arm logs more drops than a 3 FPS arm because it produces more frames. Compare FPS and render time.

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

## Stress mode

Four styling screens have a **Start Stress** toggle. Those screens are user states, form validation, list item states, and skeleton transition. The toggle uses a seeded random sequence, so each engine sees the same updates. `useAutoBench` sets `maxUpdates` to 100 unless the deep link passes another value. The button shows the count out of that limit. The toggle hooks default to 1000 only when a caller omits `maxUpdates`. These screens always pass it.

The static screen has no toggle. Realtime and realtime flash keep the 280 ms timer running while the screen is open.

The animation engine screen has its own stress toggle. `MAX_UPDATES` there is 300. Stress mounts every row.

## Metrics

| Metric | Measurement |
| --- | --- |
| Render time | `useRenderMeasurement` stores `performance.now()` from `markStart`, or from first mount, until the next `useLayoutEffect`. Compare engines in one session. |
| Frames per second | While stress is on, `useFrameRateMonitor` counts `requestAnimationFrame` callbacks and reports the count for the latest 1 second window. |
| Frame drops per minute | A gap longer than 66.6 ms counts as one drop. The hook scales the drops in that 1 second window to a per-minute rate. |
| Update count | Stress progress, shown as the current count out of `maxUpdates` (100 on the styling screens unless the link overrides it, 300 on the animation screen). |

Realtime and realtime flash show render time. They do not run `useFrameRateMonitor`.

## Run a fair comparison

1. Install a release build. Debug builds add noise.
2. Compare engines on one device.
3. Let the auto cycle finish, or kill the app before you switch engines by hand.
4. Let stress reach `maxUpdates` (100 by default on the styling screens).

The HUD shows the latest render time, frames per second, and frame drops per minute. It does not show an average stress render. `markStart` runs when you press **Start Stress** and when you change the radio group. Auto mode turns stress on without that call, so `lastMs` in an auto `BENCHMARK_REPORT` stays the mount time.

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

Versions below are the resolved entries in `bun.lock` on this branch after the SDK 57 merge. `main`'s previous README table still listed the SDK 56 pins. Those pins are out of date.

| Package | Version |
| --- | --- |
| [Expo SDK](https://docs.expo.dev/) | 57.0.24 |
| [expo-router](https://docs.expo.dev/router/introduction/) | 57.0.22 |
| [React](https://react.dev/) | 19.2.3 |
| [React Native](https://reactnative.dev/) | 0.86.3 |
| [react-native-unistyles](https://www.unistyl.es/) | 3.3.0 |
| [Uniwind](https://uniwind.dev/) | 1.12.0 |
| [react-native-ease](https://github.com/AppAndFlow/react-native-ease) | 0.8.0 |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) | 4.5.1 |
| [react-native-worklets](https://docs.swmansion.com/react-native-worklets/) | 0.10.1 |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 |

The package manager is Bun 1.2.5 (`package.json` field `packageManager`, and `eas.json` field `build.base.bun`). EAS builds use Node 24.14.1.

`babel.config.js` enables `react-native-unistyles/plugin` with `root` set to `src`. `metro.config.js` wraps the Expo config with `withUniwindConfig` and sets `cssEntryFile` to `./src/global.css`.

## Contributing

Pull requests are welcome. A new benchmark screen, a filled comparison table from a device, or a fix for a wrong measurement are all useful.

## License

MIT
