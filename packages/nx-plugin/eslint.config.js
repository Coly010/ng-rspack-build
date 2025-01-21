const nextEslintConfig = require('./eslint.next.config');

// 🚨 DO NOT EDIT THIS FILE MANUALLY! 🚨
// Run `pnpm eslint-migration-plan` to update or remove this file if all rules pass.
// Add new rules globally to the `eslint.config.js` or locally to the `eslint.next.config.js` file.
// For details, refer to: tools/scripts/eslint-migration/README.md
module.exports = [
  ...nextEslintConfig,
  {
    files: ['**/*'],
    rules: {
      // ⚠️ Warnings: 2
      '@typescript-eslint/no-non-null-assertion': 'off', // ⚠️ 12 warnings
      '@typescript-eslint/no-explicit-any': 'off', // ⚠️ 4 warnings
    },
  },
];
