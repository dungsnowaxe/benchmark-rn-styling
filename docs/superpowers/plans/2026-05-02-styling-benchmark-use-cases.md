# Styling Benchmark Use Cases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new benchmark screens to compare React Native StyleSheet, react-native-unistyles, and Uniwind performance under conditional style logic and layout thrashing scenarios with stress mode testing.

**Architecture:** Four isolated benchmark screens following existing patterns — each with engine switcher, stress mode toggle, metrics display, and three engine variants (RN/Unistyles/Uniwind). Shared frame rate monitoring hook and consistent stress mode pattern.

**Tech Stack:** React Native 0.81.5, Expo 54, react-native-unistyles 3.2.2, Uniwind 1.0.5, react-native-reanimated (for frame rate), TypeScript 5.9.2

---

## File Structure

```
src/
├── benchmark/
│   ├── userStatesRowViews.tsx           # 3 engine variants for user state rows
│   ├── formValidationRowViews.tsx       # 3 engine variants for form field rows
│   ├── listItemStatesRowViews.tsx       # 3 engine variants for list item rows
│   └── skeletonTransitionRowViews.tsx   # 3 engine variants for skeleton rows
├── data/
│   ├── userStatesRows.ts                # Mock user profile data with flags
│   ├── formValidationRows.ts            # Mock form field data with states
│   ├── listItemStatesRows.ts            # Mock list item data with states
│   └── skeletonRows.ts                  # Mock skeleton/content data
├── hooks/
│   ├── useFrameRateMonitor.ts           # Frame drop detection (shared)
│   ├── useUserStatesToggle.ts           # Stress mode for user states
│   ├── useFormValidationToggle.ts       # Stress mode for form validation
│   ├── useListItemStatesToggle.ts       # Stress mode for list item states
│   └── useSkeletonTransition.ts         # Stress mode for skeleton transitions
└── app/
    ├── user-states-benchmark.tsx        # User states benchmark screen
    ├── form-validation-benchmark.tsx    # Form validation benchmark screen
    ├── list-item-states-benchmark.tsx   # List item states benchmark screen
    ├── skeleton-transition-benchmark.tsx # Skeleton transition benchmark screen
    └── index.tsx                        # Update home screen with new links
```

---

## Task 1: Create shared frame rate monitoring hook

**Files:**
- Create: `src/hooks/useFrameRateMonitor.ts`

- [ ] **Step 1: Write the hook implementation**

```typescript
import { useEffect, useRef, useState } from "react";

interface FrameRateStats {
  fps: number;
  dropsPerMinute: number;
  isDropping: boolean;
}

export function useFrameRateMonitor(enabled: boolean) {
  const [stats, setStats] = useState<FrameRateStats>({
    fps: 60,
    dropsPerMinute: 0,
    isDropping: false,
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef<number>(performance.now());
  const dropCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let animationId: number;

    const measureFrame = (time: number) => {
      frameCountRef.current++;
      const delta = time - lastTimeRef.current;

      // Detect frame drop (more than 2 frames at 60fps = ~33.3ms)
      if (delta > 33.3 * 2) {
        dropCountRef.current++;
      }

      lastTimeRef.current = time;
      animationId = requestAnimationFrame(measureFrame);
    };

    animationId = requestAnimationFrame(measureFrame);

    // Calculate stats every second
    intervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - lastTimeRef.current) / 1000;
      const fps = elapsed > 0 ? Math.round(frameCountRef.current / elapsed) : 60;
      const dropsPerMinute = Math.round((dropCountRef.current / elapsed) * 60);
      const isDropping = dropCountRef.current > 5; // 5+ drops in sampling period

      setStats({ fps, dropsPerMinute, isDropping });

      // Reset counters
      frameCountRef.current = 0;
      dropCountRef.current = 0;
      lastTimeRef.current = performance.now();
    }, 1000);

    return () => {
      cancelAnimationFrame(animationId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);

  return stats;
}
```

- [ ] **Step 2: Commit the frame rate monitor hook**

```bash
git add src/hooks/useFrameRateMonitor.ts
git commit -m "feat: add frame rate monitoring hook

Track FPS, frame drops per minute, and dropping state for benchmark metrics.
Uses requestAnimationFrame for accurate native performance measurement.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Create user states data and row components

**Files:**
- Create: `src/data/userStatesRows.ts`
- Create: `src/benchmark/userStatesRowViews.tsx`

- [ ] **Step 1: Create user states data types and generators**

```typescript
// src/data/userStatesRows.ts

export type UserStateRow = {
  id: string;
  username: string;
  avatar: string;
  isPremium: boolean;
  isVerified: boolean;
  isMuted: boolean;
  hasNotification: boolean;
  isNew: boolean;
};

const USERNAMES = [
  "alice_wonder", "bob_builder", "charlie_dev", "diana_designer",
  "evan_engineer", "fiona_frontend", "george_backend", "hannah_hacker",
  "ivan_ui", "julia_js", "kevin_kernel", "luna_ux",
  "mike_mobile", "nina_native", "oliver_ops", "petra_product",
  "quinn_qa", "rachel_react", "steve_scala", "tina_typescript",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeUserStatesRows(count: number): UserStateRow[] {
  const rows: UserStateRow[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 12345;
    rows.push({
      id: `user-${i}`,
      username: USERNAMES[i % USERNAMES.length],
      avatar: `👤`,
      isPremium: seededRandom(seed) > 0.7,
      isVerified: seededRandom(seed + 1) > 0.8,
      isMuted: seededRandom(seed + 2) > 0.9,
      hasNotification: seededRandom(seed + 3) > 0.6,
      isNew: seededRandom(seed + 4) > 0.85,
    });
  }
  return rows;
}

// Deterministic toggle for consistent testing
export function toggleUserStates(
  prev: UserStateRow[],
  percentage: number,
  seed: number,
): UserStateRow[] {
  const countToToggle = Math.floor(prev.length * percentage);
  const indicesToToggle: number[] = [];

  for (let i = 0; i < prev.length; i++) {
    const rand = seededRandom(seed + i * 100);
    if (rand < percentage && indicesToToggle.length < countToToggle) {
      indicesToToggle.push(i);
    }
  }

  return prev.map((row, idx) => {
    if (!indicesToToggle.includes(idx)) return row;

    const toggleSeed = seed + idx * 200;
    return {
      ...row,
      isPremium: seededRandom(toggleSeed) > 0.5,
      isVerified: seededRandom(toggleSeed + 1) > 0.5,
      isMuted: seededRandom(toggleSeed + 2) > 0.5,
      hasNotification: seededRandom(toggleSeed + 3) > 0.5,
      isNew: seededRandom(toggleSeed + 4) > 0.5,
    };
  });
}
```

- [ ] **Step 2: Create user states row components (3 engine variants)**

```typescript
// src/benchmark/userStatesRowViews.tsx

import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StyleSheet as UnistylesSheet, useUnistyles } from "react-native-unistyles";

import type { UserStateRow } from "../data/userStatesRows";

const hairline = StyleSheet.hairlineWidth;

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  rowMuted: { opacity: 0.5 },
  rowNew: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
  },
  avatarPremium: {
    backgroundColor: "#fef3c7",
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  content: { flex: 1, marginLeft: 12 },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  usernameVerified: {
    color: "#2563eb",
  },
  badges: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: "500",
  },
  badgePremium: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  badgeVerified: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  badgeMuted: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  badgeNotification: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  badgeNew: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
});

export function UserStateRowRN({ item }: { item: UserStateRow }) {
  const rowStyle = [
    rnStyles.row,
    item.isMuted && rnStyles.rowMuted,
    item.isNew && !item.isMuted && rnStyles.rowNew,
  ];

  const avatarStyle = [
    rnStyles.avatar,
    item.isPremium && rnStyles.avatarPremium,
  ];

  const usernameStyle = [
    rnStyles.username,
    item.isVerified && !item.isMuted && rnStyles.usernameVerified,
  ];

  return (
    <View style={rowStyle}>
      <View style={avatarStyle}>
        <Text style={{ fontSize: 20 }}>{item.avatar}</Text>
      </View>
      <View style={rnStyles.content}>
        <Text style={usernameStyle}>{item.username}</Text>
        <View style={rnStyles.badges}>
          {item.isPremium && (
            <Text style={rnStyles.badgePremium}>Premium</Text>
          )}
          {item.isVerified && (
            <Text style={rnStyles.badgeVerified}>Verified</Text>
          )}
          {item.isMuted && <Text style={rnStyles.badgeMuted}>Muted</Text>}
          {item.hasNotification && (
            <Text style={rnStyles.badgeNotification}>!</Text>
          )}
          {item.isNew && <Text style={rnStyles.badgeNew}>NEW</Text>}
        </View>
      </View>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  rowMuted: { opacity: 0.5 },
  rowNew: {
    backgroundColor: theme.colors.warningBg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.muted,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPremium: {
    backgroundColor: theme.colors.warningBg,
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  content: { flex: 1, marginLeft: 12 },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  usernameVerified: {
    color: theme.colors.accent,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: "500",
  },
  badgePremium: {
    backgroundColor: theme.colors.warningBg,
    color: theme.colors.warningText,
  },
  badgeVerified: {
    backgroundColor: theme.colors.accentBg,
    color: theme.colors.accent,
  },
  badgeMuted: {
    backgroundColor: theme.colors.muted,
    color: theme.colors.textMuted,
  },
  badgeNotification: {
    backgroundColor: theme.colors.errorBg,
    color: theme.colors.error,
  },
  badgeNew: {
    backgroundColor: theme.colors.warningBg,
    color: theme.colors.warningText,
  },
}));

export function UserStateRowUnistyles({ item }: { item: UserStateRow }) {
  const { theme } = useUnistyles();

  const rowStyle = [
    uniStyles.row,
    item.isMuted && uniStyles.rowMuted,
    item.isNew && !item.isMuted && uniStyles.rowNew,
  ];

  const avatarStyle = [
    uniStyles.avatar,
    item.isPremium && uniStyles.avatarPremium,
  ];

  const usernameStyle = [
    uniStyles.username,
    item.isVerified && !item.isMuted && uniStyles.usernameVerified,
  ];

  return (
    <View style={rowStyle}>
      <View style={avatarStyle}>
        <Text style={{ fontSize: 20 }}>{item.avatar}</Text>
      </View>
      <View style={uniStyles.content}>
        <Text style={usernameStyle}>{item.username}</Text>
        <View style={uniStyles.badges}>
          {item.isPremium && (
            <Text style={uniStyles.badgePremium}>Premium</Text>
          )}
          {item.isVerified && (
            <Text style={uniStyles.badgeVerified}>Verified</Text>
          )}
          {item.isMuted && <Text style={uniStyles.badgeMuted}>Muted</Text>}
          {item.hasNotification && (
            <Text style={uniStyles.badgeNotification}>!</Text>
          )}
          {item.isNew && <Text style={uniStyles.badgeNew}>NEW</Text>}
        </View>
      </View>
    </View>
  );
}

// Uniwind variant
export function UserStateRowUniwind({ item }: { item: UserStateRow }) {
  const rowBase = "flex-row items-center px-3 py-2.5 border-b border-gray-200 dark:border-gray-700";
  const rowMods = item.isMuted
    ? "opacity-50"
    : item.isNew
      ? "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-l-amber-500"
      : "bg-white dark:bg-gray-950";

  const avatarBase = "w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center";
  const avatarMod = item.isPremium
    ? "bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500"
    : "";

  const usernameBase = "text-[15px] font-semibold";
  const usernameMod = item.isVerified && !item.isMuted
    ? "text-blue-600 dark:text-blue-400"
    : "text-gray-900 dark:text-gray-100";

  const badgePremium = "px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  const badgeVerified = "px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  const badgeMuted = "px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  const badgeNotification = "px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  const badgeNew = "px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <View className={`${rowBase} ${rowMods}`}>
      <View className={`${avatarBase} ${avatarMod}`}>
        <Text className="text-[20px]">{item.avatar}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className={`${usernameBase} ${usernameMod}`}>
          {item.username}
        </Text>
        <View className="flex-row gap-1 mt-1">
          {item.isPremium && <Text className={badgePremium}>Premium</Text>}
          {item.isVerified && <Text className={badgeVerified}>Verified</Text>}
          {item.isMuted && <Text className={badgeMuted}>Muted</Text>}
          {item.hasNotification && <Text className={badgeNotification}>!</Text>}
          {item.isNew && <Text className={badgeNew}>NEW</Text>}
        </View>
      </View>
    </View>
  );
}

const UserStateRowRNMemo = memo(UserStateRowRN);
const UserStateRowUnistylesMemo = memo(UserStateRowUnistyles);
const UserStateRowUniwindMemo = memo(UserStateRowUniwind);

export { UserStateRowRNMemo as UserStateRowRN };
export { UserStateRowUnistylesMemo as UserStateRowUnistyles };
export { UserStateRowUniwindMemo as UserStateRowUniwind };
```

- [ ] **Step 3: Commit user states data and row components**

```bash
git add src/data/userStatesRows.ts src/benchmark/userStatesRowViews.tsx
git commit -m "feat: add user states benchmark data and row components

- Add UserStateRow type with 5 boolean flags (premium, verified, muted, notification, new)
- Implement deterministic random for consistent testing
- Create 3 engine variants: RN StyleSheet, Unistyles, Uniwind
- Each variant handles conditional styling based on flag combinations

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Create user states stress mode hook

**Files:**
- Create: `src/hooks/useUserStatesToggle.ts`

- [ ] **Step 1: Implement stress mode hook**

```typescript
import { useEffect, useRef, useState } from "react";

import type { UserStateRow } from "../data/userStatesRows";
import { makeUserStatesRows, toggleUserStates } from "../data/userStatesRows";

interface UseUserStatesToggleConfig {
  rowCount: number;
  updateInterval: number; // ms
  updatePercentage: number; // 0-1
  enabled: boolean;
  maxUpdates?: number;
}

export function useUserStatesToggle(config: UseUserStatesToggleConfig) {
  const {
    rowCount,
    updateInterval,
    updatePercentage,
    enabled,
    maxUpdates = 1000,
  } = config;

  const [rows, setRows] = useState<UserStateRow[]>(() =>
    makeUserStatesRows(rowCount),
  );
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when rowCount changes
  useEffect(() => {
    setRows(makeUserStatesRows(rowCount));
    setUpdatesCount(0);
    seedRef.current = 0;
  }, [rowCount]);

  // Stress mode updates
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (updateCount >= maxUpdates) {
      return;
    }

    intervalRef.current = setInterval(() => {
      seedRef.current++;
      setRows((prev) =>
        toggleUserStates(prev, updatePercentage, seedRef.current),
      );
      setUpdatesCount((c) => c + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updatePercentage, updateCount, maxUpdates]);

  return { rows, updateCount, maxUpdates };
}
```

- [ ] **Step 2: Commit stress mode hook**

```bash
git add src/hooks/useUserStatesToggle.ts
git commit -m "feat: add user states stress mode hook

Implements deterministic state toggling for benchmark stress testing.
Configurable interval, percentage, and max update cap.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Create user states benchmark screen

**Files:**
- Create: `src/app/user-states-benchmark.tsx`

- [ ] **Step 1: Implement the benchmark screen**

```typescript
import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  UserStateRowRN,
  UserStateRowUnistyles,
  UserStateRowUniwind,
} from "../benchmark/userStatesRowViews";
import { EngineRadioGroup } from "../components/EngineRadioGroup";
import { RenderTimeLabel } from "../components/RenderTimeLabel";
import { useStylingEngine } from "../context/StylingEngineContext";
import { useRenderMeasurement } from "../hooks/useRenderMeasurement";
import { useFrameRateMonitor } from "../hooks/useFrameRateMonitor";
import { useUserStatesToggle } from "../hooks/useUserStatesToggle";

const MetricsDisplay = memo(function MetricsDisplay({
  lastMs,
  fps,
  dropsPerMinute,
  updateCount,
  maxUpdates,
  stressEnabled,
  onToggleStress,
}: {
  lastMs: number | null;
  fps: number;
  dropsPerMinute: number;
  updateCount: number;
  maxUpdates: number;
  stressEnabled: boolean;
  onToggleStress: () => void;
}) {
  return (
    <View className="gap-2 border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        100 user profiles with 5 state flags each
      </Text>
      <EngineRadioGroup />
      <RenderTimeLabel lastMs={lastMs} />
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 dark:text-gray-300">
          FPS: {fps} | Drops: {dropsPerMinute}/min
        </Text>
        <Pressable
          onPress={onToggleStress}
          className={`rounded-lg px-3 py-1.5 ${
            stressEnabled
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              stressEnabled
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {stressEnabled ? "Stop Stress" : "Start Stress"} ({updateCount}/
            {maxUpdates})
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function UserStatesBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const [stressEnabled, setStressEnabled] = useState(false);

  const { rows, updateCount, maxUpdates } = useUserStatesToggle({
    rowCount: 100,
    updateInterval: 200,
    updatePercentage: 0.2,
    enabled: stressEnabled,
  });

  const { lastMs, markStart } = useRenderMeasurement(engine, updateCount);
  const { fps, dropsPerMinute } = useFrameRateMonitor(stressEnabled);

  const renderItem = useCallback(
    ({ item }: { item: UserStateRow }) => {
      switch (engine) {
        case "stylesheet":
          return <UserStateRowRN item={item} />;
        case "unistyles":
          return <UserStateRowUnistyles item={item} />;
        case "uniwind":
          return <UserStateRowUniwind item={item} />;
      }
    },
    [engine],
  );

  const rowsDisplay = useMemo(() => rows, [rows]);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <MetricsDisplay
        lastMs={lastMs}
        fps={fps}
        dropsPerMinute={dropsPerMinute}
        updateCount={updateCount}
        maxUpdates={maxUpdates}
        stressEnabled={stressEnabled}
        onToggleStress={() => {
          markStart();
          setStressEnabled((v) => !v);
        }}
      />
      <FlatList
        data={rowsDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={14}
        windowSize={7}
      />
    </View>
  );
}
```

- [ ] **Step 2: Add missing import**

```typescript
// Add to imports at top of file
import { useState } from "react";
import type { UserStateRow } from "../data/userStatesRows";
```

- [ ] **Step 3: Commit benchmark screen**

```bash
git add src/app/user-states-benchmark.tsx
git commit -m "feat: add user states benchmark screen

Complete benchmark with engine switcher, stress mode toggle, and metrics.
Tests 100 user profiles with 5 boolean flag combinations.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Update home screen with user states link

**Files:**
- Modify: `src/app/index.tsx`

- [ ] **Step 1: Add link to user states benchmark**

```typescript
// Add this import at the top if not present
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

// In the component, after the realtime-flash-benchmark Link, add:

      <Link href="/user-states-benchmark" asChild>
        <Pressable className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-900">
          <Text className="text-center text-base font-semibold text-gray-900 dark:text-white">
            User states benchmark
          </Text>
          <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            100 profiles with premium, verified, muted, notification, new flags
          </Text>
        </Pressable>
      </Link>
```

- [ ] **Step 2: Commit home screen update**

```bash
git add src/app/index.tsx
git commit -m "feat: add user states benchmark link to home screen

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Create form validation data and row components

**Files:**
- Create: `src/data/formValidationRows.ts`
- Create: `src/benchmark/formValidationRowViews.tsx`

- [ ] **Step 1: Create form validation data types and generators**

```typescript
// src/data/formValidationRows.ts

export type ValidationState =
  | "error"
  | "warning"
  | "success"
  | "disabled"
  | "focused"
  | "filled";

export type FormValidationRow = {
  id: string;
  label: string;
  value: string;
  helperText: string;
  state: ValidationState;
};

const FIELD_LABELS = [
  "Username", "Email", "Password", "Confirm Password", "Full Name",
  "Phone", "Address", "City", "State", "Zip Code",
  "Country", "Company", "Job Title", "Website", "Bio",
  "Twitter", "LinkedIn", "GitHub", "Portfolio", "Referral",
  "Coupon Code", "Notes", "Preferred Contact", "Timezone",
  "Age", "Gender", "Income", "Education", "Experience",
  "Skills", "Languages", "Certifications", "Projects", "Publications",
  "Awards", "Interests", "Goals", "Challenges", "Achievements",
  "References", "Availability", "Rate", "Currency", "Payment Method",
  "Bank Name", "Account Number", "Routing Number", "Tax ID", "Signature",
  "Date of Birth", "Nationality", "Passport", "Visa", "Work Authorization",
];

const VALIDATION_STATES: ValidationState[] = [
  "error", "warning", "success", "disabled", "focused", "filled",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeFormValidationRows(count: number): FormValidationRow[] {
  const rows: FormValidationRow[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 54321;
    const stateIndex = Math.floor(seededRandom(seed) * VALIDATION_STATES.length);
    rows.push({
      id: `form-${i}`,
      label: FIELD_LABELS[i % FIELD_LABELS.length],
      value: seededRandom(seed + 1) > 0.3 ? "Sample value" : "",
      helperText: getHelperText(VALIDATION_STATES[stateIndex]),
      state: VALIDATION_STATES[stateIndex],
    });
  }
  return rows;
}

function getHelperText(state: ValidationState): string {
  switch (state) {
    case "error":
      return "This field is required";
    case "warning":
      return "This may affect your application";
    case "success":
      return "Looks good!";
    case "disabled":
      return "This field is disabled";
    case "focused":
      return "Enter your information";
    case "filled":
      return "Completed";
    default:
      return "";
  }
}

// Deterministic state cycling for consistent testing
export function cycleFormValidationStates(
  prev: FormValidationRow[],
  seed: number,
): FormValidationRow[] {
  return prev.map((row, idx) => {
    const rand = seededRandom(seed + idx * 100);
    const stateIndex = Math.floor(rand * VALIDATION_STATES.length);
    return {
      ...row,
      state: VALIDATION_STATES[stateIndex],
      helperText: getHelperText(VALIDATION_STATES[stateIndex]),
    };
  });
}
```

- [ ] **Step 2: Create form validation row components (3 engine variants)**

```typescript
// src/benchmark/formValidationRowViews.tsx

import { memo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { StyleSheet as UnistylesSheet, useUnistyles } from "react-native-unistyles";

import type { FormValidationRow } from "../data/formValidationRows";

const hairline = StyleSheet.hairlineWidth;

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  inputWarning: {
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  inputSuccess: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  inputFocused: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  inputFilled: {
    borderColor: "#059669",
    backgroundColor: "#f0fdf4",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperTextError: { color: "#dc2626" },
  helperTextWarning: { color: "#d97706" },
  helperTextSuccess: { color: "#16a34a" },
  helperTextDisabled: { color: "#9ca3af" },
  helperTextFocused: { color: "#2563eb" },
  helperTextFilled: { color: "#059669" },
});

export function FormValidationRowRN({ item }: { item: FormValidationRow }) {
  const inputStyle = [
    rnStyles.input,
    item.state === "error" && rnStyles.inputError,
    item.state === "warning" && rnStyles.inputWarning,
    item.state === "success" && rnStyles.inputSuccess,
    item.state === "disabled" && rnStyles.inputDisabled,
    item.state === "focused" && rnStyles.inputFocused,
    item.state === "filled" && rnStyles.inputFilled,
  ];

  const helperTextStyle = [
    rnStyles.helperText,
    item.state === "error" && rnStyles.helperTextError,
    item.state === "warning" && rnStyles.helperTextWarning,
    item.state === "success" && rnStyles.helperTextSuccess,
    item.state === "disabled" && rnStyles.helperTextDisabled,
    item.state === "focused" && rnStyles.helperTextFocused,
    item.state === "filled" && rnStyles.helperTextFilled,
  ];

  return (
    <View style={rnStyles.container}>
      <Text style={rnStyles.label}>{item.label}</Text>
      <TextInput
        style={inputStyle}
        value={item.value}
        editable={item.state !== "disabled"}
        placeholder={item.state === "filled" ? "" : "Enter value"}
      />
      <Text style={helperTextStyle}>{item.helperText}</Text>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorBg,
  },
  inputWarning: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningBg,
  },
  inputSuccess: {
    borderColor: theme.colors.positive,
    backgroundColor: theme.colors.positiveBg,
  },
  inputDisabled: {
    backgroundColor: theme.colors.muted,
    color: theme.colors.textMuted,
  },
  inputFocused: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentBg,
  },
  inputFilled: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successBg,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperTextError: { color: theme.colors.error },
  helperTextWarning: { color: theme.colors.warningText },
  helperTextSuccess: { color: theme.colors.positive },
  helperTextDisabled: { color: theme.colors.textMuted },
  helperTextFocused: { color: theme.colors.accent },
  helperTextFilled: { color: theme.colors.success },
}));

export function FormValidationRowUnistyles({ item }: { item: FormValidationRow }) {
  const inputStyle = [
    uniStyles.input,
    item.state === "error" && uniStyles.inputError,
    item.state === "warning" && uniStyles.inputWarning,
    item.state === "success" && uniStyles.inputSuccess,
    item.state === "disabled" && uniStyles.inputDisabled,
    item.state === "focused" && uniStyles.inputFocused,
    item.state === "filled" && uniStyles.inputFilled,
  ];

  const helperTextStyle = [
    uniStyles.helperText,
    item.state === "error" && uniStyles.helperTextError,
    item.state === "warning" && uniStyles.helperTextWarning,
    item.state === "success" && uniStyles.helperTextSuccess,
    item.state === "disabled" && uniStyles.helperTextDisabled,
    item.state === "focused" && uniStyles.helperTextFocused,
    item.state === "filled" && uniStyles.helperTextFilled,
  ];

  return (
    <View style={uniStyles.container}>
      <Text style={uniStyles.label}>{item.label}</Text>
      <TextInput
        style={inputStyle}
        value={item.value}
        editable={item.state !== "disabled"}
        placeholder={item.state === "filled" ? "" : "Enter value"}
      />
      <Text style={helperTextStyle}>{item.helperText}</Text>
    </View>
  );
}

// Uniwind variant
export function FormValidationRowUniwind({ item }: { item: FormValidationRow }) {
  const inputBase = "text-[15px] py-2 px-2.5 rounded-lg border bg-white dark:bg-gray-950";
  const inputMod =
    item.state === "error"
      ? "border-red-600 bg-red-50 dark:bg-red-950/30"
      : item.state === "warning"
        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
        : item.state === "success"
          ? "border-green-600 bg-green-50 dark:bg-green-950/30"
          : item.state === "disabled"
            ? "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 text-gray-400"
            : item.state === "focused"
              ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
              : item.state === "filled"
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                : "border-gray-300 dark:border-gray-600";

  const helperMod =
    item.state === "error"
      ? "text-red-600 dark:text-red-400"
      : item.state === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : item.state === "success"
          ? "text-green-600 dark:text-green-400"
          : item.state === "disabled"
            ? "text-gray-400"
            : item.state === "focused"
              ? "text-blue-600 dark:text-blue-400"
              : item.state === "filled"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-600 dark:text-gray-400";

  return (
    <View className="py-2.5 px-3 border-b border-gray-200 dark:border-gray-700">
      <Text className="text-[14px] font-medium text-gray-700 dark:text-gray-200 mb-1">
        {item.label}
      </Text>
      <TextInput
        className={`${inputBase} ${inputMod}`}
        value={item.value}
        editable={item.state !== "disabled"}
        placeholder={item.state === "filled" ? "" : "Enter value"}
        placeholderTextColor="#9ca3af"
      />
      <Text className={`text-[12px] mt-1 ${helperMod}`}>
        {item.helperText}
      </Text>
    </View>
  );
}

const FormValidationRowRNMemo = memo(FormValidationRowRN);
const FormValidationRowUnistylesMemo = memo(FormValidationRowUnistyles);
const FormValidationRowUniwindMemo = memo(FormValidationRowUniwind);

export { FormValidationRowRNMemo as FormValidationRowRN };
export { FormValidationRowUnistylesMemo as FormValidationRowUnistyles };
export { FormValidationRowUniwindMemo as FormValidationRowUniwind };
```

- [ ] **Step 3: Commit form validation data and row components**

```bash
git add src/data/formValidationRows.ts src/benchmark/formValidationRowViews.tsx
git commit -m "feat: add form validation benchmark data and row components

- Add FormValidationRow type with 6 validation states
- Implement deterministic state cycling for stress testing
- Create 3 engine variants handling conditional input styles

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Create form validation stress mode hook and screen

**Files:**
- Create: `src/hooks/useFormValidationToggle.ts`
- Create: `src/app/form-validation-benchmark.tsx`

- [ ] **Step 1: Implement stress mode hook**

```typescript
// src/hooks/useFormValidationToggle.ts

import { useEffect, useRef, useState } from "react";

import type { FormValidationRow } from "../data/formValidationRows";
import { cycleFormValidationStates, makeFormValidationRows } from "../data/formValidationRows";

interface UseFormValidationToggleConfig {
  fieldCount: number;
  updateInterval: number;
  enabled: boolean;
  maxUpdates?: number;
}

export function useFormValidationToggle(config: UseFormValidationToggleConfig) {
  const { fieldCount, updateInterval, enabled, maxUpdates = 1000 } = config;

  const [fields, setFields] = useState<FormValidationRow[]>(() =>
    makeFormValidationRows(fieldCount),
  );
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setFields(makeFormValidationRows(fieldCount));
    setUpdatesCount(0);
    seedRef.current = 0;
  }, [fieldCount]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (updateCount >= maxUpdates) {
      return;
    }

    intervalRef.current = setInterval(() => {
      seedRef.current++;
      setFields((prev) => cycleFormValidationStates(prev, seedRef.current));
      setUpdatesCount((c) => c + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updateCount, maxUpdates]);

  return { fields, updateCount, maxUpdates };
}
```

- [ ] **Step 2: Create benchmark screen**

```typescript
// src/app/form-validation-benchmark.tsx

import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  FormValidationRowRN,
  FormValidationRowUnistyles,
  FormValidationRowUniwind,
} from "../benchmark/formValidationRowViews";
import { EngineRadioGroup } from "../components/EngineRadioGroup";
import { RenderTimeLabel } from "../components/RenderTimeLabel";
import { useStylingEngine } from "../context/StylingEngineContext";
import { useRenderMeasurement } from "../hooks/useRenderMeasurement";
import { useFrameRateMonitor } from "../hooks/useFrameRateMonitor";
import { useFormValidationToggle } from "../hooks/useFormValidationToggle";

const MetricsDisplay = memo(function MetricsDisplay({
  lastMs,
  fps,
  dropsPerMinute,
  updateCount,
  maxUpdates,
  stressEnabled,
  onToggleStress,
}: {
  lastMs: number | null;
  fps: number;
  dropsPerMinute: number;
  updateCount: number;
  maxUpdates: number;
  stressEnabled: boolean;
  onToggleStress: () => void;
}) {
  return (
    <View className="gap-2 border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        50 form fields with 6 validation states
      </Text>
      <EngineRadioGroup />
      <RenderTimeLabel lastMs={lastMs} />
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 dark:text-gray-300">
          FPS: {fps} | Drops: {dropsPerMinute}/min
        </Text>
        <Pressable
          onPress={onToggleStress}
          className={`rounded-lg px-3 py-1.5 ${
            stressEnabled
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              stressEnabled
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {stressEnabled ? "Stop Stress" : "Start Stress"} ({updateCount}/
            {maxUpdates})
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function FormValidationBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const [stressEnabled, setStressEnabled] = useState(false);

  const { fields, updateCount, maxUpdates } = useFormValidationToggle({
    fieldCount: 50,
    updateInterval: 150,
    enabled: stressEnabled,
  });

  const { lastMs, markStart } = useRenderMeasurement(engine, updateCount);
  const { fps, dropsPerMinute } = useFrameRateMonitor(stressEnabled);

  const renderItem = useCallback(
    ({ item }: { item: FormValidationRow }) => {
      switch (engine) {
        case "stylesheet":
          return <FormValidationRowRN item={item} />;
        case "unistyles":
          return <FormValidationRowUnistyles item={item} />;
        case "uniwind":
          return <FormValidationRowUniwind item={item} />;
      }
    },
    [engine],
  );

  const fieldsDisplay = useMemo(() => fields, [fields]);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <MetricsDisplay
        lastMs={lastMs}
        fps={fps}
        dropsPerMinute={dropsPerMinute}
        updateCount={updateCount}
        maxUpdates={maxUpdates}
        stressEnabled={stressEnabled}
        onToggleStress={() => {
          markStart();
          setStressEnabled((v) => !v);
        }}
      />
      <FlatList
        data={fieldsDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={14}
        windowSize={7}
      />
    </View>
  );
}
```

- [ ] **Step 3: Add missing import**

```typescript
import { useState } from "react";
import type { FormValidationRow } from "../data/formValidationRows";
```

- [ ] **Step 4: Update home screen with form validation link**

```typescript
// In src/app/index.tsx, after user-states-benchmark Link, add:

      <Link href="/form-validation-benchmark" asChild>
        <Pressable className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-900">
          <Text className="text-center text-base font-semibold text-gray-900 dark:text-white">
            Form validation benchmark
          </Text>
          <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            50 form fields with error, warning, success, disabled, focused, filled states
          </Text>
        </Pressable>
      </Link>
```

- [ ] **Step 5: Commit form validation implementation**

```bash
git add src/hooks/useFormValidationToggle.ts src/app/form-validation-benchmark.tsx src/app/index.tsx
git commit -m "feat: add form validation benchmark with stress mode

- Implement state cycling hook for 50 form fields
- Create benchmark screen with engine switcher and metrics
- Add home screen link

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: Create list item states data and row components

**Files:**
- Create: `src/data/listItemStatesRows.ts`
- Create: `src/benchmark/listItemStatesRowViews.tsx`

- [ ] **Step 1: Create list item states data types and generators**

```typescript
// src/data/listItemStatesRows.ts

export type ListItemStateRow = {
  id: string;
  title: string;
  subtitle: string;
  isSelected: boolean;
  isDisabled: boolean;
  hasUnread: boolean;
  isHighlighted: boolean;
  isLoading: boolean;
  isNew: boolean;
};

const TITLES = [
  "Project Proposal", "Budget Review", "Team Meeting", "Client Feedback",
  "Design Mockups", "API Documentation", "Testing Plan", "Deployment Guide",
  "User Research", "Competitor Analysis", "Market Strategy", "Sales Report",
  "Inventory Check", "Quality Assurance", "Performance Metrics", "Security Audit",
  "Compliance Review", "Risk Assessment", "Resource Allocation", "Timeline Update",
  "Milestone Review", "Stakeholder Update", "Issue Tracker", "Bug Report",
  "Feature Request", "Change Request", "Incident Report", "Post-Mortem",
  "Retrospective", "Action Items", "Decision Log", "Knowledge Base",
  "Training Material", "Onboarding Guide", "Policy Document", "Process Update",
  "Sprint Planning", "Daily Standup", "Backlog Refinement", "Release Notes",
  "Version Control", "Code Review", "CI/CD Pipeline", "Database Schema",
  "API Endpoint", "Webhook Config", "Auth Flow", "Permission Matrix",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeListItemStatesRows(count: number): ListItemStateRow[] {
  const rows: ListItemStateRow[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 65432;
    rows.push({
      id: `list-${i}`,
      title: TITLES[i % TITLES.length],
      subtitle: `Last updated ${Math.abs(Math.floor(seededRandom(seed) * 30))} days ago`,
      isSelected: seededRandom(seed) > 0.85,
      isDisabled: seededRandom(seed + 1) > 0.9,
      hasUnread: seededRandom(seed + 2) > 0.7,
      isHighlighted: seededRandom(seed + 3) > 0.88,
      isLoading: seededRandom(seed + 4) > 0.92,
      isNew: seededRandom(seed + 5) > 0.8,
    });
  }
  return rows;
}

export function toggleListItemStates(
  prev: ListItemStateRow[],
  percentage: number,
  seed: number,
): ListItemStateRow[] {
  const countToToggle = Math.floor(prev.length * percentage);
  const indicesToToggle: number[] = [];

  for (let i = 0; i < prev.length; i++) {
    const rand = seededRandom(seed + i * 100);
    if (rand < percentage && indicesToToggle.length < countToToggle) {
      indicesToToggle.push(i);
    }
  }

  return prev.map((row, idx) => {
    if (!indicesToToggle.includes(idx)) return row;

    const toggleSeed = seed + idx * 200;
    return {
      ...row,
      isSelected: seededRandom(toggleSeed) > 0.5,
      isDisabled: seededRandom(toggleSeed + 1) > 0.5,
      hasUnread: seededRandom(toggleSeed + 2) > 0.5,
      isHighlighted: seededRandom(toggleSeed + 3) > 0.5,
      isLoading: seededRandom(toggleSeed + 4) > 0.5,
      isNew: seededRandom(toggleSeed + 5) > 0.5,
    };
  });
}
```

- [ ] **Step 2: Create list item states row components**

```typescript
// src/benchmark/listItemStatesRowViews.tsx

import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StyleSheet as UnistylesSheet, useUnistyles } from "react-native-unistyles";

import type { ListItemStateRow } from "../data/listItemStatesRows";

const hairline = StyleSheet.hairlineWidth;

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  rowSelected: {
    backgroundColor: "#dbeafe",
  },
  rowHighlighted: {
    backgroundColor: "#fef3c7",
  },
  rowDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxCheck: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  titleUnread: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
  },
  badgeNew: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  badgeUnread: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  loadingSpinner: {
    marginLeft: 8,
  },
});

export function ListItemStateRowRN({ item }: { item: ListItemStateRow }) {
  const rowStyle = [
    rnStyles.row,
    item.isSelected && rnStyles.rowSelected,
    item.isHighlighted && !item.isSelected && rnStyles.rowHighlighted,
    item.isDisabled && rnStyles.rowDisabled,
  ];

  const checkboxStyle = [
    rnStyles.checkbox,
    item.isSelected && rnStyles.checkboxSelected,
  ];

  const titleStyle = [
    rnStyles.title,
    item.hasUnread && rnStyles.titleUnread,
  ];

  return (
    <View style={rowStyle}>
      <View style={checkboxStyle}>
        {item.isSelected && (
          <Text style={rnStyles.checkboxCheck}>✓</Text>
        )}
      </View>
      <View style={rnStyles.content}>
        <Text style={titleStyle}>{item.title}</Text>
        <Text style={rnStyles.subtitle}>{item.subtitle}</Text>
      </View>
      <View style={rnStyles.badges}>
        {item.isNew && <Text style={rnStyles.badgeNew}>NEW</Text>}
        {item.hasUnread && <Text style={rnStyles.badgeUnread}>●</Text>}
        {item.isLoading && (
          <ActivityIndicator
            size="small"
            color="#2563eb"
            style={rnStyles.loadingSpinner}
          />
        )}
      </View>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  rowSelected: {
    backgroundColor: theme.colors.accentBg,
  },
  rowHighlighted: {
    backgroundColor: theme.colors.warningBg,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  checkboxCheck: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.text,
  },
  titleUnread: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "600",
  },
  badgeNew: {
    backgroundColor: theme.colors.warningBg,
    color: theme.colors.warningText,
  },
  badgeUnread: {
    backgroundColor: theme.colors.errorBg,
    color: theme.colors.error,
  },
  loadingSpinner: {
    marginLeft: 8,
  },
}));

export function ListItemStateRowUnistyles({ item }: { item: ListItemStateRow }) {
  const { theme } = useUnistyles();

  const rowStyle = [
    uniStyles.row,
    item.isSelected && uniStyles.rowSelected,
    item.isHighlighted && !item.isSelected && uniStyles.rowHighlighted,
    item.isDisabled && uniStyles.rowDisabled,
  ];

  const checkboxStyle = [
    uniStyles.checkbox,
    item.isSelected && uniStyles.checkboxSelected,
  ];

  const titleStyle = [
    uniStyles.title,
    item.hasUnread && uniStyles.titleUnread,
  ];

  return (
    <View style={rowStyle}>
      <View style={checkboxStyle}>
        {item.isSelected && (
          <Text style={uniStyles.checkboxCheck}>✓</Text>
        )}
      </View>
      <View style={uniStyles.content}>
        <Text style={titleStyle}>{item.title}</Text>
        <Text style={uniStyles.subtitle}>{item.subtitle}</Text>
      </View>
      <View style={uniStyles.badges}>
        {item.isNew && <Text style={uniStyles.badgeNew}>NEW</Text>}
        {item.hasUnread && <Text style={uniStyles.badgeUnread}>●</Text>}
        {item.isLoading && (
          <ActivityIndicator
            size="small"
            color={theme.colors.accent}
            style={uniStyles.loadingSpinner}
          />
        )}
      </View>
    </View>
  );
}

// Uniwind variant
export function ListItemStateRowUniwind({ item }: { item: ListItemStateRow }) {
  const rowBase = "flex-row items-center px-3 py-2.5 border-b border-gray-200 dark:border-gray-700";
  const rowMods = item.isDisabled
    ? "opacity-50"
    : item.isSelected
      ? "bg-blue-50 dark:bg-blue-950/30"
      : item.isHighlighted
        ? "bg-amber-50 dark:bg-amber-950/30"
        : "bg-white dark:bg-gray-950";

  const checkboxBase = "w-5 h-5 rounded border-2 mr-2.5 items-center justify-center";
  const checkboxMod = item.isSelected
    ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
    : "border-gray-300 dark:border-gray-600";

  const titleMod = item.hasUnread
    ? "font-bold text-gray-900 dark:text-gray-100"
    : "font-medium text-gray-900 dark:text-gray-100";

  return (
    <View className={`${rowBase} ${rowMods}`}>
      <View className={`${checkboxBase} ${checkboxMod}`}>
        {item.isSelected && (
          <Text className="text-[12px] font-bold text-white dark:text-white">✓</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className={`text-[15px] ${titleMod}`}>{item.title}</Text>
        <Text className="text-[13px] text-gray-600 dark:text-gray-400 mt-0.5">
          {item.subtitle}
        </Text>
      </View>
      <View className="flex-row gap-1 ml-2">
        {item.isNew && (
          <Text className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            NEW
          </Text>
        )}
        {item.hasUnread && (
          <Text className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            ●
          </Text>
        )}
        {item.isLoading && (
          <ActivityIndicator size="small" color="#2563eb" className="ml-2" />
        )}
      </View>
    </View>
  );
}

const ListItemStateRowRNMemo = memo(ListItemStateRowRN);
const ListItemStateRowUnistylesMemo = memo(ListItemStateRowUnistyles);
const ListItemStateRowUniwindMemo = memo(ListItemStateRowUniwind);

export { ListItemStateRowRNMemo as ListItemStateRowRN };
export { ListItemStateRowUnistylesMemo as ListItemStateRowUnistyles };
export { ListItemStateRowUniwindMemo as ListItemStateRowUniwind };
```

- [ ] **Step 3: Commit list item states implementation**

```bash
git add src/data/listItemStatesRows.ts src/benchmark/listItemStatesRowViews.tsx
git commit -m "feat: add list item states benchmark data and row components

- Add ListItemStateRow type with 6 state flags
- Implement deterministic toggle for stress testing
- Create 3 engine variants with checkbox, badges, loading states

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: Create list item states hook and screen

**Files:**
- Create: `src/hooks/useListItemStatesToggle.ts`
- Create: `src/app/list-item-states-benchmark.tsx`

- [ ] **Step 1: Implement stress mode hook**

```typescript
// src/hooks/useListItemStatesToggle.ts

import { useEffect, useRef, useState } from "react";

import type { ListItemStateRow } from "../data/listItemStatesRows";
import { makeListItemStatesRows, toggleListItemStates } from "../data/listItemStatesRows";

interface UseListItemStatesToggleConfig {
  itemCount: number;
  updateInterval: number;
  updatePercentage: number;
  enabled: boolean;
  maxUpdates?: number;
}

export function useListItemStatesToggle(config: UseListItemStatesToggleConfig) {
  const {
    itemCount,
    updateInterval,
    updatePercentage,
    enabled,
    maxUpdates = 1000,
  } = config;

  const [items, setItems] = useState<ListItemStateRow[]>(() =>
    makeListItemStatesRows(itemCount),
  );
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setItems(makeListItemStatesRows(itemCount));
    setUpdatesCount(0);
    seedRef.current = 0;
  }, [itemCount]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (updateCount >= maxUpdates) {
      return;
    }

    intervalRef.current = setInterval(() => {
      seedRef.current++;
      setItems((prev) =>
        toggleListItemStates(prev, updatePercentage, seedRef.current),
      );
      setUpdatesCount((c) => c + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updatePercentage, updateCount, maxUpdates]);

  return { items, updateCount, maxUpdates };
}
```

- [ ] **Step 2: Create benchmark screen and update home**

```typescript
// src/app/list-item-states-benchmark.tsx

import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  ListItemStateRowRN,
  ListItemStateRowUnistyles,
  ListItemStateRowUniwind,
} from "../benchmark/listItemStatesRowViews";
import { EngineRadioGroup } from "../components/EngineRadioGroup";
import { RenderTimeLabel } from "../components/RenderTimeLabel";
import { useStylingEngine } from "../context/StylingEngineContext";
import type { ListItemStateRow } from "../data/listItemStatesRows";
import { useRenderMeasurement } from "../hooks/useRenderMeasurement";
import { useFrameRateMonitor } from "../hooks/useFrameRateMonitor";
import { useListItemStatesToggle } from "../hooks/useListItemStatesToggle";

const MetricsDisplay = memo(function MetricsDisplay({
  lastMs,
  fps,
  dropsPerMinute,
  updateCount,
  maxUpdates,
  stressEnabled,
  onToggleStress,
}: {
  lastMs: number | null;
  fps: number;
  dropsPerMinute: number;
  updateCount: number;
  maxUpdates: number;
  stressEnabled: boolean;
  onToggleStress: () => void;
}) {
  return (
    <View className="gap-2 border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        200 list items with 6 state flags
      </Text>
      <EngineRadioGroup />
      <RenderTimeLabel lastMs={lastMs} />
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 dark:text-gray-300">
          FPS: {fps} | Drops: {dropsPerMinute}/min
        </Text>
        <Pressable
          onPress={onToggleStress}
          className={`rounded-lg px-3 py-1.5 ${
            stressEnabled
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              stressEnabled
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {stressEnabled ? "Stop Stress" : "Start Stress"} ({updateCount}/
            {maxUpdates})
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function ListItemStatesBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const [stressEnabled, setStressEnabled] = useState(false);

  const { items, updateCount, maxUpdates } = useListItemStatesToggle({
    itemCount: 200,
    updateInterval: 100,
    updatePercentage: 0.1,
    enabled: stressEnabled,
  });

  const { lastMs, markStart } = useRenderMeasurement(engine, updateCount);
  const { fps, dropsPerMinute } = useFrameRateMonitor(stressEnabled);

  const renderItem = useCallback(
    ({ item }: { item: ListItemStateRow }) => {
      switch (engine) {
        case "stylesheet":
          return <ListItemStateRowRN item={item} />;
        case "unistyles":
          return <ListItemStateRowUnistyles item={item} />;
        case "uniwind":
          return <ListItemStateRowUniwind item={item} />;
      }
    },
    [engine],
  );

  const itemsDisplay = useMemo(() => items, [items]);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <MetricsDisplay
        lastMs={lastMs}
        fps={fps}
        dropsPerMinute={dropsPerMinute}
        updateCount={updateCount}
        maxUpdates={maxUpdates}
        stressEnabled={stressEnabled}
        onToggleStress={() => {
          markStart();
          setStressEnabled((v) => !v);
        }}
      />
      <FlatList
        data={itemsDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={14}
        windowSize={7}
      />
    </View>
  );
}
```

- [ ] **Step 3: Add missing imports**

```typescript
import { useState } from "react";
```

- [ ] **Step 4: Update home screen**

```typescript
// In src/app/index.tsx, after form-validation-benchmark Link, add:

      <Link href="/list-item-states-benchmark" asChild>
        <Pressable className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-900">
          <Text className="text-center text-base font-semibold text-gray-900 dark:text-white">
            List item states benchmark
          </Text>
          <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            200 items with selected, disabled, unread, highlighted, loading, new flags
          </Text>
        </Pressable>
      </Link>
```

- [ ] **Step 5: Commit list item states implementation**

```bash
git add src/hooks/useListItemStatesToggle.ts src/app/list-item-states-benchmark.tsx src/app/index.tsx
git commit -m "feat: add list item states benchmark with stress mode

- Implement state toggle hook for 200 list items
- Create benchmark screen with engine switcher and metrics
- Add home screen link

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: Create skeleton transition data and row components

**Files:**
- Create: `src/data/skeletonRows.ts`
- Create: `src/benchmark/skeletonTransitionRowViews.tsx`

- [ ] **Step 1: Create skeleton transition data types and generators**

```typescript
// src/data/skeletonRows.ts

export type SkeletonRow =
  | { id: string; state: "skeleton" }
  | {
      id: string;
      state: "content";
      title: string;
      subtitle: string;
      height: number;
    };

const TITLES = [
  "Loading content...", "Please wait...", "Fetching data...",
  "Almost there...", "Processing request...", "Retrieving information...",
  "Dashboard Overview", "User Profile", "Settings Panel",
  "Analytics Report", "Activity Feed", "Notification Center",
  "Message List", "Task Manager", "Calendar View", "File Explorer",
  "Search Results", "Help Center", "Documentation", "Support Chat",
  "Account Settings", "Privacy Controls", "Security Options", "Billing Info",
  "Subscription Details", "Payment Methods", "Invoice History", "Usage Stats",
  "API Keys", "Webhooks", "Integrations", "Connected Apps",
  "Team Members", "Permissions", "Audit Log", "Login History",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeSkeletonRows(count: number): SkeletonRow[] {
  const rows: SkeletonRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: `skeleton-${i}`,
      state: "skeleton",
    });
  }
  return rows;
}

export function cycleSkeletonTransitions(
  prev: SkeletonRow[],
  percentage: number,
  seed: number,
): SkeletonRow[] {
  const countToToggle = Math.floor(prev.length * percentage);
  const indicesToToggle: number[] = [];

  for (let i = 0; i < prev.length; i++) {
    const rand = seededRandom(seed + i * 100);
    if (rand < percentage && indicesToToggle.length < countToToggle) {
      indicesToToggle.push(i);
    }
  }

  return prev.map((row, idx) => {
    if (!indicesToToggle.includes(idx)) return row;

    // Toggle between skeleton and content
    if (row.state === "skeleton") {
      const heightSeed = seed + idx * 200;
      const height = 40 + Math.floor(seededRandom(heightSeed) * 60); // 40-100px
      const titleIndex = Math.floor(seededRandom(heightSeed + 1) * TITLES.length);
      return {
        id: row.id,
        state: "content",
        title: TITLES[titleIndex],
        subtitle: `Additional details for item ${idx + 1}`,
        height,
      };
    } else {
      return {
        id: row.id,
        state: "skeleton",
      };
    }
  });
}
```

- [ ] **Step 2: Create skeleton transition row components**

```typescript
// src/benchmark/skeletonTransitionRowViews.tsx

import { memo, useEffect } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { StyleSheet as UnistylesSheet, useUnistyles } from "react-native-unistyles";

import type { SkeletonRow } from "../data/skeletonRows";

const hairline = StyleSheet.hairlineWidth;

// Skeleton animation component
function SkeletonPulse({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(1));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return <Animated.View style={{ opacity: opacity.current }}>{children}</Animated.View>;
}

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: "#e5e7eb",
  },
  skeletonRow: {
    height: 60,
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  skeletonBar: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
  skeletonBarShort: {
    width: "60%",
    marginTop: 8,
  },
  contentRow: {
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
});

export function SkeletonTransitionRowRN({ item }: { item: SkeletonRow }) {
  if (item.state === "skeleton") {
    return (
      <SkeletonPulse>
        <View style={rnStyles.skeletonRow}>
          <View style={rnStyles.skeletonBar} />
          <View style={[rnStyles.skeletonBar, rnStyles.skeletonBarShort]} />
        </View>
      </SkeletonPulse>
    );
  }

  return (
    <View style={[rnStyles.contentRow, { height: item.height }]}>
      <Text style={rnStyles.title}>{item.title}</Text>
      <Text style={rnStyles.subtitle}>{item.subtitle}</Text>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  skeletonRow: {
    height: 60,
    justifyContent: "center",
    backgroundColor: theme.colors.muted,
  },
  skeletonBar: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
  },
  skeletonBarShort: {
    width: "60%",
    marginTop: 8,
  },
  contentRow: {
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
}));

export function SkeletonTransitionRowUnistyles({ item }: { item: SkeletonRow }) {
  if (item.state === "skeleton") {
    return (
      <SkeletonPulse>
        <View style={uniStyles.skeletonRow}>
          <View style={uniStyles.skeletonBar} />
          <View style={[uniStyles.skeletonBar, uniStyles.skeletonBarShort]} />
        </View>
      </SkeletonPulse>
    );
  }

  return (
    <View style={[uniStyles.contentRow, { height: item.height }]}>
      <Text style={uniStyles.title}>{item.title}</Text>
      <Text style={uniStyles.subtitle}>{item.subtitle}</Text>
    </View>
  );
}

// Uniwind variant
export function SkeletonTransitionRowUniwind({ item }: { item: SkeletonRow }) {
  if (item.state === "skeleton") {
    return (
      <SkeletonPulse>
        <View className="h-[60px] justify-center bg-gray-100 dark:bg-gray-800 py-2.5 px-3 border-b border-gray-200 dark:border-gray-700">
          <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
          <View className="h-3 w-3/5 bg-gray-300 dark:bg-gray-600 rounded mt-2" />
        </View>
      </SkeletonPulse>
    );
  }

  return (
    <View
      className="justify-center py-2.5 px-3 border-b border-gray-200 dark:border-gray-700"
      style={{ height: item.height }}
    >
      <Text className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
        {item.title}
      </Text>
      <Text className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">
        {item.subtitle}
      </Text>
    </View>
  );
}

const SkeletonTransitionRowRNMemo = memo(SkeletonTransitionRowRN);
const SkeletonTransitionRowUnistylesMemo = memo(SkeletonTransitionRowUnistyles);
const SkeletonTransitionRowUniwindMemo = memo(SkeletonTransitionRowUniwind);

export { SkeletonTransitionRowRNMemo as SkeletonTransitionRowRN };
export { SkeletonTransitionRowUnistylesMemo as SkeletonTransitionRowUnistyles };
export { SkeletonTransitionRowUniwindMemo as SkeletonTransitionRowUniwind };
```

- [ ] **Step 3: Commit skeleton transition implementation**

```bash
git add src/data/skeletonRows.ts src/benchmark/skeletonTransitionRowViews.tsx
git commit -m "feat: add skeleton transition benchmark data and row components

- Add SkeletonRow type with skeleton/content states
- Implement deterministic cycling for layout thrash testing
- Create 3 engine variants with animated skeleton pulse effect
- Variable content heights (40-100px) to stress layout changes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: Create skeleton transition hook and screen

**Files:**
- Create: `src/hooks/useSkeletonTransition.ts`
- Create: `src/app/skeleton-transition-benchmark.tsx`

- [ ] **Step 1: Implement stress mode hook**

```typescript
// src/hooks/useSkeletonTransition.ts

import { useEffect, useRef, useState } from "react";

import type { SkeletonRow } from "../data/skeletonRows";
import { cycleSkeletonTransitions, makeSkeletonRows } from "../data/skeletonRows";

interface UseSkeletonTransitionConfig {
  rowCount: number;
  updateInterval: number;
  updatePercentage: number;
  enabled: boolean;
  maxUpdates?: number;
}

export function useSkeletonTransition(config: UseSkeletonTransitionConfig) {
  const {
    rowCount,
    updateInterval,
    updatePercentage,
    enabled,
    maxUpdates = 1000,
  } = config;

  const [rows, setRows] = useState<SkeletonRow[]>(() => makeSkeletonRows(rowCount));
  const [updateCount, setUpdatesCount] = useState(0);
  const seedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRows(makeSkeletonRows(rowCount));
    setUpdatesCount(0);
    seedRef.current = 0;
  }, [rowCount]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (updateCount >= maxUpdates) {
      return;
    }

    intervalRef.current = setInterval(() => {
      seedRef.current++;
      setRows((prev) =>
        cycleSkeletonTransitions(prev, updatePercentage, seedRef.current),
      );
      setUpdatesCount((c) => c + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, updatePercentage, updateCount, maxUpdates]);

  return { rows, updateCount, maxUpdates };
}
```

- [ ] **Step 2: Create benchmark screen and update home**

```typescript
// src/app/skeleton-transition-benchmark.tsx

import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  SkeletonTransitionRowRN,
  SkeletonTransitionRowUnistyles,
  SkeletonTransitionRowUniwind,
} from "../benchmark/skeletonTransitionRowViews";
import { EngineRadioGroup } from "../components/EngineRadioGroup";
import { RenderTimeLabel } from "../components/RenderTimeLabel";
import { useStylingEngine } from "../context/StylingEngineContext";
import type { SkeletonRow } from "../data/skeletonRows";
import { useRenderMeasurement } from "../hooks/useRenderMeasurement";
import { useFrameRateMonitor } from "../hooks/useFrameRateMonitor";
import { useSkeletonTransition } from "../hooks/useSkeletonTransition";

const MetricsDisplay = memo(function MetricsDisplay({
  lastMs,
  fps,
  dropsPerMinute,
  updateCount,
  maxUpdates,
  stressEnabled,
  onToggleStress,
}: {
  lastMs: number | null;
  fps: number;
  dropsPerMinute: number;
  updateCount: number;
  maxUpdates: number;
  stressEnabled: boolean;
  onToggleStress: () => void;
}) {
  return (
    <View className="gap-2 border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-800">
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        100 rows cycling between skeleton (60px) and content (40-100px)
      </Text>
      <EngineRadioGroup />
      <RenderTimeLabel lastMs={lastMs} />
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 dark:text-gray-300">
          FPS: {fps} | Drops: {dropsPerMinute}/min
        </Text>
        <Pressable
          onPress={onToggleStress}
          className={`rounded-lg px-3 py-1.5 ${
            stressEnabled
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              stressEnabled
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {stressEnabled ? "Stop Stress" : "Start Stress"} ({updateCount}/
            {maxUpdates})
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function SkeletonTransitionBenchmarkScreen() {
  const { engine, setEngine } = useStylingEngine();
  const [stressEnabled, setStressEnabled] = useState(false);

  const { rows, updateCount, maxUpdates } = useSkeletonTransition({
    rowCount: 100,
    updateInterval: 300,
    updatePercentage: 0.25,
    enabled: stressEnabled,
  });

  const { lastMs, markStart } = useRenderMeasurement(engine, updateCount);
  const { fps, dropsPerMinute } = useFrameRateMonitor(stressEnabled);

  const renderItem = useCallback(
    ({ item }: { item: SkeletonRow }) => {
      switch (engine) {
        case "stylesheet":
          return <SkeletonTransitionRowRN item={item} />;
        case "unistyles":
          return <SkeletonTransitionRowUnistyles item={item} />;
        case "uniwind":
          return <SkeletonTransitionRowUniwind item={item} />;
      }
    },
    [engine],
  );

  const rowsDisplay = useMemo(() => rows, [rows]);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <MetricsDisplay
        lastMs={lastMs}
        fps={fps}
        dropsPerMinute={dropsPerMinute}
        updateCount={updateCount}
        maxUpdates={maxUpdates}
        stressEnabled={stressEnabled}
        onToggleStress={() => {
          markStart();
          setStressEnabled((v) => !v);
        }}
      />
      <FlatList
        data={rowsDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={engine}
        initialNumToRender={14}
        windowSize={7}
      />
    </View>
  );
}
```

- [ ] **Step 3: Add missing imports**

```typescript
import { useState } from "react";
```

- [ ] **Step 4: Update home screen**

```typescript
// In src/app/index.tsx, after list-item-states-benchmark Link, add:

      <Link href="/skeleton-transition-benchmark" asChild>
        <Pressable className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-900">
          <Text className="text-center text-base font-semibold text-gray-900 dark:text-white">
            Skeleton transition benchmark
          </Text>
          <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            100 rows cycling between skeleton placeholders and variable-height content
          </Text>
        </Pressable>
      </Link>
```

- [ ] **Step 5: Commit skeleton transition implementation**

```bash
git add src/hooks/useSkeletonTransition.ts src/app/skeleton-transition-benchmark.tsx src/app/index.tsx
git commit -m "feat: add skeleton transition benchmark with stress mode

- Implement skeleton/content cycling hook for 100 rows
- Create benchmark screen testing layout thrashing
- Add home screen link

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: Update README with new benchmarks

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update benchmarks table**

```markdown
# Update the scenarios table in README.md

| Scenario | What it stresses | Status in this app |
|----------|------------------|-------------------|
| **Long list** | Many rows, varied static styles, scroll + re-renders when switching engines | **Implemented** — *Static list benchmark* |
| **List with realtime data** | Frequent updates (prices/fields), list churn, re-renders | **Implemented** — *Realtime list benchmark* |
| **Realtime + directional flash** | Same data path as realtime, plus a **green/red background flash** when price or change % moves up/down; the tint **fades in and out** via React Native `Animated` **on the background layer only** (numeric text stays fully opaque for readability) | **Implemented** — *Realtime flash benchmark* |
| **User states** | Multiple boolean flag combinations (premium, verified, muted, notification, new) affecting borders, colors, badges, icons | **Implemented** — *User states benchmark* |
| **Form validation** | Form field state combinations (error, warning, success, disabled, focused, filled) changing borders, background colors, helper text, icons | **Implemented** — *Form validation benchmark* |
| **List item states** | Row-level state permutations (selected, disabled, unread, highlighted, loading, new) with badges, overlays, opacity changes | **Implemented** — *List item states benchmark* |
| **Skeleton → content** | Layout dimension changes during transitions from fixed-height skeleton to variable-height content (40-100px) | **Implemented** — *Skeleton transition benchmark* |
```

- [ ] **Step 2: Add stress mode documentation section**

```markdown
# Add after the Data section in README.md

---

## Stress Mode

All benchmark screens include a **stress mode** toggle that simulates aggressive state changes:

- **User states**: Toggles flags on 20% of rows every 200ms
- **Form validation**: Cycles validation states on all fields every 150ms
- **List item states**: Changes states on 10% of rows every 100ms
- **Skeleton transition**: Cycles skeleton → content → skeleton on 25% of rows every 300ms

Stress mode uses **deterministic (seeded) random** for consistent testing across engines. Each stress mode auto-disables after 1000 updates to prevent runaway loops. Monitor frame drops and render times during stress mode to see how each engine handles rapid changes.
```

- [ ] **Step 3: Add metrics documentation section**

```markdown
# Add after Stress Mode section in README.md

---

## Metrics Display

Each benchmark screen displays:

- **Last render time**: Approximate JS-side render time (same device/session only)
- **FPS**: Current frames per second (measured via react-native-reanimated)
- **Frame drops**: Drops per minute (more than 2 frames at 60fps = ~33.3ms)
- **Update count**: Number of stress mode updates applied (x/1000)

For accurate comparisons, always:
1. Use the same device
2. Use Release builds (Debug has too much noise)
3. Kill and relaunch app between engine tests
4. Run each benchmark for the full stress cycle when comparing
```

- [ ] **Step 4: Update results documentation section**

```markdown
# Update the "What to watch when benchmarking" section in README.md

## What to watch when benchmarking

When comparing engines, pay attention to:

- **Initial render time**: How long it takes to render the full list on first load
- **Re-render time during stress**: Average render time when states are changing rapidly
- **Frame drops**: Count per minute during stress mode (lower is better)
- **Scroll smoothness**: Subjective assessment during stress mode (1-5 scale)
- **Engine consistency**: Does one engine maintain better performance under stress?

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
```

- [ ] **Step 5: Commit README updates**

```bash
git add README.md
git commit -m "docs: update README with new benchmark documentation

- Add 4 new scenarios to benchmarks table
- Document stress mode behavior for each benchmark
- Explain metrics display and measurement methodology
- Add comparison template for results

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 13: Final verification and testing

**Files:**
- All created files

- [ ] **Step 1: Verify TypeScript compilation**

```bash
# Run TypeScript compiler to check for type errors
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 2: Verify app builds successfully**

```bash
# Start Metro bundler to verify no import errors
bunx expo start --dev-client
```

Expected: Metro starts without errors, you can navigate to all 7 benchmark screens

- [ ] **Step 3: Manual testing checklist**

Navigate through each benchmark screen and verify:

1. **User States Benchmark** (`/user-states-benchmark`)
   - [ ] Engine switcher works (RN/Unistyles/Uniwind)
   - [ ] 100 rows render with various flag combinations
   - [ ] Stress mode toggle starts/stops updates
   - [ ] Render time displays correctly
   - [ ] Frame rate monitor shows FPS and drops

2. **Form Validation Benchmark** (`/form-validation-benchmark`)
   - [ ] Engine switcher works
   - [ ] 50 form fields with different validation states
   - [ ] Stress mode cycles through states
   - [ ] Disabled fields are not editable
   - [ ] Metrics display correctly

3. **List Item States Benchmark** (`/list-item-states-benchmark`)
   - [ ] Engine switcher works
   - [ ] 200 list items render
   - [ ] Checkbox shows selected state
   - [ ] Badges display (NEW, unread dot)
   - [ ] Loading spinner shows when isLoading
   - [ ] Stress mode works

4. **Skeleton Transition Benchmark** (`/skeleton-transition-benchmark`)
   - [ ] Engine switcher works
   - [ ] 100 rows start as skeletons (60px height)
   - [ ] Stress mode transitions to content (40-100px height)
   - [ ] Skeleton pulse animation works
   - [ ] Layout changes are visible

- [ ] **Step 4: Test stress mode auto-disable**

Each benchmark should stop stress mode after 1000 updates:

1. Enable stress mode on any benchmark
2. Wait for update count to reach 1000/1000
3. Verify updates stop automatically
4. Verify you can re-enable stress mode after it stops

- [ ] **Step 5: Create final implementation commit**

```bash
git add .
git commit -m "feat: complete styling benchmark use cases implementation

All 4 new benchmarks are fully implemented and tested:
- User states: 100 profiles with 5 boolean flags
- Form validation: 50 fields with 6 validation states
- List item states: 200 items with 6 state flags
- Skeleton transition: 100 rows with layout dimension changes

Each benchmark includes:
- 3 engine variants (RN StyleSheet, Unistyles, Uniwind)
- Stress mode with deterministic random for consistent testing
- Metrics display (render time, FPS, frame drops, update count)
- Auto-disable after 1000 updates

Home screen updated with links to all benchmarks.
README documentation completed with testing methodology.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ User states benchmark with 5 boolean flags — Tasks 2-4
- ✅ Form validation benchmark with 6 states — Tasks 6-7
- ✅ List item states benchmark with 6 flags — Tasks 8-9
- ✅ Skeleton transition benchmark with layout changes — Tasks 10-11
- ✅ Frame rate monitoring hook — Task 1
- ✅ Stress mode for all benchmarks — Tasks 3, 7, 9, 11
- ✅ Metrics display (render time, FPS, drops, updates) — All benchmark screens
- ✅ Home screen updated with links — Tasks 5, 7, 9, 11
- ✅ README documentation — Task 12
- ✅ Testing and verification — Task 13

**Placeholder scan:**
- ✅ No TBD, TODO, or "implement later" found
- ✅ All code is complete with actual implementations
- ✅ All file paths are exact
- ✅ All commands include expected output

**Type consistency:**
- ✅ `UserStateRow` type consistent across data, hook, components
- ✅ `FormValidationRow` type consistent
- ✅ `ListItemStateRow` type consistent
- ✅ `SkeletonRow` type consistent (discriminated union)
- ✅ Hook parameter interfaces match usage
- ✅ Component props match data types
- ✅ State names match across implementations (isPremium, isVerified, etc.)

**Architecture alignment:**
- ✅ Follows existing benchmark patterns from `realtimeFlashRowViews.tsx`
- ✅ Reuses `EngineRadioGroup` and `RenderTimeLabel` components
- ✅ Uses existing `useRenderMeasurement` hook
- ✅ Follows same screen structure (header with metrics, FlatList below)
- ✅ Uses `memo` for row components
- ✅ Uses `useCallback` and `useMemo` for optimization

All requirements from the spec are implemented with complete code. Ready for execution.
