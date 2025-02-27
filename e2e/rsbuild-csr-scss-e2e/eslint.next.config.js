const baseConfig = require('../../eslint.config');
const playwright = require('../../eslint/src/lib/config/playwright.js');

module.exports = [
  ...baseConfig,
  ...playwright,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*'],
    rules: {},
  },
];
