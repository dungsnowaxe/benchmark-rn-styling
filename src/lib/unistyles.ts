import { StyleSheet } from 'react-native-unistyles';

// #region agent log
fetch('http://127.0.0.1:7515/ingest/4838cb07-8a72-4146-a32f-c2a545694663', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Debug-Session-Id': '121416',
  },
  body: JSON.stringify({
    sessionId: '121416',
    runId: 'pre-fix',
    location: 'unistyles.ts:before-configure',
    message: 'unistyles_before_StyleSheet_configure',
    data: {},
    timestamp: Date.now(),
    hypothesisId: 'H1',
  }),
}).catch(() => {});
// #endregion

const lightTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f3f4f6',
    text: '#111827',
    textMuted: '#6b7280',
    accent: '#2563eb',
    accentBg: '#dbeafe',
    positive: '#16a34a',
    positiveBg: '#dcfce7',
    negative: '#dc2626',
    error: '#dc2626',
    errorBg: '#fee2e2',
    warning: '#d97706',
    warningBg: '#fef3c7',
    warningText: '#92400e',
    muted: '#f3f4f6',
    success: '#059669',
    successBg: '#d1fae5',
    border: '#e5e7eb',
    rowBand: '#eff6ff',
    flashPositiveBg: '#bbf7d0',
    flashNegativeBg: '#fecaca',
    flashText: '#111827',
  },
  gap: (n: number) => n * 4,
};

const darkTheme = {
  colors: {
    background: '#000000',
    surface: '#0f172a',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    accent: '#60a5fa',
    accentBg: '#1e3a5f',
    positive: '#4ade80',
    positiveBg: '#052e16',
    negative: '#f87171',
    error: '#f87171',
    errorBg: '#450a0a',
    warning: '#fbbf24',
    warningBg: '#451a03',
    warningText: '#fbbf24',
    muted: '#1f2937',
    success: '#34d399',
    successBg: '#022c22',
    border: '#374151',
    rowBand: '#1e3a5f',
    flashPositiveBg: '#166534',
    flashNegativeBg: '#991b1b',
    flashText: '#f9fafb',
  },
  gap: (n: number) => n * 4,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppThemes = { light: typeof lightTheme; dark: typeof darkTheme };
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
  settings: {
    adaptiveThemes: false,
    initialTheme: 'light',
  },
});

// #region agent log
fetch('http://127.0.0.1:7515/ingest/4838cb07-8a72-4146-a32f-c2a545694663', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Debug-Session-Id': '121416',
  },
  body: JSON.stringify({
    sessionId: '121416',
    runId: 'pre-fix',
    location: 'unistyles.ts:after-configure',
    message: 'unistyles_after_StyleSheet_configure',
    data: {},
    timestamp: Date.now(),
    hypothesisId: 'H1',
  }),
}).catch(() => {});
// #endregion
