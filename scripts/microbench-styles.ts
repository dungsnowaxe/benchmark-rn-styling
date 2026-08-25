/**
 * Headless micro-benchmark approximating JS work during stress updates.
 * Not a substitute for on-device FPS / render timing.
 *
 * Run: bun scripts/microbench-styles.ts
 */
import { performance } from 'node:perf_hooks';

const StyleSheet = {
  create<T extends Record<string, object>>(styles: T): T {
    return styles;
  },
};

type Flags = {
  premium: boolean;
  verified: boolean;
  muted: boolean;
  notification: boolean;
  isNew: boolean;
};

function makeFlags(i: number): Flags {
  return {
    premium: i % 3 === 0,
    verified: i % 2 === 0,
    muted: i % 5 === 0,
    notification: i % 7 === 0,
    isNew: i % 4 === 0,
  };
}

const rn = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  rowMuted: { opacity: 0.5 },
  rowNew: { backgroundColor: '#fef3c7', borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
  avatarPremium: { backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#f59e0b' },
  username: { fontSize: 15, fontWeight: '600', color: '#111827' },
  usernameVerified: { color: '#2563eb' },
});

function styleSheetResolve(flags: Flags) {
  return [
    rn.row,
    flags.muted && rn.rowMuted,
    flags.isNew && rn.rowNew,
    rn.avatar,
    flags.premium && rn.avatarPremium,
    rn.username,
    flags.verified && rn.usernameVerified,
  ];
}

function uniwindClassName(flags: Flags) {
  return [
    'flex-row items-center px-3 py-2.5',
    flags.muted ? 'opacity-50' : '',
    flags.isNew ? 'border-l-[3px] border-amber-500 bg-amber-50' : '',
    'h-10 w-10 items-center justify-center rounded-full',
    flags.premium ? 'border-2 border-amber-500 bg-amber-50' : 'bg-gray-200',
    'text-[15px] font-semibold',
    flags.verified ? 'text-blue-600' : 'text-gray-900',
  ].join(' ');
}

function unistylesLikeResolve(flags: Flags, theme: { text: string; accent: string }) {
  return {
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: 10,
      paddingHorizontal: 12,
      opacity: flags.muted ? 0.5 : 1,
      backgroundColor: flags.isNew ? '#fef3c7' : 'transparent',
      borderLeftWidth: flags.isNew ? 3 : 0,
      borderLeftColor: flags.isNew ? '#f59e0b' : 'transparent',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: flags.premium ? '#fef3c7' : '#e5e7eb',
      borderWidth: flags.premium ? 2 : 0,
      borderColor: flags.premium ? '#f59e0b' : 'transparent',
    },
    username: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: flags.verified ? theme.accent : theme.text,
    },
  };
}

function bench(name: string, fn: () => void, iterations: number) {
  for (let i = 0; i < 100; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const ms = performance.now() - t0;
  return {
    name,
    totalMs: Number(ms.toFixed(2)),
    usPerUpdate: Number(((ms / iterations) * 1000).toFixed(2)),
    iterations,
  };
}

// Simulate user-states stress: 100 rows recomputed per update, 1000 updates.
const ROW_COUNT = 100;
const UPDATES = 1000;
const theme = { text: '#111827', accent: '#2563eb' };

function runSuite(resolve: (flags: Flags) => unknown) {
  let rows = Array.from({ length: ROW_COUNT }, (_, i) => makeFlags(i));
  return () => {
    rows = rows.map((f, i) => ({
      ...f,
      premium: (i + rows.length) % 3 === 0,
      verified: !f.verified,
      muted: (i + 1) % 5 === 0,
      notification: (i + 2) % 7 === 0,
      isNew: (i + 3) % 4 === 0,
    }));
    for (const f of rows) resolve(f);
  };
}

const results = [
  bench('StyleSheet resolve ×100 rows', runSuite(styleSheetResolve), UPDATES),
  bench(
    'Unistyles-like merge ×100 rows',
    runSuite((f) => unistylesLikeResolve(f, theme)),
    UPDATES,
  ),
  bench('Uniwind className ×100 rows', runSuite(uniwindClassName), UPDATES),
];

console.log(
  JSON.stringify(
    {
      kind: 'microbench-styles',
      note: 'JS-only style resolve cost for 100-row user-states stress shape; not FPS/layout',
      rowCount: ROW_COUNT,
      updates: UPDATES,
      results,
    },
    null,
    2,
  ),
);
