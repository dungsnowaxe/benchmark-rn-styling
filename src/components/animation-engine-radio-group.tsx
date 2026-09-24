import { Pressable, Text, View } from 'react-native';

import { ANIMATION_ENGINE_LABELS, type AnimationEngine } from '../context/animation-engine-context';

const OPTIONS: AnimationEngine[] = ['ease', 'reanimated'];

type Props = {
  value: AnimationEngine;
  onChange: (next: AnimationEngine) => void;
};

export function AnimationEngineRadioGroup({ value, onChange }: Props) {
  return (
    <View className="flex-row flex-wrap gap-2 py-2">
      {OPTIONS.map((id) => {
        const selected = value === id;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            className={`flex-row items-center gap-2 rounded-lg border px-3 py-2 ${
              selected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
            }`}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View
              className={`h-4 w-4 rounded-full border-2 ${
                selected ? 'border-blue-600 bg-blue-600' : 'border-gray-400 dark:border-gray-500'
              }`}
            />
            <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {ANIMATION_ENGINE_LABELS[id]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
