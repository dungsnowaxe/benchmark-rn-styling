export type StaticRowVariant = 'a' | 'b' | 'c';

export type StaticRow = {
  id: string;
  label: string;
  value: string;
  variant: StaticRowVariant;
};

const LABELS = [
  'Balance',
  'Allocation',
  'Yield',
  'Latency',
  'Throughput',
  'Cache hit',
  'Heap',
  'Frame time',
];

export function buildStaticRows(count = 96): StaticRow[] {
  const rows: StaticRow[] = [];
  const variants: StaticRowVariant[] = ['a', 'b', 'c'];
  for (let i = 0; i < count; i++) {
    const variant = variants[i % 3];
    rows.push({
      id: `s-${i}`,
      label: `${LABELS[i % LABELS.length]} #${i}`,
      value: (1000 + i * 13.37).toFixed(2),
      variant,
    });
  }
  return rows;
}
