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
      // ❌ Errors: 1
      '@nx/dependency-checks': 'off', // ❌ 1 error 🛠️
    },
  },
];
