// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  globalIgnores([
    'dist/*',
    '.expo/*',
    'android/*',
    'ios/*',
    'coverage/*',
    // Synced, read-only copy of @bustandeen/core (linted in the web repo).
    'packages/core/*',
  ]),
  expoConfig,
  // Formatting is Prettier's job (same split as the web repo).
  prettierConfig,
  {
    rules: {
      // Same as the web repo. Logging goes through src/lib/logger (Phase 2).
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
]);
