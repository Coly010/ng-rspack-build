const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
        files: ["**/*"],
        rules: {
          // ❌ Errors: 0
          
          // ⚠️ Warnings: 1
                "@typescript-eslint/no-unused-vars": "off", // ⚠️ 6 warnings
        }
      }
];