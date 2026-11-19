// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

// Layer rules of docs/03-ARCHITECTURE.md section 4, enforced by lint (task P2-01).
// ESLint keeps only the last matching value of a rule, so each directory gets one complete
// `no-restricted-imports` / `no-restricted-globals` list built from the pieces below.
const PLATFORM_IMPORT = {
  name: 'react-native',
  importNames: ['Platform'],
  message:
    'Platform is only for src/platform, src/ui and modules/. Put the difference behind src/platform.',
};
const HTTP_IMPORTS = ['axios', 'ky', 'got', 'superagent', 'node-fetch', 'cross-fetch'].map(
  (name) => ({
    name,
    message: 'No HTTP clients outside src/lib/api and src/features/*/api.',
  })
);
const HTTP_GLOBALS = ['fetch', 'XMLHttpRequest'].map((name) => ({
  name,
  message: 'No network calls outside src/lib/api and src/features/*/api (screen -> hook -> api).',
}));
const group = (dirs, message) => ({
  group: dirs.flatMap((d) => [`@/${d}`, `@/${d}/*`, `**/${d}/*`]),
  message,
});

// What each directory may NOT do, on top of the global rules. `null` = nothing extra.
const MAY_USE_PLATFORM = ['src/platform/**', 'src/ui/**', 'modules/**'];
const MAY_USE_HTTP = ['src/lib/api/**', 'src/features/*/api/**'];

function importRuleFor(dirMayHttp, dirMayPlatform, extraPatterns = []) {
  return [
    'error',
    {
      paths: [...(dirMayPlatform ? [] : [PLATFORM_IMPORT]), ...(dirMayHttp ? [] : HTTP_IMPORTS)],
      patterns: extraPatterns,
    },
  ];
}

function layerBoundaries() {
  const code = ['src/**/*.{ts,tsx}', 'modules/**/*.{ts,tsx}'];
  const appOnly = group(
    ['lib', 'db', 'sync', 'platform', 'content', 'locales'],
    'Routes in src/app import only from src/features, src/ui and src/theme. Move the logic into a screen.'
  );
  const uiOnly = group(
    ['features'],
    'src/ui is feature-free: primitives never import from src/features.'
  );
  return [
    {
      files: code,
      rules: {
        'no-restricted-imports': importRuleFor(false, false),
        'no-restricted-globals': ['error', ...HTTP_GLOBALS],
      },
    },
    {
      files: MAY_USE_HTTP,
      rules: {
        'no-restricted-imports': importRuleFor(true, false),
        'no-restricted-globals': 'off',
      },
    },
    {
      files: MAY_USE_PLATFORM,
      rules: { 'no-restricted-imports': importRuleFor(false, true) },
    },
    {
      files: ['src/ui/**'],
      rules: { 'no-restricted-imports': importRuleFor(false, true, [uiOnly]) },
    },
    {
      files: ['src/app/**'],
      rules: { 'no-restricted-imports': importRuleFor(false, false, [appOnly]) },
    },
  ];
}

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
  ...layerBoundaries(),
]);
