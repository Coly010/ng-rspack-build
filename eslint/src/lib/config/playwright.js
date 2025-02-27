const jestFormatting = require('eslint-plugin-jest-formatting');
const playwright = require('eslint-plugin-playwright');
const tseslint = require('typescript-eslint');
const { PLAYWRIGHT_FILE_PATTERNS } = require('../utils/patterns.js');

module.exports = tseslint.config({
  files: PLAYWRIGHT_FILE_PATTERNS,
  extends: [
    playwright.configs['flat/recommended'],
    {
      name: 'code-pushup/playwright/jest-formatting',
      plugins: {
        'jest-formatting': jestFormatting,
      },
      rules: {
        'jest-formatting/padding-around-describe-blocks': 'warn',
        'jest-formatting/padding-around-test-blocks': 'warn',
      },
    },
    {
      name: 'code-pushup/playwright/customized',
      rules: {
        'playwright/no-conditional-expect': 'warn',
        'playwright/no-conditional-in-test': 'warn',
        'playwright/no-focused-test': 'warn',
        'playwright/no-standalone-expect': 'warn',
      },
    },
    {
      name: 'code-pushup/playwright/additional',
      rules: {
        'playwright/no-commented-out-tests': 'warn',
        'playwright/no-duplicate-hooks': 'warn',
        'playwright/no-nested-step': 'warn',
        'playwright/prefer-comparison-matcher': 'warn',
        'playwright/prefer-equality-matcher': 'warn',
        'playwright/prefer-hooks-in-order': 'warn',
        'playwright/prefer-hooks-on-top': 'warn',
        'playwright/prefer-native-locators': 'warn',
        'playwright/prefer-locator': 'warn',
        'playwright/prefer-to-be': 'warn',
        'playwright/prefer-to-contain': 'warn',
        'playwright/prefer-to-have-count': 'warn',
        'playwright/prefer-to-have-length': 'warn',
        'playwright/require-hook': 'warn',
        'playwright/require-to-throw-message': 'warn',
      },
    },
  ],
});
