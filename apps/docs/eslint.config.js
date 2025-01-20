const nextEslintConfig = require('./eslint.next.config');

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
