const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
    files: ['**/*'],
    rules: {
      // ⚠️ Warnings: 2
      '@typescript-eslint/no-non-null-assertion': 'off', // ⚠️ 12 warnings
      '@typescript-eslint/no-explicit-any': 'off', // ⚠️ 1 warning
    },
  },
];
