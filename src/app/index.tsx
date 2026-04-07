import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7515/ingest/4838cb07-8a72-4146-a32f-c2a545694663", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "121416",
      },
      body: JSON.stringify({
        sessionId: "121416",
        runId: "renderer-preload",
        location: "index.tsx:HomeScreen-mounted",
        message: "home_screen_mounted",
        data: {},
        timestamp: Date.now(),
        hypothesisId: "H3",
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <View className="flex-1 justify-center gap-4 bg-white px-6 dark:bg-black">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Styling benchmark
      </Text>
      <Text className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
        Compare React Native StyleSheet, Unistyles v3, and Uniwind on static and
        updating lists. Use the radio group on each screen to switch engines;
        render times are approximate (same device/session).
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

      <StatusBar style="auto" />
    </View>
  );
}
