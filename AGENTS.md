# AGENTS.md

## Project overview

React Native styling benchmark app comparing three engines side-by-side:

- **StyleSheet** (RN built-in)
- **react-native-unistyles v3**
- **Uniwind** (Tailwind-style `className` on native)

Expo SDK 57, React Native 0.86.3, React 19.2, TypeScript 6.0.

## Setup & commands

```bash
bun install          # package manager is bun (bun.lock)
bunx expo start      # dev server (uses --dev-client)
npx expo run:ios     # iOS
npx expo run:android # Android
```

### Measuring performance requires a Release build

Debug numbers are meaningless for these benchmarks (unoptimised JS, uncompiled Reanimated worklets — the animation screen measured 2–18 FPS in debug vs ~50 idle in release).

```bash
npx expo run:ios --configuration Release --device "<UDID>"
xcrun simctl launch <UDID> com.dzungsnowaxe.benchmarkstyling   # see gotcha below
```

- **`expo run:ios` opens the app through an `expo-development-client://` deep link**, which shows a "Development server is required" screen even though Release embeds `main.jsbundle`. Launch the bundle id plainly (second command) and the optimised bundle runs; Metro is not involved.
- **Release-mode proof**: the amber "Debug build…" banner on `animation-engine-benchmark` is gated on `__DEV__`. Absent ⇒ optimised bundle.
- **iOS log scrape** (no logcat needed): `xcrun simctl spawn <UDID> log stream --level debug --style compact --predicate 'eventMessage CONTAINS "BENCHMARK_REPORT"'`. Never truncate the output file under the live `log stream` fd — it keeps its write offset and captures nothing. Restart the stream into a fresh file.

No test suite or typecheck command configured.

### Linting & formatting

- **Linter**: [oxlint](https://oxc.rs/docs/guide/usage/linter/) — `bun run lint` / `bun run lint:fix`
- **Formatter**: [oxfmt](https://oxc.rs/docs/guide/usage/formatter/) — `bun run format` / `bun run format:check`
- Config files: `.oxlintrc.json`, `.oxfmtrc.json`

## Runtime requirements

- **Node**: >=24.0.0 <25 (`.nvmrc` = 24.14.1)
- **Bun**: 1.2.5 (per `package.json` packageManager and `eas.json`)
- **Xcode**: 26.4+ required for iOS builds

## Critical: entry point import order

`index.ts` loads in this exact order — **do not rearrange**:

1. `@expo/metro-runtime` (implicit via expo-router/entry — handles Fast Refresh / bridge)
2. `./src/lib/unistyles` (configures Unistyles StyleSheet)
3. `expo-router/entry`

Breaking this order causes `RCTEventEmitter` native bridge timing issues on iOS.

## Architecture

```
index.ts                     → entry point (import order matters)
src/
  app/                       → Expo Router file-based routes
    _layout.tsx              → imports global.css, wraps in StylingEngineProvider + AnimationEngineProvider
    index.tsx                → home screen with links to each benchmark
    *-benchmark.tsx          → one file per benchmark screen
  lib/
    unistyles.ts             → Unistyles theme + breakpoint config + StyleSheet.configure
  context/
    styling-engine-context.tsx → radio-group state ("stylesheet" | "unistyles" | "uniwind")
    animation-engine-context.tsx → radio-group state ("ease" | "reanimated")
  benchmark/                 → per-engine row render components for each benchmark
  data/                      → static row data generators
  hooks/                     → stress-mode hooks, FPS monitoring, Binance WS, etc.
  components/                → shared UI (engine-radio-group, animated-flash-pad, etc.)
  global.css                 → @import "tailwindcss"; @import "uniwind";
  uniwind-env.d.ts           → Uniwind type declarations
  uniwind-types.d.ts         → generated Uniwind CSS type declarations (auto-updated by Metro)
```

## Key conventions

- **Filenames are kebab-case** (Expo SDK 55+ default). Exports stay PascalCase / camelCase (`EngineRadioGroup` in `engine-radio-group.tsx`). Enforced by `unicorn/filename-case` in `.oxlintrc.json`. Exceptions: Expo Router `_layout.tsx` / `+*` / `index.*`, and `*.d.ts`.
- **Three styling variants per benchmark**: each benchmark screen renders rows using all three engines, switched by `StylingEngineContext`.
- **Exception — `animation-engine-benchmark`**: varies the _animation_ backend (`AnimationEngineContext`: `ease` | `reanimated`), not the styling engine. Both arms render identical static chrome through RN `StyleSheet` and are driven by the same `useFlashPhase` pulse, so only the animation code differs. Its row file exports two components, not three. Keep it that way — introducing a styling difference between the arms would invalidate the comparison.
- **Benchmark row files** (`src/benchmark/*-row-views.tsx`) export three components — one per engine — for a single benchmark type.
- **Uniwind** uses `className` props (Tailwind classes), configured via `metro.config.js` (`withUniwindConfig`) with `cssEntryFile: "./src/global.css"`.
- **Unistyles** uses Babel plugin (`react-native-unistyles/plugin`, `root: 'src'`) for build-time StyleSheet processing.
- **`_layout.tsx`** imports `../global.css` as its first line — required for Uniwind to initialize.

## Gotchas

- **`react-native-ease` is a native Fabric component** (codegen spec `EaseViewSpec`). Adding or upgrading it requires a **native rebuild** — `npx expo prebuild` + `npx expo run:ios|run:android`. A Metro/Fast-Refresh reload is not enough; the app will throw on an unregistered `EaseView`. Requires RN 0.76+ new architecture, iOS 15.1+, Android minSdk 24. It autolinks for both platforms (verify with `npx @react-native-community/cli config`).
- **`react-native-ease` animates views, not text.** v0.8.0 exports only `EaseView`; `AnimateProps` has no `color` key and there is no `EaseText`. Text colour therefore cannot be animated by Ease — `EaseFlashPad` is a **hybrid** that uses `EaseView` for the background and Reanimated's `interpolateColor` for the text colour. Do not "simplify" it into a pure-Ease version; it cannot be one. Ease also animates `backgroundColor` with `ValueAnimator.ofArgb()` on Android, which is **timing-only** — a spring silently downgrades to timing 300ms. Use `timing` on both platforms when comparing against Reanimated.
- **`useBenchmarkReporter` dedupes `stress-complete` without `lastMs`.** The terminal phase's dedupe key deliberately omits `lastMs`. On screens whose data feed keeps running after the stress counter stops (`animation-engine-benchmark`), `lastMs` changes every tick and would otherwise re-emit the completion line forever, polluting the JSONL that `scripts/collect-android-benchmarks.sh` scrapes. Keep that asymmetry.
- **Patched dependency**: No active patches. The `@react-native/gradle-plugin` foojay-resolver patch (0.5.0 → 1.0.0) was dropped in SDK 57 — RN 0.86.3 ships 1.0.0 upstream. An earlier uniwind SafeAreaView patch was removed in 1.6.4+.
- **No web support in practice**: `expo start --web` is listed but the benchmarks are native-only.
- **`android/` and `ios/`** are gitignored — they're generated by `npx expo run:ios`/`run:android`.
- **EAS builds**: Local builds go to `./builds/` (gitignored). Node 24.14.1 + Bun 1.2.5 pinned in `eas.json`.

## File patterns

- Benchmark screens: `src/app/*-benchmark.tsx`
- Benchmark row views: `src/benchmark/*-row-views.tsx` (3 exports per file)
- Row data: `src/data/*-rows.ts`
- Stress hooks: `src/hooks/use-*-toggle.ts`
- Shared components: `src/components/*.tsx` (kebab-case files, PascalCase exports)

## Cursor Cloud specific instructions

- **Toolchain PATH gotcha**: The VM prepends `/exec-daemon` (Node v22) to `PATH`, which shadows the required Node 24. Node 24 (via nvm) and Bun 1.2.5 are pre-installed in the snapshot. Before running any `bun`/`expo`/`node` command, put them first on `PATH`:
  ```bash
  export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$HOME/.bun/bin:$PATH"
  ```
  (This is already appended to `~/.bashrc`, but non-login/non-interactive shells may still resolve the v22 binary, so re-export when in doubt. `node -v` must report `v24.14.1`.)
- **Update script** only runs `bun install`; it does not install the toolchain (that lives in the snapshot).
- **No device/emulator, no web**: This is a native-only app (Unistyles v3 uses a Nitro native module; Uniwind is native-only). `expo start --web`/`expo export --platform web` fail — `react-native-web` is intentionally not a dependency. There is no iOS/Android runtime here, so the real UI cannot be rendered in this VM.
- **Headless verification that works** (no device needed):
  - Lint: `bun run lint` (oxlint) — passes with 1 pre-existing warning.
  - Format: `bun run format:check` (oxfmt) — currently fails only on the auto-generated `src/uniwind-types.d.ts`; this is a pre-existing/committed state, not something to "fix".
  - Full JS build smoke test: `bunx expo export --platform android --output-dir /tmp/expo-export-android` bundles all screens + all 3 engines into a single Hermes `.hbc`. The exported `_expo/static/css/global-*.css` is **0 bytes by design** — Uniwind's Metro transformer blanks CSS on non-web platforms (`css.code = ''`) and injects the compiled styles into JS via `Uniwind.__reinit`, so Tailwind classes live in the `.hbc`, not the CSS. Grep the bundle for `flex-row` to confirm.
  - Dev server: `bun run start` (Metro, `--dev-client`). Add `CI=1` to disable watch mode in automation. Verify with `curl http://localhost:8081/status` (200) and fetch the live app bundle at `http://localhost:8081/index.bundle?platform=android&dev=true`. Note: expo-router lazily bundles route screens, so the initial `index.bundle` contains the entry + router but not per-screen text — the full `expo export` above is the bundle that contains everything.
