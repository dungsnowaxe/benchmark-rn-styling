import '../global.css';

import { Stack } from 'expo-router';

import { AnimationEngineProvider } from '../context/animation-engine-context';
import { StylingEngineProvider } from '../context/styling-engine-context';

export default function RootLayout() {
  return (
    <StylingEngineProvider>
      <AnimationEngineProvider>
        <Stack
          screenOptions={{
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="static-benchmark" options={{ title: 'Static benchmark' }} />
          <Stack.Screen name="realtime-benchmark" options={{ title: 'Realtime benchmark' }} />
          <Stack.Screen
            name="realtime-flash-benchmark"
            options={{ title: 'Realtime flash benchmark' }}
          />
          <Stack.Screen
            name="animation-engine-benchmark"
            options={{ title: 'Animation engine benchmark' }}
          />
          <Stack.Screen name="user-states-benchmark" options={{ title: 'User states benchmark' }} />
          <Stack.Screen
            name="form-validation-benchmark"
            options={{ title: 'Form validation benchmark' }}
          />
          <Stack.Screen
            name="list-item-states-benchmark"
            options={{ title: 'List item states benchmark' }}
          />
          <Stack.Screen
            name="skeleton-transition-benchmark"
            options={{ title: 'Skeleton transition benchmark' }}
          />
        </Stack>
      </AnimationEngineProvider>
    </StylingEngineProvider>
  );
}
