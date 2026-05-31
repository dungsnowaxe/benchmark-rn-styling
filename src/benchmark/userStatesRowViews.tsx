import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StyleSheet as UnistylesSheet } from 'react-native-unistyles';

import type { UserStateRow } from '../data/userStatesRows';

const hairline = StyleSheet.hairlineWidth;

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: '#e5e7eb',
  },
  rowMuted: { opacity: 0.5 },
  rowNew: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPremium: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  content: { flex: 1, marginLeft: 12 },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  usernameVerified: {
    color: '#2563eb',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  badgePremium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeVerified: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeMuted: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeNotification: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeNew: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
});

function UserStateRowRNInner({ item }: { item: UserStateRow }) {
  const rowStyle = [
    rnStyles.row,
    item.isMuted && rnStyles.rowMuted,
    item.isNew && !item.isMuted && rnStyles.rowNew,
  ];

  const avatarStyle = [rnStyles.avatar, item.isPremium && rnStyles.avatarPremium];

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
          {item.isPremium && <Text style={rnStyles.badgePremium}>Premium</Text>}
          {item.isVerified && <Text style={rnStyles.badgeVerified}>Verified</Text>}
          {item.isMuted && <Text style={rnStyles.badgeMuted}>Muted</Text>}
          {item.hasNotification && <Text style={rnStyles.badgeNotification}>!</Text>}
          {item.isNew && <Text style={rnStyles.badgeNew}>NEW</Text>}
        </View>
      </View>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPremium: {
    backgroundColor: theme.colors.warningBg,
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  content: { flex: 1, marginLeft: 12 },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  usernameVerified: {
    color: theme.colors.accent,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  badgePremium: {
    backgroundColor: theme.colors.warningBg,
    color: theme.colors.warningText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeVerified: {
    backgroundColor: theme.colors.accentBg,
    color: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeMuted: {
    backgroundColor: theme.colors.muted,
    color: theme.colors.textMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeNotification: {
    backgroundColor: theme.colors.errorBg,
    color: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeNew: {
    backgroundColor: theme.colors.warningBg,
    color: theme.colors.warningText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '500',
  },
}));

function UserStateRowUnistylesInner({ item }: { item: UserStateRow }) {
  const rowStyle = [
    uniStyles.row,
    item.isMuted && uniStyles.rowMuted,
    item.isNew && !item.isMuted && uniStyles.rowNew,
  ];

  const avatarStyle = [uniStyles.avatar, item.isPremium && uniStyles.avatarPremium];

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
          {item.isPremium && <Text style={uniStyles.badgePremium}>Premium</Text>}
          {item.isVerified && <Text style={uniStyles.badgeVerified}>Verified</Text>}
          {item.isMuted && <Text style={uniStyles.badgeMuted}>Muted</Text>}
          {item.hasNotification && <Text style={uniStyles.badgeNotification}>!</Text>}
          {item.isNew && <Text style={uniStyles.badgeNew}>NEW</Text>}
        </View>
      </View>
    </View>
  );
}

// Uniwind variant
function UserStateRowUniwindInner({ item }: { item: UserStateRow }) {
  const rowBase = 'flex-row items-center px-3 py-2.5 border-b border-gray-200 dark:border-gray-700';
  const rowMods = item.isMuted
    ? 'opacity-50'
    : item.isNew
      ? 'bg-amber-50 dark:bg-amber-950/30 border-l-4 border-l-amber-500'
      : 'bg-white dark:bg-gray-950';

  const avatarBase =
    'w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center';
  const avatarMod = item.isPremium
    ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500'
    : '';

  const usernameBase = 'text-[15px] font-semibold';
  const usernameMod =
    item.isVerified && !item.isMuted
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-gray-900 dark:text-gray-100';

  const badgePremium =
    'px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  const badgeVerified =
    'px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  const badgeMuted =
    'px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  const badgeNotification =
    'px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  const badgeNew =
    'px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';

  return (
    <View className={`${rowBase} ${rowMods}`}>
      <View className={`${avatarBase} ${avatarMod}`}>
        <Text className="text-[20px]">{item.avatar}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className={`${usernameBase} ${usernameMod}`}>{item.username}</Text>
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

export const UserStateRowRN = memo(UserStateRowRNInner);
export const UserStateRowUnistyles = memo(UserStateRowUnistylesInner);
export const UserStateRowUniwind = memo(UserStateRowUniwindInner);
