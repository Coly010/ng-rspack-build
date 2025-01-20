const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
    files: ['**/*'],
    rules: {
      // ❌ Errors: 0

      // ⚠️ Warnings: 3
      '@typescript-eslint/no-explicit-any': 'off', // ⚠️ 5 warnings
      '@typescript-eslint/no-unused-vars': 'off', // ⚠️ 5 warnings
      '@typescript-eslint/no-non-null-assertion': 'off', // ⚠️ 4 warnings
    },
  },
];
