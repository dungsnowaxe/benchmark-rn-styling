import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7515/ingest/4838cb07-8a72-4146-a32f-c2a545694663', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '121416',
      },
      body: JSON.stringify({
        sessionId: '121416',
        runId: 'renderer-preload',
        location: 'index.tsx:HomeScreen-mounted',
        message: 'home_screen_mounted',
        data: {},
        timestamp: Date.now(),
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black">
      <View className="gap-4 px-6 py-10">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Styling benchmark</Text>
        <Text className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
          Compare React Native StyleSheet, Unistyles v3, and Uniwind on static and updating lists.
          Use the radio group on each screen to switch engines; render times are approximate (same
          device/session).
        </Text>

        <Link href="/static-benchmark" asChild>
          <Pressable className="rounded-xl bg-blue-600 px-4 py-3 active:opacity-90">
            <Text className="text-center text-base font-semibold text-white">
              Static list benchmark
            </Text>
          </Pressable>
        </Link>

        <Link href="/realtime-benchmark" asChild>
          <Pressable className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-900">
            <Text className="text-center text-base font-semibold text-gray-900 dark:text-white">
              Realtime list benchmark
            </Text>
          </Pressable>
        </Link>

        <Link href="/realtime-flash-benchmark" asChild>
          <Pressable className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-900">
            <Text className="text-center text-base font-semibold text-gray-900 dark:text-white">
              Realtime flash benchmark
            </Text>
            <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
              Same feed as realtime; green/red flash behind price and % when they move
            </Text>
          </Pressable>
        </Link>

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

        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}
