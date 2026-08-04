const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended');

module.exports = [
  ...expoConfig,
  eslintPluginPrettier,
  {
    ignores: ['dist/*', 'node_modules/*', 'ios/*', 'android/*', '.expo/*'],
  },
];
