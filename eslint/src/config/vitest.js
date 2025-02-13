const jestFormatting = require('eslint-plugin-jest-formatting');
const vitest = require('eslint-plugin-vitest');
const tseslint = require('typescript-eslint');
const { UNIT_INTEGRATION_TEST_FILE_PATTERNS } = require('../lib/patterns.js');
const { convertErrorsToWarnings } = require('../lib/utils.js');

module.exports = tseslint.config({
  files: UNIT_INTEGRATION_TEST_FILE_PATTERNS,
  extends: [
    vitest.configs.recommended,
    {
      name: 'ng-rspack-build/vitest/globals',
      languageOptions: {
        globals: vitest.environments.env.globals,
      },
    },
    {
      name: 'ng-rspack-build/vitest/jest-formatting',
      plugins: {
        'jest-formatting': jestFormatting,
      },
      // formatting is code style and has to be warning severity see: [eslint strategy](../../../docs/linting/eslint.md)
      rules: convertErrorsToWarnings(
        jestFormatting.configs.recommended.overrides?.[0]?.rules
      ),
    },
    {
      name: 'ng-rspack-build/vitest/customized',
      rules: {
        'vitest/prefer-to-be': 'warn',
      },
    },
    {
      name: 'ng-rspack-build/vitest/additional',
      rules: {
        // https://github.com/veritem/eslint-plugin-vitest#rules
        'vitest/consistent-test-filename': [
          'warn',
          {
            pattern: String.raw`.*\.(e2e|unit|integration)\.test\.[tj]sx?$`,
            allTestPattern: String.raw`.*\.(test|spec)\.[tj]sx?$`,
          },
        ],
        'vitest/consistent-test-it': 'warn',
        'vitest/max-nested-describe': ['warn', { max: 2 }],
        'vitest/no-alias-methods': 'warn',
        'vitest/no-conditional-tests': 'warn',
        'vitest/no-conditional-expect': 'warn',
        'vitest/no-disabled-tests': 'warn',
        'vitest/no-focused-tests': 'warn',
        'vitest/no-done-callback': 'warn',
        'vitest/no-duplicate-hooks': 'warn',
        'vitest/no-mocks-import': 'warn',
        'vitest/no-standalone-expect': 'warn',
        'vitest/no-test-return-statement': 'warn',
        'vitest/prefer-comparison-matcher': 'warn',
        'vitest/prefer-each': 'warn',
        'vitest/prefer-expect-resolves': 'warn',
        'vitest/prefer-equality-matcher': 'warn',
        'vitest/prefer-hooks-on-top': 'warn',
        'vitest/prefer-mock-promise-shorthand': 'warn',
        'vitest/prefer-spy-on': 'warn',
        'vitest/prefer-to-contain': 'warn',
        'vitest/prefer-to-have-length': 'warn',
        'vitest/prefer-todo': 'warn',
        'vitest/require-hook': 'warn',
        'vitest/require-to-throw-message': 'warn',
        'vitest/require-top-level-describe': 'warn',
      },
    },
  ],
});
