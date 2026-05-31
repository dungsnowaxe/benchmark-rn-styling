import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StyleSheet as UnistylesSheet } from 'react-native-unistyles';

import type { LiveRow } from '../data/liveRows';

const hairline = StyleSheet.hairlineWidth;

const rnStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: '#e5e7eb',
  },
  rowA: { backgroundColor: '#ffffff' },
  rowB: { backgroundColor: '#eff6ff' },
  rowC: {
    backgroundColor: '#f9fafb',
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  sym: { width: 96, fontSize: 13, fontWeight: '600', color: '#111827' },
  symB: { color: '#1e40af' },
  symC: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: '#374151' },
  price: {
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  ch: { width: 72, textAlign: 'right', fontVariant: ['tabular-nums'], fontSize: 13 },
  chPos: { color: '#16a34a' },
  chNeg: { color: '#dc2626' },
});

function LiveRowRNInner({ item }: { item: LiveRow }) {
  const rowStyle = [
    rnStyles.row,
    item.variant === 'a' && rnStyles.rowA,
    item.variant === 'b' && rnStyles.rowB,
    item.variant === 'c' && rnStyles.rowC,
  ];
  const symStyle = [
    rnStyles.sym,
    item.variant === 'b' && rnStyles.symB,
    item.variant === 'c' && rnStyles.symC,
  ];
  const chStyle = [rnStyles.ch, item.changePct >= 0 ? rnStyles.chPos : rnStyles.chNeg];
  return (
    <View style={rowStyle}>
      <Text style={symStyle} numberOfLines={1}>
        {item.symbol}
      </Text>
      <Text style={rnStyles.price}>{item.price.toFixed(2)}</Text>
      <Text style={chStyle}>{item.changePct.toFixed(2)}%</Text>
    </View>
  );
}

export const LiveRowRN = memo(LiveRowRNInner);

const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  rowA: { backgroundColor: theme.colors.background },
  rowB: { backgroundColor: theme.colors.rowBand },
  rowC: {
    backgroundColor: theme.colors.surface,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  sym: { width: 96, fontSize: 13, fontWeight: '600', color: theme.colors.text },
  symB: { color: theme.colors.accent },
  symC: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: theme.colors.textMuted,
  },
  price: {
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  ch: {
    width: 72,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 13,
  },
  chPos: { color: theme.colors.positive },
  chNeg: { color: theme.colors.negative },
}));

function LiveRowUnistylesInner({ item }: { item: LiveRow }) {
  const rowStyle = [
    uniStyles.row,
    item.variant === 'a' && uniStyles.rowA,
    item.variant === 'b' && uniStyles.rowB,
    item.variant === 'c' && uniStyles.rowC,
  ];
  const symStyle = [
    uniStyles.sym,
    item.variant === 'b' && uniStyles.symB,
    item.variant === 'c' && uniStyles.symC,
  ];
  const chStyle = [uniStyles.ch, item.changePct >= 0 ? uniStyles.chPos : uniStyles.chNeg];
  return (
    <View style={rowStyle}>
      <Text style={symStyle} numberOfLines={1}>
        {item.symbol}
      </Text>
      <Text style={uniStyles.price}>{item.price.toFixed(2)}</Text>
      <Text style={chStyle}>{item.changePct.toFixed(2)}%</Text>
    </View>
  );
}

export const LiveRowUnistyles = memo(LiveRowUnistylesInner);

function LiveRowUniwindInner({ item }: { item: LiveRow }) {
  const row =
    item.variant === 'b'
      ? 'bg-blue-50 dark:bg-blue-950/50 border-b border-gray-200 dark:border-gray-700'
      : item.variant === 'c'
        ? 'border-b border-gray-200 bg-gray-50 pl-4 border-l-4 border-l-blue-600 dark:border-gray-700 dark:bg-gray-900/80'
        : 'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950';

  const sym =
    item.variant === 'a'
      ? 'w-24 text-sm font-semibold text-gray-900 dark:text-gray-100'
      : item.variant === 'b'
        ? 'w-24 text-sm font-semibold text-blue-900 dark:text-blue-200'
        : 'w-24 text-xs font-extrabold uppercase tracking-wide text-gray-700 dark:text-gray-300';

  const chColor =
    item.changePct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <View className={`flex-row items-center justify-between px-3 py-2 ${row}`}>
      <Text className={sym} numberOfLines={1}>
        {item.symbol}
      </Text>
      <Text className="flex-1 text-right tabular-nums text-[15px] font-semibold text-gray-900 dark:text-gray-100">
        {item.price.toFixed(2)}
      </Text>
      <Text className={`w-[72px] text-right tabular-nums text-sm ${chColor}`}>
        {item.changePct.toFixed(2)}%
      </Text>
    </View>
  );
}

export const LiveRowUniwind = memo(LiveRowUniwindInner);
