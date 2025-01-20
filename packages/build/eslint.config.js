const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
    files: ["**/*"],
    rules: {
      // ⚠️ Warnings: 3
      "@typescript-eslint/no-explicit-any": "off", // ⚠️ 18 warnings
      "@typescript-eslint/no-non-null-assertion": "off", // ⚠️ 7 warnings
      "@typescript-eslint/no-unused-vars": "off", // ⚠️ 2 warnings
    }
  }
];