const nextEslintConfig = require('./eslint.next.config');

// 🚨 DO NOT EDIT THIS FILE MANUALLY! 🚨
// Run `pnpm eslint-next/nx` to update or remove this file if all rules pass.
// Add new rules globally to the `eslint.config.js` or locally to the `eslint.next.config.js` file.
// For details, refer to: tools/scripts/eslint-next/README.md
module.exports = [
  ...nextEslintConfig,
  {
    files: ['**/*'],
    rules: {
      // ❌ Errors: 4
      'import/no-commonjs': 'off', // ❌ 32 errors
      '@typescript-eslint/no-require-imports': 'off', // ❌ 25 errors
      '@typescript-eslint/no-unused-vars': 'off', // ❌ 2 errors
      'sonarjs/no-commented-code': 'off', // ❌ 2 errors
      // ⚠️ Warnings: 1
      '@typescript-eslint/no-magic-numbers': 'off', // ⚠️ 4 warnings
    },
  },
];
