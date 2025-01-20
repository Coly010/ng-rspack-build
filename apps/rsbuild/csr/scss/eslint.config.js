const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
    {
    files: ["**/*"],
    rules: {
      // ⚠️ Warnings: 1
      "@typescript-eslint/no-explicit-any": "off", // ⚠️ 1 warning
    }
  }
];