module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-unistyles/plugin',
        {
          // Process Unistyles StyleSheet.create under src/
          root: 'src',
        },
      ],
    ],
  };
};
