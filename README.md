# benchmark-styling

Expo (Router) app comparing three styling approaches on the same UI:

- **React Native `StyleSheet`**
- **`react-native-unistyles` v3**
- **Uniwind** (Tailwind-style `className`)

## Run

```bash
npm install
npx expo start
```

The app entry is `index.ts` (not `expo-router/entry` alone): it loads `@expo/metro-runtime` first, then Unistyles `StyleSheet.configure`, then the Expo Router root. That order avoids native bridge timing issues with `RCTEventEmitter` on iOS.

`app.json` sets `newArchEnabled: false` for stability; you can flip it to `true` after a `npx expo prebuild --clean` if you need the New Architecture.

Open **Static list benchmark** or **Realtime list benchmark** from the home screen. On each screen, use the radio group to switch engines. **Last render (approx.)** shows a rough JS-side timing (compare on the same device/session); it is not a substitute for native profiling or Release builds.

## What to watch

- Scroll jank and frame drops when switching engines or on the realtime tick (~280 ms mock updates).
- Optional **Binance** WebSocket updates the first row’s price when connected; otherwise mock data only (see the status line on the realtime screen).

## Config notes

- `babel.config.js` includes `react-native-unistyles/plugin` with `root: 'src'`.
- Uniwind remains configured via `metro.config.js` and `src/global.css`.

## iOS: `RNSBottomTabsScreenComponentView` build error

`react-native-screens` 4.24+ renamed bottom-tabs types to `RNSTabsScreenComponentView` / `RNSTabsHostComponentView`. This repo applies a **Bun patch** to `expo-router` (`patches/expo-router@6.0.23.patch`) so `LinkPreviewNativeNavigation.mm` matches. After `bun install`, rebuild iOS (`npx expo prebuild --clean` if you use prebuild, then open Xcode or `npx expo run:ios`).
