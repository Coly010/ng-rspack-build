const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
    files: ["**/*"],
    rules: {
      // ❌ Errors: 1
      "no-var": "off", // ❌ 2 errors 🛠️
      // ⚠️ Warnings: 1
      "@typescript-eslint/no-non-null-assertion": "off", // ⚠️ 3 warnings
    }
  }
];