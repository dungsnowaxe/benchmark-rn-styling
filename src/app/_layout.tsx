import '../global.css';

import { Stack } from 'expo-router';

import { StylingEngineProvider } from '../context/StylingEngineContext';

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
    location: '_layout.tsx:module-loaded',
    message: 'root_layout_module_evaluated_after_global_css',
    data: {},
    timestamp: Date.now(),
    hypothesisId: 'H2',
  }),
}).catch(() => {});
// #endregion

export default function RootLayout() {
  return (
    <StylingEngineProvider>
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
      </Stack>
    </StylingEngineProvider>
  );
}
