import { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { StyleSheet as UnistylesSheet } from 'react-native-unistyles';

import type { FormValidationRow } from '../data/formValidationRows';

const hairline = StyleSheet.hairlineWidth;

// React Native StyleSheet variant
const rnStyles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  inputWarning: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  inputSuccess: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  inputFilled: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperTextError: { color: '#dc2626' },
  helperTextWarning: { color: '#d97706' },
  helperTextSuccess: { color: '#16a34a' },
  helperTextDisabled: { color: '#9ca3af' },
  helperTextFocused: { color: '#2563eb' },
  helperTextFilled: { color: '#059669' },
});

function FormValidationRowRNInner({ item }: { item: FormValidationRow }) {
  const inputStyle = [
    rnStyles.input,
    item.state === 'error' && rnStyles.inputError,
    item.state === 'warning' && rnStyles.inputWarning,
    item.state === 'success' && rnStyles.inputSuccess,
    item.state === 'disabled' && rnStyles.inputDisabled,
    item.state === 'focused' && rnStyles.inputFocused,
    item.state === 'filled' && rnStyles.inputFilled,
  ];

  const helperTextStyle = [
    rnStyles.helperText,
    item.state === 'error' && rnStyles.helperTextError,
    item.state === 'warning' && rnStyles.helperTextWarning,
    item.state === 'success' && rnStyles.helperTextSuccess,
    item.state === 'disabled' && rnStyles.helperTextDisabled,
    item.state === 'focused' && rnStyles.helperTextFocused,
    item.state === 'filled' && rnStyles.helperTextFilled,
  ];

  return (
    <View style={rnStyles.container}>
      <Text style={rnStyles.label}>{item.label}</Text>
      <TextInput
        style={inputStyle}
        value={item.value}
        editable={item.state !== 'disabled'}
        placeholder={item.state === 'filled' ? '' : 'Enter value'}
      />
      <Text style={helperTextStyle}>{item.helperText}</Text>
    </View>
  );
}

// Unistyles variant
const uniStyles = UnistylesSheet.create((theme) => ({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorBg,
  },
  inputWarning: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningBg,
  },
  inputSuccess: {
    borderColor: theme.colors.positive,
    backgroundColor: theme.colors.positiveBg,
  },
  inputDisabled: {
    backgroundColor: theme.colors.muted,
    color: theme.colors.textMuted,
  },
  inputFocused: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentBg,
  },
  inputFilled: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successBg,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperTextError: { color: theme.colors.error },
  helperTextWarning: { color: theme.colors.warningText },
  helperTextSuccess: { color: theme.colors.positive },
  helperTextDisabled: { color: theme.colors.textMuted },
  helperTextFocused: { color: theme.colors.accent },
  helperTextFilled: { color: theme.colors.success },
}));

function FormValidationRowUnistylesInner({ item }: { item: FormValidationRow }) {
  const inputStyle = [
    uniStyles.input,
    item.state === 'error' && uniStyles.inputError,
    item.state === 'warning' && uniStyles.inputWarning,
    item.state === 'success' && uniStyles.inputSuccess,
    item.state === 'disabled' && uniStyles.inputDisabled,
    item.state === 'focused' && uniStyles.inputFocused,
    item.state === 'filled' && uniStyles.inputFilled,
  ];

  const helperTextStyle = [
    uniStyles.helperText,
    item.state === 'error' && uniStyles.helperTextError,
    item.state === 'warning' && uniStyles.helperTextWarning,
    item.state === 'success' && uniStyles.helperTextSuccess,
    item.state === 'disabled' && uniStyles.helperTextDisabled,
    item.state === 'focused' && uniStyles.helperTextFocused,
    item.state === 'filled' && uniStyles.helperTextFilled,
  ];

  return (
    <View style={uniStyles.container}>
      <Text style={uniStyles.label}>{item.label}</Text>
      <TextInput
        style={inputStyle}
        value={item.value}
        editable={item.state !== 'disabled'}
        placeholder={item.state === 'filled' ? '' : 'Enter value'}
      />
      <Text style={helperTextStyle}>{item.helperText}</Text>
    </View>
  );
}

// Uniwind variant
function FormValidationRowUniwindInner({ item }: { item: FormValidationRow }) {
  const inputBase = 'text-[15px] py-2 px-2.5 rounded-lg border bg-white dark:bg-gray-950';
  const inputMod =
    item.state === 'error'
      ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
      : item.state === 'warning'
        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
        : item.state === 'success'
          ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
          : item.state === 'disabled'
            ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 text-gray-400'
            : item.state === 'focused'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
              : item.state === 'filled'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-gray-300 dark:border-gray-600';

  const helperMod =
    item.state === 'error'
      ? 'text-red-600 dark:text-red-400'
      : item.state === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : item.state === 'success'
          ? 'text-green-600 dark:text-green-400'
          : item.state === 'disabled'
            ? 'text-gray-400'
            : item.state === 'focused'
              ? 'text-blue-600 dark:text-blue-400'
              : item.state === 'filled'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-600 dark:text-gray-400';

  return (
    <View className="py-2.5 px-3 border-b border-gray-200 dark:border-gray-700">
      <Text className="text-[14px] font-medium text-gray-700 dark:text-gray-200 mb-1">
        {item.label}
      </Text>
      <TextInput
        className={`${inputBase} ${inputMod}`}
        value={item.value}
        editable={item.state !== 'disabled'}
        placeholder={item.state === 'filled' ? '' : 'Enter value'}
        placeholderTextColor="#9ca3af"
      />
      <Text className={`text-[12px] mt-1 ${helperMod}`}>{item.helperText}</Text>
    </View>
  );
}

export const FormValidationRowRN = memo(FormValidationRowRNInner);
export const FormValidationRowUnistyles = memo(FormValidationRowUnistylesInner);
export const FormValidationRowUniwind = memo(FormValidationRowUniwindInner);
