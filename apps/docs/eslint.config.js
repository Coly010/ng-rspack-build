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
      // ⚠️ Warnings: 1
      '@typescript-eslint/no-unused-vars': 'off', // ⚠️ 6 warnings
    },
  },
];
