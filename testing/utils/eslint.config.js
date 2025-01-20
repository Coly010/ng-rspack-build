const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
    files: ['**/*'],
    rules: {
      // ❌ Errors: 1
      '@nx/dependency-checks': 'off', // ❌ 1 error 🛠️
    }
  }
];