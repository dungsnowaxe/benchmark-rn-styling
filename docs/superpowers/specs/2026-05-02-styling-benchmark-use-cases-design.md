# Styling Benchmark Use Cases Design

**Date:** 2026-05-02
**Status:** Approved
**Author:** Claude (Snowaxe)

## Overview

This document describes the design for 4 new benchmark scenarios to expand the styling library comparison suite beyond the existing 3 use cases (static list, realtime data, realtime flash). The new benchmarks will test **conditional/complex style logic** and **layout thrashing** — two areas where styling engines show meaningful performance differences.

## Goals

1. Test how each styling engine (React Native StyleSheet, react-native-unistyles, Uniwind) handles:
   - Multiple boolean flag combinations affecting styles
   - Layout dimension changes during content transitions
   - Rapid state changes under stress conditions

2. Provide actionable, isolated metrics for each pattern

3. Follow the existing benchmark pattern for consistency and easy comparison

## Non-Goals

- Web platform support (iOS/Android native only)
- Production app features (these are focused performance tests)
- Automated CI/CD benchmarking (manual device testing only)

---

## Proposed Benchmarks

### 1. User States Benchmark

**What it tests:** Style engine performance with multiple boolean flag combinations

**Scenario:**

- 100-item list of user profiles
- Each row has combinations of:
  - `isPremium`, `isVerified`, `isMuted`, `hasNotification`, `isNew`
- Each flag changes borders, colors, badges, icons
- Stress mode: Deterministically toggles flags on 20% of rows every 200ms (using seeded random for consistency)

**Real-world parallel:** Social feeds, messaging apps, admin panels

**File structure:**

- `src/benchmark/userStatesRowViews.tsx`
- `src/data/userStatesRows.ts`
- `src/hooks/useUserStatesToggle.ts`
- `src/app/user-states-benchmark.tsx`

---

### 2. Form Validation Benchmark

**What it tests:** Conditional style performance on form inputs

**Scenario:**

- 50 form fields with validation state combinations
- States: `error`, `warning`, `success`, `disabled`, `focused`, `filled`
- Each combination changes borders, background colors, helper text, icons
- Stress mode: Deterministically cycles through validation states on all fields every 150ms (predictable state sequence)

**Real-world parallel:** Registration forms, settings screens, data entry workflows

**File structure:**

- `src/benchmark/formValidationRowViews.tsx`
- `src/data/formValidationRows.ts`
- `src/hooks/useFormValidationToggle.ts`
- `src/app/form-validation-benchmark.tsx`

---

### 3. List Item States Benchmark

**What it tests:** Row-level state permutations (closest to skeleton loading use case)

**Scenario:**

- 200-item list with row state combinations
- States: `isSelected`, `isDisabled`, `hasUnread`, `isHighlighted`, `isLoading`, `isNew`
- Each combination adds/removes badges, overlays, opacity changes
- Stress mode: Deterministically changes states on 10% of rows every 100ms (using seeded random for consistency)

**Real-world parallel:** Email apps, task lists, file managers, notification feeds

**File structure:**

- `src/benchmark/listItemStatesRowViews.tsx`
- `src/data/listItemStatesRows.ts`
- `src/hooks/useListItemStatesToggle.ts`
- `src/app/list-item-states-benchmark.tsx`

---

### 4. Skeleton → Content Benchmark

**What it tests:** Layout thrashing during dimension changes

**Scenario:**

- 100 rows that transition from skeleton to actual content
- Skeleton: Fixed dimensions (60px height), gray background with opacity pulse animation (no text content)
- Content: Variable heights (40-100px range based on content length), actual text/images, different padding
- Stress mode: Deterministically cycles skeleton → content → skeleton on 25% of rows every 300ms (consistent set of rows)

**Real-world parallel:** Loading states in feeds, detail pages, dashboards

**File structure:**

- `src/benchmark/skeletonTransitionRowViews.tsx`
- `src/data/skeletonRows.ts`
- `src/hooks/useSkeletonTransition.ts`
- `src/app/skeleton-transition-benchmark.tsx`

---

## Architecture

### Directory Structure

```
src/
├── benchmark/
│   ├── userStatesRowViews.tsx      # New
│   ├── formValidationRowViews.tsx  # New
│   ├── listItemStatesRowViews.tsx  # New
│   └── skeletonTransitionRowViews.tsx # New
├── data/
│   ├── userStatesRows.ts           # New
│   ├── formValidationRows.ts       # New
│   ├── listItemStatesRows.ts       # New
│   └── skeletonRows.ts             # New
├── hooks/
│   ├── useUserStatesToggle.ts      # New
│   ├── useFormValidationToggle.ts  # New
│   ├── useListItemStatesToggle.ts  # New
│   ├── useSkeletonTransition.ts    # New
│   └── useFrameRateMonitor.ts      # New (shared)
└── app/
    ├── user-states-benchmark.tsx   # New
    ├── form-validation-benchmark.tsx # New
    ├── list-item-states-benchmark.tsx # New
    └── skeleton-transition-benchmark.tsx # New
```

### Data Flow

1. Mock data generator creates initial row array
2. Row component (3 variants: RN/Unistyles/Uniwind) renders based on active engine
3. FlatList displays rows with measurement wrapper
4. Stress mode hook updates row data at configured intervals
5. Metrics hooks capture and display performance data

### Component Pattern

Each benchmark screen includes:

- Engine switcher radio group (reuse existing `EngineRadioGroup`)
- "Enable Stress Mode" toggle button
- Metrics display (initial render, re-render, frame drops, update count)
- FlatList with measurement wrapper (reuse existing `useRenderMeasurement`)

---

## Metrics Capture

All benchmarks will capture and display:

1. **Initial render time** — Existing `useRenderMeasurement` hook
2. **Re-render time** — Same hook, triggered on stress mode updates
3. **Frame drops** — New `useFrameRateMonitor` hook using react-native-reanimated
4. **Update count** — Tracked within each stress mode hook

**Display format:**

```
Last render: ~8ms  |  Frame drops: 2/min  |  Updates: 145
Stress Mode: [ENABLED]
```

### Memory Profiling

Memory metrics will be documented in README:

- iOS: Use Xcode Instruments
- Android: Use Android Profiler
- No inline memory display (platform-specific complexity)

---

## Stress Mode Implementation

### Base Pattern

Each stress mode hook will:

```typescript
interface StressModeConfig {
  enabled: boolean;
  updateInterval: number; // ms
  updatePercentage: number; // 0-1, % of rows to update
  maxUpdates?: number; // Safety cap
}
```

- Use `setInterval` to modify row data at configured frequency
- Update rows immutably (create new objects/arrays)
- Track update count and last update timestamp
- Clean up interval on unmount

### Safety Features

- Auto-disable if 5+ consecutive frame drops (device can't keep up)
- Maximum update caps (default: 1000 updates, then stop)
- Interval cleanup guaranteed via `useEffect` return

### Platform Considerations

- Frame rate monitoring uses `react-native-reanimated`'s `useFrameCallback` for native FPS accuracy
- No web-specific code or platform checks needed

---

## Error Handling

### Data Validation

- Mock data generators create valid combinations only
- No impossible states (e.g., `disabled && focused` for form inputs)
- Type-safe interfaces for all row data
- Fallback to default styles if invalid state encountered

### Engine Crash Recovery

- Wrap engine rendering in try-catch
- If an engine throws, display error message in UI instead of crashing screen
- Log errors to console with engine name and row data for debugging

---

## Testing Methodology

### Benchmark Execution Order

For consistent, comparable results:

1. **Cold start** — Fresh app launch, navigate to benchmark screen, measure initial render
2. **Baseline** — Run for 10 seconds with no stress mode, capture steady-state metrics
3. **Stress test** — Enable stress mode, run for 30 seconds, capture peak/average metrics
4. **Recovery** — Disable stress mode, verify metrics return to baseline

### Device Testing

- Test on at least 2 devices (low-end and high-end)
- Run in **Release builds only** (Debug builds have too much noise)
- Kill and relaunch app between engine tests (no cache/memory advantage)

### Results Documentation

For each benchmark + engine combination, document:

- Initial render time (ms)
- Average re-render time during stress mode (ms)
- Frame drop count per minute
- Subjective scroll smoothness (1-5 scale)
- Any anomalies or crashes

Create a comparison table in README for easy side-by-side analysis. Table format:
| Benchmark | Metric | StyleSheet | Unistyles | Uniwind |
|-----------|--------|------------|-----------|---------|
| User States | Initial render (ms) | 45 | 38 | 42 |
| ... | ... | ... | ... | ... |

---

## Implementation Notes

### Code Reuse

- Reuse `useRenderMeasurement` hook across all new benchmarks
- Reuse `EngineRadioGroup` component
- Copy measurement wrapper pattern from existing screens
- Follow same row component structure (3 engine variants per row type)

### New Utilities to Create

- `useFrameRateMonitor` — Tracks FPS and frame drops
- `useStressMode` — Base hook with shared interval logic (each benchmark configures parameters)
- 4 mock data generators (one per benchmark type)

### Complexity Estimate

- ~4-6 hours implementation time
- ~6 new row component files (3 engines × 4 benchmarks = 12 variants, organized into 4 files)
- ~4 new data files
- ~4 new hooks (one base + 4 specific implementations)
- ~4 new screen files

---

## Success Criteria

The implementation is successful when:

1. All 4 new benchmark screens exist and are accessible via navigation
2. Engine switching works on all screens (RN/Unistyles/Uniwind)
3. Stress mode toggles and updates rows at configured intervals
4. Metrics display correctly (render time, frame drops, update count)
5. No crashes or memory leaks during stress mode
6. Results can be compared across engines on the same device
7. README is updated with new benchmark descriptions and testing methodology

---

## Next Steps

After design approval:

1. Invoke `writing-plans` skill to create detailed implementation plan
2. Implement benchmarks in order (User States → Form Validation → List Item States → Skeleton)
3. Test on physical devices
4. Document results in README
5. Iterate if any engine shows unexpected behavior
