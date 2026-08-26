// Gesture Handler must load before navigation trees that may use it (expo-router).
import 'react-native-gesture-handler';
// `@expo/metro-runtime` must stay first among Expo runtime imports (Fast Refresh / bridge).
// Unistyles must run after metro-runtime and before any screen imports that use
// react-native-unistyles StyleSheet — avoids native events before RCTEventEmitter
// is registered (see expo-router entry-classic).
import './src/lib/unistyles';
import 'expo-router/entry';
