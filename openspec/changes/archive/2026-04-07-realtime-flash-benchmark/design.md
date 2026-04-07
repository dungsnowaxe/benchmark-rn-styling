## Context

The app already implements `realtime-benchmark` with `useMockLiveRows`, optional Binance price on row 1, `EngineRadioGroup`, `useRenderMeasurement`, and three row implementations in `realtimeRowViews.tsx` (StyleSheet, Unistyles, Uniwind). This change adds a **sibling screen** that keeps that architecture but layers **directional flashes** on the **price** and **change %** text regions only.

## Goals / Non-Goals

**Goals:**

- Clone the realtime benchmark screen structure (data, list tuning, engine switch, render time).
- Track **previous** numeric values per row field to detect strictly **greater than** vs **less than** on each tick.
- Apply a **short-lived** green or red **background** on only the changing field’s text (or a tight wrapper), independent per field.
- Keep **readable contrast** in light (`white`/`gray` shell) and dark (`black`/`gray` shell) modes, ideally via shared tokens (Unistyles theme / Uniwind classes / RN constants).

**Non-Goals:**

- Changing requirements or UI of the existing **realtime** screen (unless a shared refactor is unavoidable—prefer duplication in flash-specific row components).
- Flashing the whole row, whole cell, or symbol column.
- Animating typography scale or color beyond background flash (fade timing optional, not required for v1).

## Decisions

1. **Where to store “previous” values**  
   **Choice:** Keep previous numbers in a `useRef` map keyed by stable row `id`, updated **after** computing flash direction for the current render (or in a layout effect keyed by row data tick).  
   **Alternatives:** Lift state into `useMockLiveRows` (pollutes generic hook) or compare in the parent only (still need per-row refs for O(1) lookup).  
   **Rationale:** Localizes benchmark-specific logic; avoids changing `LiveRow` type for the original realtime screen.

2. **How to scope “text background”**  
   **Choice:** Wrap each dynamic value in a small container (`View` or `Text` with horizontal padding) so the flash reads as a pill/chip behind tabular numbers.  
   **Alternatives:** `Text` `style={{ backgroundColor }}` without padding (tighter but can clip oddly).  
   **Rationale:** Matches “background of the text that changes” and improves legibility.

3. **Flash lifecycle**  
   **Choice:** On detected direction, set flash state (`up` | `down`) for that field; clear after a fixed duration (e.g. 250–400 ms) via `setTimeout` or `Animated` completion—simple `useEffect` per row field is acceptable if deduplicated to avoid timer storms (e.g. single reducer per list or per-row hook with cleanup).  
   **Alternatives:** Reanimated shared values (heavier dependency if not already used for this).  
   **Rationale:** Keeps implementation portable across three styling backends.

4. **Color/contrast**  
   **Choice:** Use **muted** green/red fills (e.g. pastels in light mode; deeper translucent reds/greens in dark mode) with **existing** text colors or one step higher contrast on the flashed region only if needed.  
   **Alternatives:** Border-only flash (lower visual noise but not “background”).  
   **Rationale:** Meets spec legibility without matching production trading-terminal saturation.

5. **Code organization**  
   **Choice:** New route file (e.g. `realtime-flash-benchmark.tsx`) plus **new** row components file (e.g. `realtimeFlashRowViews.tsx`) or namespaced exports to avoid `if (flash)` in shared hot paths.  
   **Rationale:** Clear diff and fair engine comparison on the flash screen only.

## Risks / Trade-offs

- **[Risk]** Timer-heavy flashes on 40 rows × 2 fields → many concurrent timers.  
  **Mitigation:** Batch per tick, cap concurrent clears, or store flash expiry in a single module-level tick counter keyed by row+field.

- **[Risk]** First render flashes incorrectly.  
  **Mitigation:** Initialize ref map from first snapshot without setting flash; only compare when `prev !== undefined`.

- **[Risk]** Binance + mock interleave causes double updates.  
  **Mitigation:** Comparison is purely numeric on displayed strings; unchanged value yields no flash.

- **[Trade-off]** Benchmark numbers vs plain realtime are **not directly comparable** due to extra style churn; document in UI copy or README if needed.

## Migration Plan

- Ship additively: new route + link; no data migration; rollback by removing route and link.

## Open Questions

- Exact flash duration (ms) and whether to use `Animated` opacity fade-out for polish (optional follow-up).
- Whether to expose flash tokens in Unistyles global theme only vs duplicated hex in RN StyleSheet for parity.
