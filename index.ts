// `@expo/metro-runtime` must stay first (Fast Refresh / bridge setup).
// Unistyles must run after metro-runtime and before any screen imports that use
// react-native-unistyles StyleSheet — avoids native events before RCTEventEmitter
// is registered (see expo-router entry-classic).
import "./src/lib/unistyles";
import "expo-router/entry";
