const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'], // Include js files
    useTransformReact: true
  },
  transformer: {
    allowOptionalDependencies: true,
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
