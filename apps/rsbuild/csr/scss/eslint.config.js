const nextEslintConfig = require('./eslint.next.config');

module.exports = [
  ...nextEslintConfig,
  {
        files: ["**/*"],
        rules: {
          // ❌ Errors: 0
          
          // ⚠️ Warnings: 1
                "@typescript-eslint/no-explicit-any": "off", // ⚠️ 1 warning
        }
      }
];